import { useEffect, useMemo, useState } from 'react'

import {
  ArrowRight,
  Calculator,
  CheckCircle2,
  Plus,
  Sparkles,
  VectorSquare,
} from 'lucide-react'

import {
  createOperation,
  createVector,
  getDashboard,
  getInventory,
  getProducts,
  getVectors,
  type Vector,
} from '../services/api'

// ============================================================
// CONFIGURACIÓN
// ============================================================

// Empresa utilizada actualmente para los registros matemáticos.
// Este valor se conserva para no modificar la lógica existente.
const DEFAULT_COMPANY_ID = 2

// Operaciones vectoriales disponibles en el módulo.
const VECTOR_OPERATIONS = [
  {
    value: 'sum_vector',
    label: 'Suma de vectores',
  },
  {
    value: 'subtract_vector',
    label: 'Resta de vectores',
  },
  {
    value: 'dot_product',
    label: 'Producto punto',
  },
]

// ============================================================
// FUENTES DE DATOS EMPRESARIALES
// ============================================================
//
// Estas opciones permiten construir vectores utilizando datos
// reales almacenados en PostgreSQL.
//
// El usuario ya no necesita escribir únicamente números
// genéricos como "1, 2, 3, 4".
// ============================================================

const BUSINESS_VECTOR_SOURCES = [
  {
    value: 'sales_quantity',
    label: 'Unidades vendidas por producto',
  },
  {
    value: 'sales_total',
    label: 'Importe vendido por producto',
  },
  {
    value: 'inventory_stock',
    label: 'Stock total por producto',
  },
  {
    value: 'product_price',
    label: 'Precio actual por producto',
  },
] as const

type BusinessVectorSource =
  typeof BUSINESS_VECTOR_SOURCES[number]['value']

interface BusinessVectorPreview {
  name: string
  description: string
  labels: string[]
  values: number[]
}

// ============================================================
// COMPONENTE
// ============================================================

