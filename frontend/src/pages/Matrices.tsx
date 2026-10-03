import { Fragment, useEffect, useState } from 'react'

import {
  ChevronDown,
  Info,
  Sparkles,
  Table2,
} from 'lucide-react'

import {
  createMatrix,
  getBranches,
  getInventory,
  getMatrices,
  getProducts,
  type Matrix,
} from '../services/api'

// Empresa utilizada actualmente para registrar las operaciones.
// Se mantiene para conservar la integración existente.
const DEFAULT_COMPANY_ID = 2

// ============================================================
// FUENTES DE DATOS EMPRESARIALES
// ============================================================
//
// Cada fuente permite transformar información real de
// PostgreSQL en una matriz Sucursal × Producto.
// ============================================================

const BUSINESS_MATRIX_SOURCES = [
  {
    value: 'inventory_stock',
    label: 'Stock actual por sucursal y producto',
  },
  {
    value: 'minimum_stock',
    label: 'Stock mínimo por sucursal y producto',
  },
  {
    value: 'inventory_value',
    label: 'Valor del inventario por sucursal y producto',
  },
] as const

type BusinessMatrixSource =
  typeof BUSINESS_MATRIX_SOURCES[number]['value']

interface BusinessMatrixPreview {
  name: string
  description: string

  // Etiquetas de las filas: sucursales.
  rowLabels: string[]

  // Etiquetas de las columnas: productos.
  columnLabels: string[]

  // Matriz numérica que posteriormente se guardará.
  values: number[][]
}

