import { Fragment, useEffect, useMemo, useState } from 'react'

import {
  Calculator,
  ChevronDown,
  Clock3,
  Filter,
  Info,
  Search,
  Sigma,
  Table2,
  VectorSquare,
} from 'lucide-react'

import {
  getBranches,
  getDashboard,
  getMatrices,
  getOperations,
  getProducts,
  getVectors,
  type Matrix,
  type OperationHistoryItem,
  type OperationHistoryStructuredResult,
  type Vector,
} from '../services/api'

import {
  formatDateTime,
} from '../utils/date'

// ============================================================
// TIPOS
// ============================================================

// Categorías utilizadas únicamente por los filtros visuales.
type HistoryCategory =
  | 'Todas'
  | 'Vectores'
  | 'Matrices'
  | 'Combinaciones'

// ============================================================
// COMPONENTE
// ============================================================

function Historial() {
  // ==========================================================
  // ESTADO
  // ==========================================================

  // Historial matemático recuperado desde PostgreSQL.
  const [operations, setOperations] = useState<
    OperationHistoryItem[]
  >([])

  // Estructuras originales relacionadas con cada operación.
  const [vectors, setVectors] = useState<Vector[]>([])
  const [matrices, setMatrices] = useState<Matrix[]>([])

  // Referencias empresariales utilizadas para interpretar datos.
  const [
    productReferenceLabels,
    setProductReferenceLabels,
  ] = useState<string[]>([])

  const [
    salesReferenceLabels,
    setSalesReferenceLabels,
  ] = useState<string[]>([])

  const [
    branchReferenceLabels,
    setBranchReferenceLabels,
  ] = useState<string[]>([])

  // Solo una operación permanece desplegada a la vez.
  const [
    expandedOperationId,
    setExpandedOperationId,
  ] = useState<number | null>(null)

  // Estado general de carga.
  const [loading, setLoading] = useState(true)

  // Mensajes de error.
  const [error, setError] = useState('')

  // Texto de búsqueda.
  const [search, setSearch] = useState('')

  // Categoría seleccionada.
  const [categoryFilter, setCategoryFilter] =
    useState<HistoryCategory>('Todas')

  // ==========================================================
  // CARGAR HISTORIAL
  // ==========================================================

  useEffect(() => {
    async function loadHistory() {
      try {
        setLoading(true)
        setError('')

        // GET /api/v1/operations
        //
        // El backend reconstruye las entradas,
        // resultados, fecha y tiempo de ejecución.
        const data = await getOperations()

        setOperations(data)

        // Cargamos información complementaria para reconstruir
        // el significado de las entradas del historial.
        const [
          vectorsResult,
          matricesResult,
          productsResult,
          branchesResult,
          dashboardResult,
        ] = await Promise.allSettled([
          getVectors(),
          getMatrices(),
          getProducts(),
          getBranches(),
          getDashboard(),
        ])

        if (vectorsResult.status === 'fulfilled') {
          setVectors(vectorsResult.value)
        }

        if (matricesResult.status === 'fulfilled') {
          setMatrices(matricesResult.value)
        }

        if (productsResult.status === 'fulfilled') {
          const orderedProducts =
            productsResult.value
              .filter((product) => product.is_active)
              .sort((first, second) => first.id - second.id)

          setProductReferenceLabels(
            orderedProducts.map((product) => product.name),
          )
        }

        if (branchesResult.status === 'fulfilled') {
          const orderedBranches =
            branchesResult.value
              .filter(
                (branch) =>
                  branch.company_id === 2 &&
                  branch.is_active,
              )
              .sort((first, second) => first.id - second.id)

          setBranchReferenceLabels(
            orderedBranches.map((branch) => branch.name),
          )
        }

        if (dashboardResult.status === 'fulfilled') {
          const orderedSales =
            [...dashboardResult.value.sales_by_product].sort(
              (first, second) =>
                first.product_id - second.product_id,
            )

          setSalesReferenceLabels(
            orderedSales.map((item) => item.product_name),
          )
        }
      } catch (requestError) {
        console.error(
          'Error al cargar historial matemático:',
          requestError,
        )

        setError(
          requestError instanceof Error
            ? requestError.message
            : 'No se pudo cargar el historial.',
        )
      } finally {
        setLoading(false)
      }
    }

    loadHistory()
  }, [])

  // ==========================================================
  // REFERENCIAS DE VECTORES Y MATRICES
  // ==========================================================

  function getVectorLabels(
    vector: Vector,
  ): string[] | null {
    const normalizedName =
      vector.name.trim().toLowerCase()

    if (
      normalizedName === 'stock total por producto' ||
      normalizedName === 'precio actual por producto'
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

    if (
      normalizedName === 'unidades vendidas por producto' ||
      normalizedName === 'importe vendido por producto'
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

    return null
  }

  function getMatrixReferences(
    matrix: Matrix,
  ): {
    rowLabels: string[]
    columnLabels: string[]
  } | null {
    const normalizedName =
      matrix.name.trim().toLowerCase()

    const isBusinessMatrix =
      normalizedName === 'stock por sucursal y producto' ||
      normalizedName === 'stock mínimo por sucursal y producto' ||
      normalizedName === 'valor de inventario por sucursal y producto'

    if (
      !isBusinessMatrix ||
      branchReferenceLabels.length < matrix.rows ||
      productReferenceLabels.length < matrix.columns
    ) {
      return null
    }

    return {
      rowLabels: branchReferenceLabels.slice(
        0,
        matrix.rows,
      ),
      columnLabels: productReferenceLabels.slice(
        0,
        matrix.columns,
      ),
    }
  }

  function renderVectorHistoryDetail(
    vector: Vector,
  ) {
    const labels = getVectorLabels(vector)

    return (
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            V{vector.id} · {vector.name}
          </p>
        </div>

        {labels ? (
          <div className="overflow-x-auto pb-2">
            <table className="min-w-max text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/70">
                  {labels.map((label, index) => (
                    <th
                      key={`${vector.id}-${index}-${label}`}
                      className="min-w-[180px] max-w-[240px] px-4 py-3 text-xs font-semibold leading-5 text-slate-600 dark:text-slate-300"
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                <tr>
                  {vector.values.map((value, index) => (
                    <td
                      key={`${vector.id}-${index}`}
                      className="px-4 py-4"
                    >
                      <span className="inline-flex min-w-10 items-center justify-center rounded-lg bg-slate-900 px-3 py-1.5 font-mono text-sm font-bold text-white dark:bg-slate-950">
                        {value}
                      </span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 p-4">
            {vector.values.map((value, index) => (
              <span
                key={`${vector.id}-position-${index}`}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                Componente {index + 1}:{' '}
                <strong className="font-mono text-slate-900 dark:text-white">
                  {value}
                </strong>
              </span>
            ))}
          </div>
        )}
      </div>
    )
  }

  function renderMatrixHistoryDetail(
    matrix: Matrix,
  ) {
    const references =
      getMatrixReferences(matrix)

    return (
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            M{matrix.id} · {matrix.name}
          </p>
        </div>

        {references ? (
          <div className="overflow-x-auto pb-2">
            <table className="min-w-max border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/70">
                  <th className="sticky left-0 z-10 min-w-[190px] border-r border-slate-200 bg-slate-50 px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    Sucursal / Producto
                  </th>

                  {references.columnLabels.map(
                    (label, index) => (
                      <th
                        key={`${matrix.id}-column-${index}`}
                        className="min-w-[180px] max-w-[240px] px-4 py-3 text-right text-xs font-semibold leading-5 text-slate-600 dark:text-slate-300"
                      >
                        {label}
                      </th>
                    ),
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {matrix.values.map((row, rowIndex) => (
                  <tr key={`${matrix.id}-row-${rowIndex}`}>
                    <td className="sticky left-0 z-10 border-r border-slate-200 bg-white px-4 py-4 font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                      {references.rowLabels[rowIndex]}
                    </td>

                    {row.map((value, columnIndex) => (
                      <td
                        key={`${matrix.id}-${rowIndex}-${columnIndex}`}
                        className="px-4 py-4 text-right"
                      >
                        <span className="inline-flex min-w-12 items-center justify-center rounded-lg bg-slate-900 px-3 py-1.5 font-mono text-sm font-bold text-white dark:bg-slate-950">
                          {value}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto p-4">
            <table className="min-w-max border-collapse text-xs">
              <tbody>
                {matrix.values.map((row, rowIndex) => (
                  <tr key={`${matrix.id}-fallback-${rowIndex}`}>
                    <td className="border border-slate-200 bg-slate-50 px-3 py-2 font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      Fila {rowIndex + 1}
                    </td>

                    {row.map((value, columnIndex) => (
                      <td
                        key={`${matrix.id}-fallback-${rowIndex}-${columnIndex}`}
                        className="border border-slate-200 bg-white px-3 py-2 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                      >
                        C{columnIndex + 1}:{' '}
                        <strong className="font-mono text-slate-900 dark:text-white">
                          {value}
                        </strong>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )
  }

  // ==========================================================
  // NOMBRES LEGIBLES DE OPERACIONES
  // ==========================================================

  function getOperationLabel(
    operationType: string,
  ) {
    const labels: Record<string, string> = {
      sum_vector: 'Suma de vectores',
      subtract_vector: 'Resta de vectores',
      dot_product: 'Producto punto',
      scalar_multiply: 'Escalar vectorial',

      add_matrix: 'Suma de matrices',
      subtract_matrix: 'Resta de matrices',
      multiply_matrix: 'Multiplicación matricial',
      transpose_matrix: 'Transpuesta',
      scalar_multiply_matrix: 'Escalar matricial',

      linear_combination: 'Combinación lineal',
    }

    return (
      labels[operationType] ??
      operationType
    )
  }

  // ==========================================================
  // CATEGORÍA DE LA OPERACIÓN
  // ==========================================================

  function getOperationCategory(
    operationType: string,
  ): HistoryCategory {
    if (
      operationType === 'linear_combination'
    ) {
      return 'Combinaciones'
    }

    if (
      operationType.includes('matrix')
    ) {
      return 'Matrices'
    }

    return 'Vectores'
  }

  // ==========================================================
  // FILTRADO
  // ==========================================================

  const filteredOperations = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase()

    return operations.filter((operation) => {
      // Comprobamos el filtro por categoría.
      const category =
        getOperationCategory(
          operation.operation_type,
        )

      const matchesCategory =
        categoryFilter === 'Todas' ||
        category === categoryFilter

      // Permitimos buscar por nombre, tipo
      // y nombres de las entradas.
      const searchableText = [
        operation.name,
        getOperationLabel(
          operation.operation_type,
        ),
        ...operation.inputs.map(
          (input) => input.source_name,
        ),
      ]
        .join(' ')
        .toLowerCase()

      const matchesSearch =
        !normalizedSearch ||
        searchableText.includes(
          normalizedSearch,
        )

      return (
        matchesCategory &&
        matchesSearch
      )
    })
  }, [
    operations,
    search,
    categoryFilter,
  ])

  // ==========================================================
  // ESTADÍSTICAS
  // ==========================================================

  const vectorOperations = operations.filter(
    (operation) =>
      getOperationCategory(
        operation.operation_type,
      ) === 'Vectores',
  ).length

  const matrixOperations = operations.filter(
    (operation) =>
      getOperationCategory(
        operation.operation_type,
      ) === 'Matrices',
  ).length

  const linearCombinations =
    operations.filter(
      (operation) =>
        operation.operation_type ===
        'linear_combination',
    ).length

  // ==========================================================
  // FORMATEAR TIEMPO
  // ==========================================================

  function formatExecutionTime(
    value: number | null,
  ) {
    if (value === null) {
      return '—'
    }

    // El backend guarda segundos.
    // Para mostrarlo de forma más comprensible
    // convertimos el valor a milisegundos.
    const milliseconds = value * 1000

    return `${milliseconds.toFixed(2)} ms`
  }

  // ==========================================================
  // MOSTRAR ENTRADAS
  // ==========================================================

  function renderInputs(
    operation: OperationHistoryItem,
  ) {
    if (operation.inputs.length === 0) {
      return (
        <span className="text-slate-400">
          Sin referencia
        </span>
      )
    }

    return (
      <div className="space-y-1">
        {operation.inputs.map(
          (input, index) => (
            <div
              key={`${input.type}-${input.id}-${index}`}
              className="flex min-w-0 items-start gap-2"
            >
              <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {input.type === 'vector'
                  ? `V${input.id}`
                  : `M${input.id}`}
              </span>

              <span className="min-w-0 break-words text-sm leading-5 text-slate-700 dark:text-slate-300">
                {input.source_name}
              </span>
            </div>
          ),
        )}
      </div>
    )
  }

  // ==========================================================
  // MOSTRAR RESULTADO
  // ==========================================================

  function renderResult(
    operation: OperationHistoryItem,
  ) {
    if (
      operation.result === null ||
      operation.result_type === null
    ) {
      return (
        <span className="text-slate-400">
          No disponible
        </span>
      )
    }

    // --------------------------------------------------------
    // RESULTADO ESCALAR
    // --------------------------------------------------------

    if (
      operation.result_type ===
      'scalar' &&
      typeof operation.result ===
      'number'
    ) {
      return (
        <span className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100">
          {operation.result}
        </span>
      )
    }

    // --------------------------------------------------------
    // VECTOR O MATRIZ
    // --------------------------------------------------------

    const structuredResult =
      operation.result as OperationHistoryStructuredResult

    if (
      operation.result_type === 'vector' &&
      Array.isArray(
        structuredResult.values,
      )
    ) {
      return (
        <code
          className="
            inline-block
            min-w-max
            whitespace-nowrap
            rounded-lg
            bg-slate-900
            px-3
            py-2
            font-mono
            text-xs
            text-white
            dark:bg-slate-950
          "
        >
          [
          {(
            structuredResult.values as number[]
          ).join(', ')}
          ]
        </code>
      )
    }

    if (
      operation.result_type === 'matrix'
    ) {
      const matrix =
        structuredResult.values as number[][]

      return (
        <div
          className="
            inline-block
            min-w-max
            rounded-lg
            bg-slate-900
            px-3
            py-2
            dark:bg-slate-950
          "
        >
          {matrix.map(
            (row, index) => (
              <p
                key={index}
                className="whitespace-nowrap font-mono text-xs leading-5 text-white"
              >
                [{row.join(', ')}]
              </p>
            ),
          )}
        </div>
      )
    }

    return (
      <span className="text-slate-400">
        No disponible
      </span>
    )
  }

  // ==========================================================
  // DETALLE EXPANDIDO DE UNA OPERACIÓN
  // ==========================================================

  function renderOperationDetail(
    operation: OperationHistoryItem,
  ) {
    return (
      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-5">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Datos utilizados en la operación
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
            Se reutilizan las estructuras originales registradas
            en Vectores y Matrices.
          </p>
        </div>

        {operation.inputs.length > 0 ? (
          <div className="space-y-3">
            {operation.inputs.map(
              (input, inputIndex) => {
                if (input.type === 'vector') {
                  const vector =
                    vectors.find(
                      (item) =>
                        item.id === input.id,
                    )

                  return vector ? (
                    <div
                      key={`history-vector-${operation.id}-${input.id}-${inputIndex}`}
                    >
                      {renderVectorHistoryDetail(
                        vector,
                      )}
                    </div>
                  ) : (
                    <div
                      key={`missing-vector-${operation.id}-${inputIndex}`}
                      className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-900/50 dark:bg-amber-500/10 dark:text-amber-300"
                    >
                      <Info
                        size={17}
                        className="mt-0.5 shrink-0"
                      />

                      <span>
                        Vector V{input.id} no disponible actualmente.
                      </span>
                    </div>
                  )
                }

                const matrix =
                  matrices.find(
                    (item) =>
                      item.id === input.id,
                  )

                return matrix ? (
                  <div
                    key={`history-matrix-${operation.id}-${input.id}-${inputIndex}`}
                  >
                    {renderMatrixHistoryDetail(
                      matrix,
                    )}
                  </div>
                ) : (
                  <div
                    key={`missing-matrix-${operation.id}-${inputIndex}`}
                    className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-900/50 dark:bg-amber-500/10 dark:text-amber-300"
                  >
                    <Info
                      size={17}
                      className="mt-0.5 shrink-0"
                    />

                    <span>
                      Matriz M{input.id} no disponible actualmente.
                    </span>
                  </div>
                )
              },
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            La operación no conserva referencias a estructuras registradas.
          </p>
        )}

        {/* El resultado conserva un scroll horizontal propio
            cuando su contenido supera el ancho del teléfono. */}
        <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Resultado registrado
          </p>

          <div
            className="
              history-result-scroll
              w-full
              max-w-full
              overflow-x-auto
              overflow-y-hidden
              rounded-xl
              bg-slate-50
              p-4
              pb-3
              dark:bg-slate-950/70
            "
            style={{
              WebkitOverflowScrolling:
                'touch',
            }}
          >
            <div className="w-max min-w-max">
              {renderResult(operation)}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-full bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">

        {/* ===================================================
            ERROR
            =================================================== */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-800">
              No se pudo cargar el historial
            </p>

            <p className="mt-1 text-sm text-red-700">
              {error}
            </p>
          </div>
        )}

        {/* ===================================================
            RESUMEN
            =================================================== */}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* Total. */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                <Calculator className="h-5 w-5 text-slate-600" />
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Operaciones
                </p>

                <p className="text-2xl font-bold text-slate-900">
                  {operations.length}
                </p>
              </div>
            </div>
          </div>

          {/* Vectoriales. */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50">
                <VectorSquare className="h-5 w-5 text-cyan-600" />
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Vectoriales
                </p>

                <p className="text-2xl font-bold text-slate-900">
                  {vectorOperations}
                </p>
              </div>
            </div>
          </div>

          {/* Matriciales. */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                <Table2 className="h-5 w-5 text-indigo-600" />
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Matriciales
                </p>

                <p className="text-2xl font-bold text-slate-900">
                  {matrixOperations}
                </p>
              </div>
            </div>
          </div>

          {/* Combinaciones lineales. */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50">
                <Sigma className="h-5 w-5 text-violet-600" />
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Combinaciones
                </p>

                <p className="text-2xl font-bold text-slate-900">
                  {linearCombinations}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            FILTROS
            =================================================== */}

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="grid gap-4 md:grid-cols-[1fr_280px]">

            {/* Buscar. */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Buscar operación
              </label>

              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value,
                    )
                  }
                  placeholder="Nombre, tipo o entrada..."
                  className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                />
              </div>
            </div>

            {/* Categoría. */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Categoría
              </label>

              <div className="relative">
                <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <select
                  value={categoryFilter}
                  onChange={(event) =>
                    setCategoryFilter(
                      event.target
                        .value as HistoryCategory,
                    )
                  }
                  className="w-full appearance-none rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none"
                >
                  <option value="Todas">
                    Todas
                  </option>

                  <option value="Vectores">
                    Vectores
                  </option>

                  <option value="Matrices">
                    Matrices
                  </option>

                  <option value="Combinaciones">
                    Combinaciones lineales
                  </option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            HISTORIAL
            =================================================== */}

        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Encabezado. */}
          <div className="border-b border-slate-100 px-6 py-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Historial matemático
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Operaciones ejecutadas mediante el motor NumPy.
                </p>
              </div>

              <span className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
                {filteredOperations.length}{' '}
                registros
              </span>
            </div>
          </div>

          {loading ? (
            // Estado de carga.
            <div className="space-y-3 p-6">
              {[1, 2, 3, 4].map(
                (item) => (
                  <div
                    key={item}
                    className="h-16 animate-pulse rounded-xl bg-slate-100"
                  />
                ),
              )}
            </div>
          ) : filteredOperations.length ===
            0 ? (
            // Estado vacío.
            <div className="px-6 py-14 text-center">
              <Calculator className="mx-auto h-10 w-10 text-slate-300" />

              <p className="mt-3 font-semibold text-slate-700">
                No se encontraron operaciones
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Ejecuta una operación matemática
                o modifica los filtros.
              </p>
            </div>
          ) : (
            <>
              {/* =================================================
                  TELÉFONOS Y TABLETS PEQUEÑAS
                  =================================================

                  En móvil no usamos la tabla de seis columnas.
                  Cada operación se muestra como una tarjeta vertical
                  para evitar textos comprimidos y superpuestos.
                  ================================================= */}
              <div className="space-y-3 p-3 sm:p-4 lg:hidden">
                {filteredOperations.map(
                  (operation) => {
                    const isExpanded =
                      expandedOperationId ===
                      operation.id

                    return (
                      <div
                        key={operation.id}
                        className="
                          history-card-scroll
                          w-full
                          max-w-full
                          overflow-x-auto
                          overflow-y-hidden
                          pb-2
                        "
                        style={{
                          WebkitOverflowScrolling:
                            'touch',
                        }}
                      >
                        <article
                          className={`
                            min-w-[680px]
                            overflow-hidden
                            rounded-xl
                            border
                            transition-colors

                            ${isExpanded
                              ? 'border-blue-200 bg-blue-50/60 dark:border-blue-900/60 dark:bg-blue-950/20'
                              : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'
                            }
                          `}
                        >
                          <button
                            type="button"
                            aria-expanded={isExpanded}
                            onClick={() =>
                              setExpandedOperationId(
                                isExpanded
                                  ? null
                                  : operation.id,
                              )
                            }
                            className="
                            w-full
                            p-4
                            text-left
                            transition-colors
                            hover:bg-slate-50
                            dark:hover:bg-slate-800/60
                          "
                          >
                            {/* Cabecera móvil de la operación. */}
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <p className="break-words text-sm font-semibold leading-5 text-slate-900 dark:text-slate-100">
                                  {operation.name}
                                </p>

                                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                                  Registro #{operation.id}
                                </p>
                              </div>

                              <ChevronDown
                                size={18}
                                className={`
                                mt-0.5
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

                            {/* Información secundaria organizada
                              en bloques y no en columnas estrechas. */}
                            <div className="mt-4 grid grid-cols-2 gap-3">
                              <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800/70">
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                  Fecha
                                </p>

                                <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">
                                  {formatDateTime(
                                    operation.created_at,
                                  )}
                                </p>
                              </div>

                              <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800/70">
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                  Tipo
                                </p>

                                <p className="mt-1 text-xs font-semibold leading-5 text-slate-700 dark:text-slate-200">
                                  {getOperationLabel(
                                    operation.operation_type,
                                  )}
                                </p>
                              </div>

                              <div className="col-span-2 rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800/70">
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                  Entradas
                                </p>

                                <div className="mt-2">
                                  {renderInputs(operation)}
                                </div>
                              </div>

                              <div className="col-span-2 rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800/70">
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                  Resultado
                                </p>

                                <div className="mt-2">
                                  {renderResult(operation)}
                                </div>
                              </div>

                              <div className="col-span-2 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800/70">
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                  Tiempo
                                </p>

                                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                                  <Clock3 className="h-4 w-4 shrink-0 text-slate-400" />

                                  {formatExecutionTime(
                                    operation.execution_time,
                                  )}
                                </div>
                              </div>
                            </div>
                          </button>

                          {/* Detalle completo reutilizado de Vectores/Matrices. */}
                          {isExpanded && (
                            <div className="border-t border-slate-200 p-3 dark:border-slate-700">
                              {renderOperationDetail(
                                operation,
                              )}
                            </div>
                          )}
                        </article>
                      </div>
                    )
                  },
                )}
              </div>

              {/* =================================================
                  ESCRITORIO
                  =================================================

                  Conservamos la tabla completa únicamente desde lg.
                  ================================================= */}
              <div className="hidden overflow-hidden lg:block">
                <table className="w-full table-fixed text-left">

                  <thead className="border-b border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
                    <tr>
                      <th className="w-[13%] px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Fecha
                      </th>

                      <th className="w-[21%] px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Operación
                      </th>

                      <th className="w-[15%] px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Tipo
                      </th>

                      <th className="w-[20%] px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Entradas
                      </th>

                      <th className="w-[21%] px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Resultado
                      </th>

                      <th className="w-[10%] px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Tiempo
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredOperations.map(
                      (operation) => {
                        const isExpanded =
                          expandedOperationId ===
                          operation.id

                        return (
                          <Fragment key={operation.id}>
                            <tr
                              role="button"
                              tabIndex={0}
                              aria-expanded={isExpanded}
                              onClick={() =>
                                setExpandedOperationId(
                                  isExpanded
                                    ? null
                                    : operation.id,
                                )
                              }
                              onKeyDown={(event) => {
                                if (
                                  event.key === 'Enter' ||
                                  event.key === ' '
                                ) {
                                  event.preventDefault()

                                  setExpandedOperationId(
                                    isExpanded
                                      ? null
                                      : operation.id,
                                  )
                                }
                              }}
                              className={`
                                cursor-pointer
                                transition-colors

                                ${isExpanded
                                  ? 'bg-blue-50/70 dark:bg-blue-950/30'
                                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                                }
                              `}
                            >
                              <td className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400">
                                <div className="flex items-start gap-2">
                                  <ChevronDown
                                    size={16}
                                    className={`
                                      mt-0.5
                                      shrink-0
                                      text-slate-400
                                      transition-transform

                                      ${isExpanded
                                        ? 'rotate-180 text-blue-600 dark:text-blue-400'
                                        : ''
                                      }
                                    `}
                                  />

                                  <span>
                                    {formatDateTime(
                                      operation.created_at,
                                    )}
                                  </span>
                                </div>
                              </td>

                              <td className="px-5 py-4">
                                <p className="break-words font-semibold text-slate-900 dark:text-slate-100">
                                  {operation.name}
                                </p>

                                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                                  Registro #{operation.id}
                                </p>
                              </td>

                              <td className="px-5 py-4">
                                <span className="inline-flex rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                  {getOperationLabel(
                                    operation.operation_type,
                                  )}
                                </span>
                              </td>

                              <td className="px-5 py-4">
                                {renderInputs(operation)}
                              </td>

                              <td className="min-w-0 px-5 py-4">
                                <div className="w-full max-w-full overflow-x-auto pb-1">
                                  <div className="w-max min-w-max">
                                    {renderResult(operation)}
                                  </div>
                                </div>
                              </td>

                              <td className="px-5 py-4">
                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                  <Clock3 className="h-4 w-4 shrink-0 text-slate-400" />

                                  {formatExecutionTime(
                                    operation.execution_time,
                                  )}
                                </div>
                              </td>
                            </tr>

                            {isExpanded && (
                              <tr className="bg-slate-50/80 dark:bg-slate-950/40">
                                <td
                                  colSpan={6}
                                  className="px-5 pb-6 pt-2"
                                >
                                  {renderOperationDetail(
                                    operation,
                                  )}
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        )
                      },
                    )}
                  </tbody>
                </table>
              </div>
            </>

          )}
        </section>
      </div>
    </div>
  )
}

export default Historial