function Vectores() {
  // Lista de vectores registrados.
  const [vectors, setVectors] = useState<Vector[]>([])

  // Estados generales de la pantalla.
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [calculating, setCalculating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // ==========================================================
  // FORMULARIO DE VECTOR
  // ==========================================================

  const [vectorName, setVectorName] = useState('')
  const [vectorDescription, setVectorDescription] = useState('')

  // Los componentes se introducen como texto separado por comas.
  // Ejemplo: "1, 2, 3" se convierte internamente en [1, 2, 3].
  const [vectorValues, setVectorValues] = useState('')

  // ==========================================================
  // OPERACIONES
  // ==========================================================

  // Vector seleccionado como primera entrada.
  const [firstVectorId, setFirstVectorId] = useState('')

  // Vector seleccionado como segunda entrada.
  const [secondVectorId, setSecondVectorId] = useState('')

  // Operación matemática seleccionada.
  const [operationType, setOperationType] = useState('sum_vector')

  // Resultado de la operación seleccionada.
  const [operationResult, setOperationResult] = useState<unknown>(null)

  // ==========================================================
  // VECTOR GENERADO DESDE DATOS EMPRESARIALES
  // ==========================================================

  // Fuente seleccionada por el usuario.
  const [businessSource, setBusinessSource] =
    useState<BusinessVectorSource>('sales_quantity')

  // Vista previa antes de guardar el vector.
  const [businessPreview, setBusinessPreview] =
    useState<BusinessVectorPreview | null>(null)

  // Estado de generación y guardado.
  const [generatingBusinessVector, setGeneratingBusinessVector] =
    useState(false)

  const [savingBusinessVector, setSavingBusinessVector] =
    useState(false)

  // ==========================================================
  // CARGAR VECTORES
  // ==========================================================

  useEffect(() => {
    const loadVectors = async () => {
      try {
        setLoading(true)
        setError('')

        // Obtenemos los vectores registrados.
        const data = await getVectors()

        setVectors(data)
      } catch (requestError) {
        console.error('Error al cargar vectores:', requestError)

        setError(
          requestError instanceof Error
            ? requestError.message
            : 'No se pudieron cargar los vectores.',
        )
      } finally {
        setLoading(false)
      }
    }

    loadVectors()
  }, [])

  // ==========================================================
  // VECTORES SELECCIONADOS
  // ==========================================================

  // Buscamos el primer vector seleccionado.
  const selectedFirstVector = useMemo(
    () =>
      vectors.find(
        (vector) => vector.id === Number(firstVectorId),
      ),
    [vectors, firstVectorId],
  )

  // Buscamos el segundo vector seleccionado.
  const selectedSecondVector = useMemo(
    () =>
      vectors.find(
        (vector) => vector.id === Number(secondVectorId),
      ),
    [vectors, secondVectorId],
  )

  // ==========================================================
  // CONVERTIR TEXTO A VECTOR
  // ==========================================================

  const parseVectorValues = (
    text: string,
  ): number[] | null => {
    // Separamos los componentes utilizando comas.
    const parts = text
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)

    // No permitimos un vector vacío.
    if (parts.length === 0) {
      return null
    }

    // Convertimos cada componente a número.
    const numbers = parts.map(Number)

    // Validamos que todos los componentes sean números válidos.
    if (
      numbers.some(
        (value) => !Number.isFinite(value),
      )
    ) {
      return null
    }

    return numbers
  }

  // ==========================================================
  // GENERAR VECTOR DESDE DATOS EMPRESARIALES
  // ==========================================================

  const handleGenerateBusinessVector = async () => {
    try {
      setGeneratingBusinessVector(true)
      setError('')
      setSuccess('')
      setBusinessPreview(null)

      // ------------------------------------------------------
      // VENTAS POR PRODUCTO
      // ------------------------------------------------------

      if (
        businessSource === 'sales_quantity' ||
        businessSource === 'sales_total'
      ) {
        // El Dashboard ya recibe información agregada
        // desde sale_details mediante FastAPI.
        const dashboard = await getDashboard()

        // Ordenamos por ID para conservar siempre el mismo
        // orden de productos entre distintos vectores.
        const rows = [...dashboard.sales_by_product].sort(
          (first, second) =>
            first.product_id - second.product_id,
        )

        if (rows.length === 0) {
          throw new Error(
            'No existen ventas por producto para generar el vector.',
          )
        }

        const labels = rows.map(
          (item) => item.product_name,
        )

        if (businessSource === 'sales_quantity') {
          setBusinessPreview({
            name: 'Unidades vendidas por producto',

            // Guardamos también el orden de los componentes.
            // Esto permite interpretar posteriormente el vector.
            description:
              'Unidades vendidas por producto. Ordenado por ID de producto ascendente.',

            labels,

            values: rows.map(
              (item) => Number(item.quantity),
            ),
          })
        } else {
          setBusinessPreview({
            name: 'Importe vendido por producto',
            description:
              'Importe acumulado de ventas por producto. Ordenado por ID de producto ascendente.',
            labels,
            values: rows.map(
              (item) => Number(item.total),
            ),
          })
        }

        return
      }

      // ------------------------------------------------------
      // PRODUCTOS E INVENTARIO
      // ------------------------------------------------------

      const [products, inventory] = await Promise.all([
        getProducts(),
        getInventory(),
      ])

      // Ordenamos los productos por ID para que todos los
      // vectores empresariales conserven el mismo orden.
      const orderedProducts = [...products].sort(
        (first, second) => first.id - second.id,
      )

      if (orderedProducts.length === 0) {
        throw new Error(
          'No existen productos para generar el vector.',
        )
      }

      const labels = orderedProducts.map(
        (product) => product.name,
      )

      // ------------------------------------------------------
      // STOCK TOTAL POR PRODUCTO
      // ------------------------------------------------------

      if (businessSource === 'inventory_stock') {
        const values = orderedProducts.map((product) => {
          // Un producto puede estar presente en varias sucursales.
          // Sumamos el stock disponible en todas ellas.
          return inventory
            .filter(
              (item) =>
                item.product_id === product.id,
            )
            .reduce(
              (total, item) =>
                total + Number(item.stock),
              0,
            )
        })

        setBusinessPreview({
          name: 'Stock total por producto',

          // Mantenemos la descripción corta porque PostgreSQL
          // admite hasta 255 caracteres en vectors.description.
          // El orden siempre corresponde al ID de producto ascendente.
          description:
            'Stock actual acumulado por producto. Ordenado por ID de producto ascendente.',

          labels,
          values,
        })
        return
      }

      // ------------------------------------------------------
      // PRECIO ACTUAL POR PRODUCTO
      // ------------------------------------------------------

      setBusinessPreview({
        name: 'Precio actual por producto',

        // Evitamos almacenar una lista extensa de nombres
        // dentro de la descripción del vector.
        description:
          'Precios actuales por producto. Ordenado por ID de producto ascendente.',

        labels,

        values: orderedProducts.map(
          (product) => Number(product.price),
        ),
      })
    } catch (requestError) {
      console.error(
        'Error al generar vector empresarial:',
        requestError,
      )

      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No se pudo generar el vector empresarial.',
      )
    } finally {
      setGeneratingBusinessVector(false)
    }
  }

  // ==========================================================
  // GUARDAR VECTOR EMPRESARIAL
  // ==========================================================

  const handleSaveBusinessVector = async () => {
    if (!businessPreview) {
      return
    }

    try {
      setSavingBusinessVector(true)
      setError('')
      setSuccess('')

      // Guardamos los valores reales utilizando el endpoint
      // POST /api/v1/vectors.
      await createVector({
        company_id: DEFAULT_COMPANY_ID,
        name: businessPreview.name,
        description: businessPreview.description,
        values: businessPreview.values,
      })

      // Volvemos a consultar PostgreSQL para actualizar
      // inmediatamente la tabla de vectores.
      const updatedVectors = await getVectors()

      setVectors(updatedVectors)
      setBusinessPreview(null)

      setSuccess(
        'Vector empresarial registrado correctamente.',
      )
    } catch (requestError) {
      console.error(
        'Error al guardar vector empresarial:',
        requestError,
      )

      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No se pudo guardar el vector empresarial.',
      )
    } finally {
      setSavingBusinessVector(false)
    }
  }

  // ==========================================================
  // REGISTRAR VECTOR
  // ==========================================================

  const handleCreateVector = async () => {
    const values = parseVectorValues(vectorValues)

    // Validamos el nombre antes de registrar el vector.
    if (!vectorName.trim()) {
      setError('Ingresa un nombre para el vector.')
      return
    }

    // Validamos los componentes numéricos.
    if (!values) {
      setError(
        'Ingresa valores numéricos separados por comas.',
      )
      return
    }

    try {
      setSaving(true)
      setError('')
      setSuccess('')

      // Creamos el vector conservando la estructura actual.
      await createVector({
        company_id: DEFAULT_COMPANY_ID,
        name: vectorName.trim(),
        description: vectorDescription.trim() || null,
        values,
      })

      // Actualizamos la lista para mostrar el nuevo registro.
      const updatedVectors = await getVectors()

      setVectors(updatedVectors)

      // Limpiamos el formulario después de guardar.
      setVectorName('')
      setVectorDescription('')
      setVectorValues('')

      setSuccess('Vector registrado correctamente.')
    } catch (requestError) {
      console.error('Error al registrar vector:', requestError)

      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No se pudo registrar el vector.',
      )
    } finally {
      setSaving(false)
    }
  }

  // ==========================================================
  // EJECUTAR OPERACIÓN
  // ==========================================================

  const handleOperation = async () => {
    // Las operaciones actuales requieren dos vectores.
    if (!selectedFirstVector) {
      setError('Selecciona el primer vector.')
      return
    }

    if (!selectedSecondVector) {
      setError('Selecciona el segundo vector.')
      return
    }

    try {
      setCalculating(true)
      setError('')
      setSuccess('')
      setOperationResult(null)

      // Obtenemos el nombre legible de la operación.
      const operationLabel =
        VECTOR_OPERATIONS.find(
          (item) => item.value === operationType,
        )?.label ?? 'Operación vectorial'

      // Las operaciones conservan el formato esperado actualmente.
      // Los valores se envían como matrices de una fila.
      const operation = await createOperation({
        company_id: DEFAULT_COMPANY_ID,
        name: operationLabel,
        operation_type: operationType,

        // Primer vector.
        first_values: [
          selectedFirstVector.values,
        ],

        // Segundo vector.
        second_values: [
          selectedSecondVector.values,
        ],

        // Referencias de los vectores seleccionados.
        first_vector_id: selectedFirstVector.id,
        second_vector_id: selectedSecondVector.id,
      })

      // Mostramos el resultado recibido.
      setOperationResult(operation.result)

      setSuccess('Operación ejecutada correctamente.')
    } catch (requestError) {
      console.error(
        'Error al ejecutar operación:',
        requestError,
      )

      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No se pudo ejecutar la operación.',
      )
    } finally {
      setCalculating(false)
    }
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-full bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">

        {/* Resumen del módulo sin repetir el título del Header. */}
        <div className="mb-6 flex justify-end">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <VectorSquare className="h-5 w-5 text-cyan-600" />

            <div>
              <p className="text-xs font-medium text-slate-500">
                Vectores registrados
              </p>

              <p className="text-lg font-bold text-slate-900">
                {vectors.length}
              </p>
            </div>
          </div>
        </div>

        {/* Mensaje de error. */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-red-500" />

            <div>
              <p className="font-semibold">
                No se pudo completar la operación
              </p>

              <p className="mt-1 text-red-600">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Mensaje de éxito. */}
        {success && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            <CheckCircle2 className="h-5 w-5 shrink-0" />

            <span className="font-medium">
              {success}
            </span>
          </div>
        )}

        {/* =====================================================
    VECTOR DESDE DATOS EMPRESARIALES
    ===================================================== */}
        <section className="mb-6 overflow-hidden rounded-2xl border border-cyan-200 bg-white shadow-sm">
          <div className="border-b border-cyan-100 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50">
                <Sparkles className="h-5 w-5 text-cyan-600" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Generar vector desde datos empresariales
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Convierte información real de ventas, productos e inventario en vectores.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end">
              <div className="flex-1">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Fuente de información
                </label>

                <select
                  value={businessSource}
                  onChange={(event) => {
                    setBusinessSource(
                      event.target.value as BusinessVectorSource,
                    )

                    // Eliminamos la vista previa anterior
                    // cuando cambia la fuente.
                    setBusinessPreview(null)
                  }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
                >
                  {BUSINESS_VECTOR_SOURCES.map((source) => (
                    <option
                      key={source.value}
                      value={source.value}
                    >
                      {source.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleGenerateBusinessVector}
                disabled={generatingBusinessVector}
                className="rounded-xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:bg-slate-400"
              >
                {generatingBusinessVector
                  ? 'Generando...'
                  : 'Generar vector'}
              </button>
            </div>

            {businessPreview && (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="font-bold text-slate-900">
                  {businessPreview.name}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Datos obtenidos directamente del sistema.
                </p>

                <div className="mt-5 overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr>
                        {businessPreview.labels.map(
                          (label) => (
                            <th
                              key={label}
                              className="px-3 py-2 text-left text-xs font-semibold text-slate-500"
                            >
                              {label}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>

                    <tbody>
                      <tr>
                        {businessPreview.values.map(
                          (value, index) => (
                            <td
                              key={`${index}-${value}`}
                              className="px-3 py-2 font-mono text-sm font-bold text-slate-900"
                            >
                              {value}
                            </td>
                          ),
                        )}
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-5 rounded-xl bg-slate-900 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Vector resultante
                  </p>

                  <code className="mt-2 block text-sm text-white">
                    [{businessPreview.values.join(', ')}]
                  </code>
                </div>

                <div className="mt-5 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveBusinessVector}
                    disabled={savingBusinessVector}
                    className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white disabled:bg-slate-400"
                  >
                    {savingBusinessVector
                      ? 'Guardando...'
                      : 'Guardar vector empresarial'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* =====================================================
            REGISTRO DE VECTOR
            ===================================================== */}
        <section className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                <Plus className="h-5 w-5 text-slate-700" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Registrar vector
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Define un nuevo conjunto de componentes numéricos.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              {/* Nombre del vector. */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Nombre
                </label>

                <input
                  type="text"
                  value={vectorName}
                  onChange={(event) =>
                    setVectorName(event.target.value)
                  }
                  placeholder="Ej. Vector A"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                />
              </div>

              {/* Descripción opcional. */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Descripción
                </label>

                <input
                  type="text"
                  value={vectorDescription}
                  onChange={(event) =>
                    setVectorDescription(
                      event.target.value,
                    )
                  }
                  placeholder="Descripción opcional"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                />
              </div>

              {/* Componentes del vector. */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Componentes
                </label>

                <input
                  type="text"
                  value={vectorValues}
                  onChange={(event) =>
                    setVectorValues(
                      event.target.value,
                    )
                  }
                  placeholder="Ej. 1, 2, 3, 4"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-mono text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                />

                <p className="mt-2 text-xs text-slate-400">
                  Separa cada componente utilizando comas.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handleCreateVector}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                <Plus className="h-4 w-4" />

                {saving
                  ? 'Guardando...'
                  : 'Guardar vector'}
              </button>
            </div>
          </div>
        </section>

        {/* =====================================================
            VECTORES REGISTRADOS
            ===================================================== */}
        <section className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Vectores registrados
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Consulta los vectores disponibles para tus análisis.
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
                {vectors.length} registrados
              </div>
            </div>
          </div>

          {loading ? (
            /* Skeleton para evitar una pantalla vacía durante la carga. */
            <div className="space-y-3 p-6">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-14 animate-pulse rounded-xl bg-slate-100"
                />
              ))}
            </div>
          ) : vectors.length === 0 ? (
            /* Estado vacío cuando todavía no existen vectores. */
            <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                <VectorSquare className="h-6 w-6 text-slate-400" />
              </div>

              <h3 className="font-semibold text-slate-900">
                No hay vectores registrados
              </h3>

              <p className="mt-1 max-w-sm text-sm text-slate-500">
                Registra tu primer vector utilizando el formulario superior.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead className="border-b border-slate-100 bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Vector
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Dimensión
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Componentes
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Descripción
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {vectors.map((vector) => (
                    <tr
                      key={vector.id}
                      className="transition hover:bg-slate-50"
                    >
                      {/* Identificación del vector. */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
                            V{vector.id}
                          </div>

                          <div>
                            <p className="font-semibold text-slate-900">
                              {vector.name}
                            </p>

                            <p className="text-xs text-slate-400">
                              ID #{vector.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Dimensión matemática. */}
                      <td className="px-6 py-4">
                        <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700">
                          {vector.dimension}
                        </span>
                      </td>

                      {/* Representación visual de los componentes. */}
                      <td className="px-6 py-4">
                        <code className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white">
                          [{vector.values.join(', ')}]
                        </code>
                      </td>

                      {/* Descripción opcional. */}
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {vector.description ?? 'Sin descripción'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* =====================================================
            OPERACIONES MATEMÁTICAS
            ===================================================== */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50">
                <Calculator className="h-5 w-5 text-cyan-600" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Operaciones con vectores
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Selecciona dos vectores y define la operación que deseas realizar.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">

            {/* Selección de vectores y operación. */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

              {/* Primer vector. */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Primer vector
                </label>

                <select
                  value={firstVectorId}
                  onChange={(event) =>
                    setFirstVectorId(
                      event.target.value,
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                >
                  <option value="">
                    Seleccionar vector
                  </option>

                  {vectors.map((vector) => (
                    <option
                      key={vector.id}
                      value={vector.id}
                    >
                      {vector.name} — [
                      {vector.values.join(', ')}
                      ]
                    </option>
                  ))}
                </select>
              </div>

              {/* Operación matemática. */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Operación
                </label>

                <select
                  value={operationType}
                  onChange={(event) =>
                    setOperationType(
                      event.target.value,
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                >
                  {VECTOR_OPERATIONS.map(
                    (operation) => (
                      <option
                        key={operation.value}
                        value={operation.value}
                      >
                        {operation.label}
                      </option>
                    ),
                  )}
                </select>
              </div>

              {/* Segundo vector. */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Segundo vector
                </label>

                <select
                  value={secondVectorId}
                  onChange={(event) =>
                    setSecondVectorId(
                      event.target.value,
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                >
                  <option value="">
                    Seleccionar vector
                  </option>

                  {vectors.map((vector) => (
                    <option
                      key={vector.id}
                      value={vector.id}
                    >
                      {vector.name} — [
                      {vector.values.join(', ')}
                      ]
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Botón para ejecutar la operación. */}
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handleOperation}
                disabled={calculating}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                <Sparkles className="h-4 w-4" />

                {calculating
                  ? 'Calculando...'
                  : 'Ejecutar operación'}

                {!calculating && (
                  <ArrowRight className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Resultado de la operación. */}
            {operationResult !== null && (
              <div className="mt-6 overflow-hidden rounded-2xl border border-cyan-200 bg-cyan-50">
                <div className="flex items-center gap-3 border-b border-cyan-100 px-5 py-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white">
                    <CheckCircle2 className="h-5 w-5 text-cyan-600" />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Resultado de la operación
                    </p>

                    <p className="text-xs text-slate-500">
                      Cálculo completado correctamente
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto px-5 py-6">
                  <code className="text-xl font-bold tracking-wide text-slate-900">
                    {Array.isArray(operationResult)
                      ? `[${operationResult.join(', ')}]`
                      : String(operationResult)}
                  </code>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default Vectores