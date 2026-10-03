import { Fragment, useEffect, useState } from 'react'

import {
  CheckCircle2,
  ChevronDown,
  Info,
  Plus,
  Sparkles,
  VectorSquare,
} from 'lucide-react'

import {
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

  // ID de la fila de vector que está desplegada.
  // Solo mantenemos una abierta a la vez.
  const [
    expandedVectorId,
    setExpandedVectorId,
  ] = useState<number | null>(null)

  // Referencias utilizadas para interpretar los componentes
  // de los vectores empresariales ya registrados.
  const [
    productReferenceLabels,
    setProductReferenceLabels,
  ] = useState<string[]>([])

  const [
    salesReferenceLabels,
    setSalesReferenceLabels,
  ] = useState<string[]>([])

  // Estados generales de la pantalla.
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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

        // Obtenemos primero los vectores registrados.
        const data = await getVectors()

        setVectors(data)

        // Las referencias empresariales son complementarias.
        // Si alguna consulta falla, la tabla sigue funcionando.
        const [
          productsResult,
          dashboardResult,
        ] = await Promise.allSettled([
          getProducts(),
          getDashboard(),
        ])

        if (
          productsResult.status ===
          'fulfilled'
        ) {
          const orderedProducts =
            [...productsResult.value].sort(
              (first, second) =>
                first.id - second.id,
            )

          setProductReferenceLabels(
            orderedProducts.map(
              (product) =>
                product.name,
            ),
          )
        }

        if (
          dashboardResult.status ===
          'fulfilled'
        ) {
          const orderedSalesRows =
            [
              ...dashboardResult.value
                .sales_by_product,
            ].sort(
              (first, second) =>
                first.product_id -
                second.product_id,
            )

          setSalesReferenceLabels(
            orderedSalesRows.map(
              (item) =>
                item.product_name,
            ),
          )
        }
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
  // INTERPRETAR VECTORES REGISTRADOS
  // ==========================================================

  const getRegisteredVectorLabels = (
    vector: Vector,
  ): string[] | null => {
    const normalizedName =
      vector.name
        .trim()
        .toLowerCase()

    // Stock y precio se construyen usando todos los productos
    // ordenados por ID ascendente.
    if (
      normalizedName ===
      'stock total por producto' ||
      normalizedName ===
      'precio actual por producto'
    ) {
      if (
        productReferenceLabels.length <
        vector.values.length
      ) {
        return null
      }

      return productReferenceLabels.slice(
        0,
        vector.values.length,
      )
    }

    // Los vectores derivados de ventas usan sales_by_product,
    // también ordenado por ID de producto ascendente.
    if (
      normalizedName ===
      'unidades vendidas por producto' ||
      normalizedName ===
      'importe vendido por producto'
    ) {
      if (
        salesReferenceLabels.length <
        vector.values.length
      ) {
        return null
      }

      return salesReferenceLabels.slice(
        0,
        vector.values.length,
      )
    }

    // Un vector manual no almacena actualmente el significado
    // semántico de cada componente.
    return null
  }

  const toggleRegisteredVector = (
    vectorId: number,
  ) => {
    setExpandedVectorId(
      (current) =>
        current === vectorId
          ? null
          : vectorId,
    )
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-full bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">

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
                  Consulta los vectores disponibles y presiona una fila
                  para interpretar sus componentes.
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
            <div className="overflow-hidden">
              <table className="w-full table-fixed text-left">
                <thead className="border-b border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
                  <tr>
                    <th className="w-[24%] px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Vector
                    </th>

                    <th className="w-[12%] px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Dimensión
                    </th>

                    <th className="w-[34%] px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Componentes
                    </th>

                    <th className="w-[30%] px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Descripción
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {vectors.map((vector) => {
                    const isExpanded =
                      expandedVectorId ===
                      vector.id

                    const referenceLabels =
                      getRegisteredVectorLabels(
                        vector,
                      )

                    return (
                      <Fragment key={vector.id}>
                        <tr
                          role="button"
                          tabIndex={0}
                          aria-expanded={isExpanded}
                          onClick={() =>
                            toggleRegisteredVector(
                              vector.id,
                            )
                          }
                          onKeyDown={(event) => {
                            if (
                              event.key === 'Enter' ||
                              event.key === ' '
                            ) {
                              event.preventDefault()

                              toggleRegisteredVector(
                                vector.id,
                              )
                            }
                          }}
                          className={`
                            cursor-pointer
                            transition-colors
                            duration-150

                            ${isExpanded
                              ? 'bg-blue-50/70 dark:bg-blue-950/30'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                            }
                          `}
                        >
                          {/* Identificación del vector. */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
                                V{vector.id}
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-slate-900 dark:text-slate-100">
                                  {vector.name}
                                </p>

                                <p className="text-xs text-slate-400 dark:text-slate-500">
                                  ID #{vector.id}
                                </p>
                              </div>

                              <ChevronDown
                                size={17}
                                className={`
                                  shrink-0
                                  text-slate-400
                                  transition-transform
                                  duration-200

                                  ${isExpanded
                                    ? 'rotate-180 text-blue-600'
                                    : ''
                                  }
                                `}
                              />
                            </div>
                          </td>

                          {/* Dimensión matemática. */}
                          <td className="px-6 py-4">
                            <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              {vector.dimension}
                            </span>
                          </td>

                          {/* Componentes del vector. */}
                          <td className="px-6 py-4">
                            <code className="block max-w-full whitespace-normal break-words rounded-lg bg-slate-900 px-3 py-2 text-sm leading-6 text-white dark:bg-slate-950">
                              [{vector.values.join(', ')}]
                            </code>
                          </td>

                          {/* Descripción opcional. */}
                          <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                            {vector.description ??
                              'Sin descripción'}
                          </td>
                        </tr>

                        {/* Detalle desplegable del vector. */}
                        {isExpanded && (
                          <tr className="bg-slate-50/80 dark:bg-slate-950/40">
                            <td
                              colSpan={4}
                              className="px-6 pb-6 pt-2"
                            >
                              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                                <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                    Significado de los componentes
                                  </p>

                                  <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                                    Cada valor conserva la misma posición
                                    utilizada al generar el vector.
                                  </p>
                                </div>

                                {referenceLabels ? (
                                  <div className="vector-detail-scroll overflow-x-auto pb-2">
                                    <table className="min-w-max text-left">
                                      <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/70">
                                          {referenceLabels.map(
                                            (
                                              label,
                                              index,
                                            ) => (
                                              <th
                                                key={`${vector.id}-${index}-${label}`}
                                                className="min-w-[180px] max-w-[240px] px-4 py-3 align-bottom text-xs font-semibold leading-5 text-slate-600 dark:text-slate-300"
                                              >
                                                {label}
                                              </th>
                                            ),
                                          )}
                                        </tr>
                                      </thead>

                                      <tbody>
                                        <tr>
                                          {vector.values.map(
                                            (
                                              value,
                                              index,
                                            ) => (
                                              <td
                                                key={`${vector.id}-${index}-${value}`}
                                                className="px-4 py-4"
                                              >
                                                <span className="inline-flex min-w-10 items-center justify-center rounded-lg bg-slate-900 px-3 py-1.5 font-mono text-sm font-bold text-white dark:bg-slate-950">
                                                  {value}
                                                </span>
                                              </td>
                                            ),
                                          )}
                                        </tr>
                                      </tbody>
                                    </table>
                                  </div>
                                ) : (
                                  <div className="flex items-start gap-3 px-5 py-5">
                                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
                                      <Info size={17} />
                                    </div>

                                    <div>
                                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                        Referencias no disponibles
                                      </p>

                                      <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500">
                                        Este vector no conserva etiquetas
                                        semánticas para sus componentes.
                                        Puede tratarse de un vector manual
                                        o de una referencia empresarial que
                                        ya no coincide con los datos actuales.
                                      </p>

                                      <div className="mt-4 flex flex-wrap gap-2">
                                        {vector.values.map(
                                          (
                                            value,
                                            index,
                                          ) => (
                                            <span
                                              key={`${vector.id}-position-${index}`}
                                              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                            >
                                              Componente {index + 1}:{' '}
                                              <strong className="font-mono text-slate-900 dark:text-white">
                                                {value}
                                              </strong>
                                            </span>
                                          ),
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>


      </div>
    </div>
  )
}

export default Vectores