function Matrices() {
  // ============================================================
  // ESTADO DE DATOS
  // ============================================================

  // Lista de matrices registradas.
  const [matrices, setMatrices] = useState<Matrix[]>([])

  // ID de la matriz actualmente desplegada.
  // Solo mantenemos una fila abierta a la vez.
  const [
    expandedMatrixId,
    setExpandedMatrixId,
  ] = useState<number | null>(null)

  // Referencias empresariales utilizadas para interpretar
  // las filas y columnas de matrices ya registradas.
  //
  // Las filas representan sucursales y las columnas productos.
  const [
    branchReferenceLabels,
    setBranchReferenceLabels,
  ] = useState<string[]>([])

  const [
    productReferenceLabels,
    setProductReferenceLabels,
  ] = useState<string[]>([])

  // ============================================================
  // FORMULARIO DE CREACIÓN
  // ============================================================

  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')

  // Cada línea representa una fila de la matriz.
  const [newValues, setNewValues] = useState('')

  // ============================================================
  // MATRIZ GENERADA DESDE DATOS EMPRESARIALES
  // ============================================================

  // Fuente empresarial seleccionada.
  const [businessSource, setBusinessSource] =
    useState<BusinessMatrixSource>('inventory_stock')

  // Vista previa de la matriz antes de guardarla.
  const [businessPreview, setBusinessPreview] =
    useState<BusinessMatrixPreview | null>(null)

  // Estados de carga específicos de esta funcionalidad.
  const [generatingBusinessMatrix, setGeneratingBusinessMatrix] =
    useState(false)

  const [savingBusinessMatrix, setSavingBusinessMatrix] =
    useState(false)

  // ============================================================
  // ESTADO DE LA INTERFAZ
  // ============================================================

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // ============================================================
  // CARGAR MATRICES
  // ============================================================

  async function loadMatrices() {
    try {
      setLoading(true)
      setError('')

      // Recuperamos las matrices almacenadas en PostgreSQL.
      const data = await getMatrices()

      // Actualizamos la lista mostrada en pantalla.
      setMatrices(data)

      // --------------------------------------------------------
      // REFERENCIAS PARA INTERPRETAR MATRICES EMPRESARIALES
      // --------------------------------------------------------
      //
      // Estas consultas son complementarias. Si alguna falla,
      // las matrices siguen mostrándose y únicamente se pierde
      // la interpretación semántica del detalle desplegable.
      const [
        branchesResult,
        productsResult,
      ] = await Promise.allSettled([
        getBranches(),
        getProducts(),
      ])

      if (
        branchesResult.status ===
        'fulfilled'
      ) {
        // Repetimos exactamente la misma regla utilizada
        // al generar una matriz empresarial:
        // empresa actual + sucursales activas + orden por ID.
        const orderedBranches =
          branchesResult.value
            .filter(
              (branch) =>
                branch.company_id ===
                DEFAULT_COMPANY_ID &&
                branch.is_active,
            )
            .sort(
              (first, second) =>
                first.id - second.id,
            )

        setBranchReferenceLabels(
          orderedBranches.map(
            (branch) =>
              branch.name,
          ),
        )
      }

      if (
        productsResult.status ===
        'fulfilled'
      ) {
        // Repetimos también el orden original de las columnas:
        // productos activos ordenados por ID.
        const orderedProducts =
          productsResult.value
            .filter(
              (product) =>
                product.is_active,
            )
            .sort(
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
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudieron cargar las matrices.',
      )
    } finally {
      setLoading(false)
    }
  }

  // Cargamos las matrices al entrar a la página.
  useEffect(() => {
    loadMatrices()
  }, [])

  // ============================================================
  // CONVERTIR TEXTO A MATRIZ
  // ============================================================

  function parseMatrixValues(): number[][] {
    // Cada línea representa una fila y cada coma separa
    // los elementos de dicha fila.
    const rows = newValues
      .trim()
      .split('\n')
      .map((row) =>
        row
          .split(',')
          .map((value) => Number(value.trim())),
      )

    // Verificamos que existan filas y que todos los valores
    // introducidos sean números válidos.
    if (
      rows.length === 0 ||
      rows.some((row) =>
        row.some((value) => Number.isNaN(value)),
      )
    ) {
      throw new Error(
        'Los valores de la matriz deben ser números.',
      )
    }

    // Todas las filas deben tener la misma cantidad de columnas.
    const columns = rows[0].length

    if (
      columns === 0 ||
      rows.some((row) => row.length !== columns)
    ) {
      throw new Error(
        'Todas las filas deben tener la misma cantidad de columnas.',
      )
    }

    return rows
  }

  // ============================================================
  // GENERAR MATRIZ DESDE DATOS EMPRESARIALES
  // ============================================================

  async function handleGenerateBusinessMatrix() {
    try {
      setGeneratingBusinessMatrix(true)
      setError('')
      setBusinessPreview(null)

      // Consultamos información real desde FastAPI.
      const [branches, products, inventory] =
        await Promise.all([
          getBranches(),
          getProducts(),
          getInventory(),
        ])

      // Trabajamos únicamente con sucursales de la empresa
      // actualmente utilizada por el módulo matemático.
      const orderedBranches = branches
        .filter(
          (branch) =>
            branch.company_id === DEFAULT_COMPANY_ID &&
            branch.is_active,
        )
        .sort(
          (first, second) =>
            first.id - second.id,
        )

      // Utilizamos los productos activos y mantenemos un
      // orden fijo por ID para que las columnas sean estables.
      const orderedProducts = products
        .filter((product) => product.is_active)
        .sort(
          (first, second) =>
            first.id - second.id,
        )

      if (orderedBranches.length === 0) {
        throw new Error(
          'No existen sucursales activas para generar la matriz.',
        )
      }

      if (orderedProducts.length === 0) {
        throw new Error(
          'No existen productos activos para generar la matriz.',
        )
      }

      // Nombres que se mostrarán visualmente en la tabla.
      const rowLabels = orderedBranches.map(
        (branch) => branch.name,
      )

      const columnLabels = orderedProducts.map(
        (product) => product.name,
      )

      // --------------------------------------------------------
      // CONSTRUIR MATRIZ
      // --------------------------------------------------------
      //
      // Cada fila representa una sucursal.
      // Cada columna representa un producto.
      //
      // Cuando no existe inventario para una combinación,
      // utilizamos cero.
      // --------------------------------------------------------

      const values = orderedBranches.map((branch) =>
        orderedProducts.map((product) => {
          const inventoryItem = inventory.find(
            (item) =>
              item.branch_id === branch.id &&
              item.product_id === product.id,
          )

          if (!inventoryItem) {
            return 0
          }

          if (businessSource === 'inventory_stock') {
            return Number(inventoryItem.stock)
          }

          if (businessSource === 'minimum_stock') {
            return Number(
              inventoryItem.minimum_stock,
            )
          }

          // Valor económico del inventario:
          // stock × costo unitario.
          const unitCost = Number(
            inventoryItem.unit_cost ?? 0,
          )

          return Number(inventoryItem.stock) * unitCost
        }),
      )

      // --------------------------------------------------------
      // CONFIGURAR LA VISTA PREVIA
      // --------------------------------------------------------

      if (businessSource === 'inventory_stock') {
        setBusinessPreview({
          name: 'Stock por sucursal y producto',
          description:
            'Matriz de stock actual. Filas: sucursales. Columnas: productos.',
          rowLabels,
          columnLabels,
          values,
        })

        return
      }

      if (businessSource === 'minimum_stock') {
        setBusinessPreview({
          name: 'Stock mínimo por sucursal y producto',
          description:
            'Matriz de stock mínimo. Filas: sucursales. Columnas: productos.',
          rowLabels,
          columnLabels,
          values,
        })

        return
      }

      setBusinessPreview({
        name: 'Valor de inventario por sucursal y producto',
        description:
          'Matriz de stock por costo unitario. Filas: sucursales. Columnas: productos.',
        rowLabels,
        columnLabels,
        values,
      })
    } catch (err) {
      console.error(
        'Error al generar matriz empresarial:',
        err,
      )

      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo generar la matriz empresarial.',
      )
    } finally {
      setGeneratingBusinessMatrix(false)
    }
  }

  // ============================================================
  // GUARDAR MATRIZ EMPRESARIAL
  // ============================================================

  async function handleSaveBusinessMatrix() {
    if (!businessPreview) {
      return
    }

    try {
      setSavingBusinessMatrix(true)
      setError('')

      // POST /api/v1/matrices
      //
      // FastAPI calculará automáticamente la cantidad
      // de filas y columnas.
      await createMatrix({
        company_id: DEFAULT_COMPANY_ID,
        name: businessPreview.name,
        description: businessPreview.description,
        values: businessPreview.values,
      })

      // Volvemos a consultar PostgreSQL para reflejar
      // inmediatamente la matriz recién creada.
      await loadMatrices()

      setBusinessPreview(null)
    } catch (err) {
      console.error(
        'Error al guardar matriz empresarial:',
        err,
      )

      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo guardar la matriz empresarial.',
      )
    } finally {
      setSavingBusinessMatrix(false)
    }
  }

  // ============================================================
  // CREAR MATRIZ
  // ============================================================

  async function handleCreateMatrix() {
    try {
      setSaving(true)
      setError('')

      // Convertimos el texto introducido en una matriz numérica.
      const values = parseMatrixValues()

      // Registramos la nueva matriz.
      await createMatrix({
        company_id: DEFAULT_COMPANY_ID,
        name: newName.trim(),
        description: newDescription.trim() || null,
        values,
      })

      // Limpiamos el formulario después de guardar.
      setNewName('')
      setNewDescription('')
      setNewValues('')

      // Actualizamos la lista para mostrar la nueva matriz.
      await loadMatrices()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo crear la matriz.',
      )
    } finally {
      setSaving(false)
    }
  }

  // ============================================================
  // INTERPRETAR MATRICES REGISTRADAS
  // ============================================================

  const getRegisteredMatrixReferences = (
    matrix: Matrix,
  ): {
    rowLabels: string[]
    columnLabels: string[]
  } | null => {
    const normalizedName =
      matrix.name
        .trim()
        .toLowerCase()

    // Las tres matrices empresariales actuales utilizan
    // exactamente la misma estructura:
    // filas = sucursales
    // columnas = productos.
    const isBusinessMatrix =
      normalizedName ===
      'stock por sucursal y producto' ||
      normalizedName ===
      'stock mínimo por sucursal y producto' ||
      normalizedName ===
      'valor de inventario por sucursal y producto'

    if (!isBusinessMatrix) {
      return null
    }

    // Si los datos actuales ya no tienen suficientes etiquetas,
    // no asumimos una correspondencia incorrecta.
    if (
      branchReferenceLabels.length <
      matrix.rows ||
      productReferenceLabels.length <
      matrix.columns
    ) {
      return null
    }

    return {
      rowLabels:
        branchReferenceLabels.slice(
          0,
          matrix.rows,
        ),

      columnLabels:
        productReferenceLabels.slice(
          0,
          matrix.columns,
        ),
    }
  }

  const toggleRegisteredMatrix = (
    matrixId: number,
  ) => {
    setExpandedMatrixId(
      (current) =>
        current === matrixId
          ? null
          : matrixId,
    )
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-full bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">

        {/* =====================================================
            MENSAJE DE ERROR
            ===================================================== */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-600">
              !
            </div>

            <div>
              <p className="text-sm font-semibold text-red-800">
                No fue posible completar la acción
              </p>

              <p className="mt-1 text-sm text-red-700">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* =====================================================
    MATRIZ DESDE DATOS EMPRESARIALES
    ===================================================== */}

        <section className="mb-8 overflow-hidden rounded-2xl border border-cyan-200 bg-white shadow-sm">
          <div className="border-b border-cyan-100 px-6 py-5">
            <div className="flex items-center gap-3">

              {/* Ícono visual del módulo empresarial. */}
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50">
                <Sparkles className="h-5 w-5 text-cyan-600" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Generar matriz desde datos empresariales
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Organiza información real de inventario utilizando
                  sucursales como filas y productos como columnas.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end">
              <div className="flex-1">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Fuente de información
                </label>

                <select
                  value={businessSource}
                  onChange={(event) => {
                    setBusinessSource(
                      event.target.value as BusinessMatrixSource,
                    )

                    // Eliminamos la vista previa anterior.
                    setBusinessPreview(null)
                  }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
                >
                  {BUSINESS_MATRIX_SOURCES.map(
                    (source) => (
                      <option
                        key={source.value}
                        value={source.value}
                      >
                        {source.label}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <button
                type="button"
                onClick={handleGenerateBusinessMatrix}
                disabled={generatingBusinessMatrix}
                className="rounded-xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:bg-slate-400"
              >
                {generatingBusinessMatrix
                  ? 'Generando...'
                  : 'Generar matriz'}
              </button>
            </div>

            {businessPreview && (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="font-bold text-slate-900">
                  {businessPreview.name}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Filas: sucursales · Columnas: productos
                </p>

                {/* Tabla utilizada para interpretar empresarialmente
            cada posición de la matriz. */}
                <div className="mt-5 overflow-x-auto">
                  <table className="min-w-full border-collapse text-sm">
                    <thead>
                      <tr>
                        <th className="border border-slate-200 bg-white px-4 py-3 text-left font-semibold text-slate-500">
                          Sucursal / Producto
                        </th>

                        {businessPreview.columnLabels.map(
                          (label) => (
                            <th
                              key={label}
                              className="border border-slate-200 bg-white px-4 py-3 text-right font-semibold text-slate-500"
                            >
                              {label}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>

                    <tbody>
                      {businessPreview.values.map(
                        (row, rowIndex) => (
                          <tr key={businessPreview.rowLabels[rowIndex]}>
                            <td className="border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700">
                              {businessPreview.rowLabels[rowIndex]}
                            </td>

                            {row.map((value, columnIndex) => (
                              <td
                                key={`${rowIndex}-${columnIndex}`}
                                className="border border-slate-200 bg-white px-4 py-3 text-right font-mono text-slate-900"
                              >
                                {value}
                              </td>
                            ))}
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Representación matemática pura. */}
                <div className="mt-5 rounded-xl bg-slate-900 p-5">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Matriz resultante
                  </p>

                  {businessPreview.values.map(
                    (row, index) => (
                      <p
                        key={index}
                        className="font-mono text-sm text-white"
                      >
                        [{row.join(', ')}]
                      </p>
                    ),
                  )}
                </div>

                <div className="mt-5 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveBusinessMatrix}
                    disabled={savingBusinessMatrix}
                    className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white disabled:bg-slate-400"
                  >
                    {savingBusinessMatrix
                      ? 'Guardando...'
                      : 'Guardar matriz empresarial'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* =====================================================
            REGISTRAR MATRIZ
            ===================================================== */}

        <section className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 font-mono font-bold text-slate-700">
                +
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Registrar matriz
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Define la estructura y los valores de una
                  nueva matriz.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid gap-5 md:grid-cols-2">
              {/* Nombre */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Nombre
                </label>

                <input
                  type="text"
                  value={newName}
                  onChange={(event) =>
                    setNewName(event.target.value)
                  }
                  placeholder="Ej. Matriz de ventas"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Descripción
                </label>

                <input
                  type="text"
                  value={newDescription}
                  onChange={(event) =>
                    setNewDescription(event.target.value)
                  }
                  placeholder="Descripción opcional"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                />
              </div>
            </div>

            {/* Valores de la matriz */}
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">
                  Valores
                </label>

                <span className="text-xs text-slate-400">
                  Una fila por línea
                </span>
              </div>

              <textarea
                value={newValues}
                onChange={(event) =>
                  setNewValues(event.target.value)
                }
                placeholder={'1, 2, 3\n4, 5, 6'}
                rows={5}
                className="w-full resize-y rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 font-mono text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:bg-white focus:ring-2 focus:ring-slate-100"
              />

              <p className="mt-2 text-xs text-slate-400">
                Cada línea representa una fila. Todas las filas
                deben tener la misma cantidad de elementos.
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handleCreateMatrix}
                disabled={saving}
                className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {saving ? 'Guardando...' : 'Registrar matriz'}
              </button>
            </div>
          </div>
        </section>

        {/* =====================================================
    MATRICES REGISTRADAS
    ===================================================== */}

        <section className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Encabezado de la tarjeta. */}
          <div className="border-b border-slate-100 px-6 py-5">
            <div className="flex items-center justify-between gap-4">

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Matrices registradas
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Consulta las matrices disponibles y presiona una fila
                  para interpretar sus filas y columnas.
                </p>
              </div>

              {/* Contador de matrices registradas. */}
              <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
                {matrices.length} registradas
              </div>
            </div>
          </div>

          {loading ? (
            /* Skeleton de carga igual al módulo de Vectores. */
            <div className="space-y-3 p-6">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-14 animate-pulse rounded-xl bg-slate-100"
                />
              ))}
            </div>
          ) : matrices.length === 0 ? (
            /* Estado vacío. */
            <div className="flex flex-col items-center justify-center px-6 py-12 text-center">

              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                <Table2 className="h-6 w-6 text-slate-400" />
              </div>

              <h3 className="font-semibold text-slate-900">
                No hay matrices registradas
              </h3>

              <p className="mt-1 max-w-sm text-sm text-slate-500">
                Genera una matriz empresarial o registra una manualmente.
              </p>
            </div>
          ) : (
            /* Tabla de matrices, siguiendo el diseño de Vectores. */
            <div className="overflow-hidden">
              <table className="w-full table-fixed text-left">

                <thead className="border-b border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
                  <tr>
                    <th className="w-[24%] px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Matriz
                    </th>

                    <th className="w-[12%] px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Dimensión
                    </th>

                    <th className="w-[34%] px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Valores
                    </th>

                    <th className="w-[30%] px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Descripción
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {matrices.map((matrix) => {
                    const isExpanded =
                      expandedMatrixId ===
                      matrix.id

                    const references =
                      getRegisteredMatrixReferences(
                        matrix,
                      )

                    return (
                      <Fragment key={matrix.id}>
                        <tr
                          role="button"
                          tabIndex={0}
                          aria-expanded={isExpanded}
                          onClick={() =>
                            toggleRegisteredMatrix(
                              matrix.id,
                            )
                          }
                          onKeyDown={(event) => {
                            if (
                              event.key === 'Enter' ||
                              event.key === ' '
                            ) {
                              event.preventDefault()

                              toggleRegisteredMatrix(
                                matrix.id,
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
                          {/* Identificación de la matriz. */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                                <Table2 className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-slate-900 dark:text-slate-100">
                                  {matrix.name}
                                </p>

                                <p className="text-xs text-slate-400 dark:text-slate-500">
                                  ID #{matrix.id}
                                </p>
                              </div>

                              {/* Indicador de fila desplegable. */}
                              <ChevronDown
                                size={17}
                                className={`
                                  shrink-0
                                  text-slate-400
                                  transition-transform
                                  duration-200

                                  ${isExpanded
                                    ? 'rotate-180 text-blue-600 dark:text-blue-400'
                                    : ''
                                  }
                                `}
                              />
                            </div>
                          </td>

                          {/* Dimensión matemática. */}
                          <td className="px-6 py-4">
                            <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              {matrix.rows} × {matrix.columns}
                            </span>
                          </td>

                          {/* Valores resumidos.
                              El contenido se ajusta dentro de la celda
                              para mantener estática la tabla principal. */}
                          <td className="px-6 py-4">
                            <div className="max-w-full rounded-lg bg-slate-900 px-4 py-3 dark:bg-slate-950">
                              {matrix.values.map(
                                (
                                  row,
                                  rowIndex,
                                ) => (
                                  <p
                                    key={rowIndex}
                                    className="break-words font-mono text-sm leading-6 text-white"
                                  >
                                    [{row.join(', ')}]
                                  </p>
                                ),
                              )}
                            </div>
                          </td>

                          {/* Descripción. */}
                          <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                            {matrix.description ??
                              'Sin descripción'}
                          </td>
                        </tr>

                        {/* ======================================
                            DETALLE DESPLEGABLE
                            ====================================== */}
                        {isExpanded && (
                          <tr className="bg-slate-50/80 dark:bg-slate-950/40">
                            <td
                              colSpan={4}
                              className="px-6 pb-6 pt-2"
                            >
                              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">

                                <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                    Significado de filas y columnas
                                  </p>

                                  <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                                    Las filas representan sucursales y las
                                    columnas productos, respetando el orden
                                    utilizado al generar la matriz.
                                  </p>
                                </div>

                                {references ? (
                                  /* El scroll horizontal pertenece
                                     solamente a este detalle. */
                                  <div className="matrix-detail-scroll overflow-x-auto pb-2">
                                    <table className="min-w-max border-collapse text-sm">
                                      <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/70">
                                          <th className="sticky left-0 z-10 min-w-[190px] border-r border-slate-200 bg-slate-50 px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                            Sucursal / Producto
                                          </th>

                                          {references.columnLabels.map(
                                            (
                                              label,
                                              columnIndex,
                                            ) => (
                                              <th
                                                key={`${matrix.id}-column-${columnIndex}-${label}`}
                                                className="min-w-[180px] max-w-[240px] px-4 py-3 text-right text-xs font-semibold leading-5 text-slate-600 dark:text-slate-300"
                                              >
                                                {label}
                                              </th>
                                            ),
                                          )}
                                        </tr>
                                      </thead>

                                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {matrix.values.map(
                                          (
                                            row,
                                            rowIndex,
                                          ) => (
                                            <tr
                                              key={`${matrix.id}-row-${rowIndex}`}
                                            >
                                              {/* La sucursal queda fija mientras
                                                  se desplazan los productos. */}
                                              <td className="sticky left-0 z-10 min-w-[190px] border-r border-slate-200 bg-white px-4 py-4 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                                                {
                                                  references
                                                    .rowLabels[
                                                  rowIndex
                                                  ]
                                                }
                                              </td>

                                              {row.map(
                                                (
                                                  value,
                                                  columnIndex,
                                                ) => (
                                                  <td
                                                    key={`${matrix.id}-${rowIndex}-${columnIndex}`}
                                                    className="px-4 py-4 text-right"
                                                  >
                                                    <span className="inline-flex min-w-12 items-center justify-center rounded-lg bg-slate-900 px-3 py-1.5 font-mono text-sm font-bold text-white dark:bg-slate-950">
                                                      {value}
                                                    </span>
                                                  </td>
                                                ),
                                              )}
                                            </tr>
                                          ),
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                ) : (
                                  /* Matrices manuales o referencias
                                     que ya no coinciden con los datos. */
                                  <div className="flex items-start gap-3 px-5 py-5">
                                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
                                      <Info size={17} />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                        Referencias no disponibles
                                      </p>

                                      <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500 dark:text-slate-400">
                                        Esta matriz no conserva etiquetas
                                        semánticas para sus filas y columnas.
                                        Puede tratarse de una matriz manual o
                                        de una matriz empresarial cuya
                                        estructura ya no coincide con las
                                        sucursales y productos actuales.
                                      </p>

                                      {/* Mostramos la matriz por posiciones
                                          sin inventar significados. */}
                                      <div className="mt-4 overflow-x-auto pb-2">
                                        <table className="min-w-max border-collapse text-xs">
                                          <tbody>
                                            {matrix.values.map(
                                              (
                                                row,
                                                rowIndex,
                                              ) => (
                                                <tr
                                                  key={`${matrix.id}-fallback-${rowIndex}`}
                                                >
                                                  <td className="whitespace-nowrap border border-slate-200 bg-slate-50 px-3 py-2 font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                                    Fila {rowIndex + 1}
                                                  </td>

                                                  {row.map(
                                                    (
                                                      value,
                                                      columnIndex,
                                                    ) => (
                                                      <td
                                                        key={`${matrix.id}-fallback-${rowIndex}-${columnIndex}`}
                                                        className="border border-slate-200 bg-white px-3 py-2 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                                                      >
                                                        C{columnIndex + 1}:{' '}
                                                        <strong className="font-mono text-slate-900 dark:text-white">
                                                          {value}
                                                        </strong>
                                                      </td>
                                                    ),
                                                  )}
                                                </tr>
                                              ),
                                            )}
                                          </tbody>
                                        </table>
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

export default Matrices