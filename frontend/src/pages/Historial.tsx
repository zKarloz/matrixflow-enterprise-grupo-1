import { useEffect, useMemo, useState } from 'react'

import {
  Calculator,
  Clock3,
  Filter,
  Search,
  Sigma,
  Table2,
  VectorSquare,
} from 'lucide-react'

import {
  getOperations,
  type OperationHistoryItem,
  type OperationHistoryStructuredResult,
} from '../services/api'

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
  // FORMATEAR FECHA
  // ==========================================================

  function formatDate(date: string) {
    const parsedDate = new Date(date)

    if (
      Number.isNaN(parsedDate.getTime())
    ) {
      return date
    }

    // El navegador convierte automáticamente
    // desde UTC a la zona horaria local.
    return parsedDate.toLocaleString(
      'es-PE',
      {
        dateStyle: 'medium',
        timeStyle: 'short',
      },
    )
  }

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
              className="flex items-center gap-2"
            >
              <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                {input.type === 'vector'
                  ? `V${input.id}`
                  : `M${input.id}`}
              </span>

              <span className="text-sm text-slate-700">
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
        <span className="font-mono text-sm font-bold text-slate-900">
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
        <code className="inline-block max-w-[280px] overflow-x-auto rounded-lg bg-slate-900 px-3 py-2 text-xs text-white">
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
        <div className="w-fit min-w-[160px] rounded-lg bg-slate-900 px-3 py-2">
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
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-full bg-slate-50 p-6">
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
            <div className="flex items-center justify-between gap-4">

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
            // Tabla del historial.
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px] text-left">

                <thead className="border-b border-slate-100 bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Fecha
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Operación
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Tipo
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Entradas
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Resultado
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Tiempo
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredOperations.map(
                    (operation) => (
                      <tr
                        key={operation.id}
                        className="transition hover:bg-slate-50"
                      >

                        {/* Fecha. */}
                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                          {formatDate(
                            operation.created_at,
                          )}
                        </td>

                        {/* Nombre. */}
                        <td className="max-w-xs px-5 py-4">
                          <p className="font-semibold text-slate-900">
                            {operation.name}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Registro #
                            {operation.id}
                          </p>
                        </td>

                        {/* Tipo. */}
                        <td className="px-5 py-4">
                          <span className="inline-flex rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
                            {getOperationLabel(
                              operation.operation_type,
                            )}
                          </span>
                        </td>

                        {/* Entradas. */}
                        <td className="max-w-sm px-5 py-4">
                          {renderInputs(
                            operation,
                          )}
                        </td>

                        {/* Resultado. */}
                        <td className="px-5 py-4">
                          {renderResult(
                            operation,
                          )}
                        </td>

                        {/* Tiempo. */}
                        <td className="whitespace-nowrap px-5 py-4">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Clock3 className="h-4 w-4 text-slate-400" />

                            {formatExecutionTime(
                              operation.execution_time,
                            )}
                          </div>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default Historial