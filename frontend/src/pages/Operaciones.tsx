import { useEffect, useState } from 'react'

import {
  createOperation,
  getOperations,
  type Operation,
} from '../services/api'

// Empresa utilizada actualmente por MatrixFlow.
const DEFAULT_COMPANY_ID = 2

// Operaciones matemáticas disponibles en el módulo.
type OperationType =
  | 'sum_vector'
  | 'subtract_vector'
  | 'dot_product'
  | 'scalar_multiply'

// Página principal del módulo de operaciones matemáticas.
function Operaciones() {
  // Valores utilizados como entrada para las operaciones.
  const [a, setA] = useState<number>(10)
  const [b, setB] = useState<number>(5)
  const [scalar, setScalar] = useState<number>(2)

  // Historial real de operaciones registradas.
  const [history, setHistory] = useState<Operation[]>([])

  // Resultado de la última operación ejecutada.
  const [result, setResult] = useState<unknown>(null)

  // Estados de carga y error.
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Carga el historial de operaciones registradas.
  const loadHistory = async () => {
    try {
      setError(null)

      // Consultamos las operaciones existentes.
      const operations = await getOperations()

      // Guardamos los resultados recibidos.
      setHistory(operations)
    } catch (err) {
      // Mostramos un mensaje comprensible al usuario.
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo cargar el historial.',
      )
    }
  }

  // Cargamos el historial al entrar al módulo.
  useEffect(() => {
    loadHistory()
  }, [])

  // Ejecuta una operación matemática y actualiza el historial.
  const executeOperation = async (
    operationType: OperationType,
    operationName: string,
    firstValues: number[][],
    secondValues?: number[][] | null,
    operationScalar?: number | null,
  ) => {
    try {
      setLoading(true)
      setError(null)

      // Registramos la operación con sus valores correspondientes.
      const response = await createOperation({
        company_id: DEFAULT_COMPANY_ID,
        name: operationName,
        operation_type: operationType,
        first_values: firstValues,
        second_values: secondValues ?? null,
        scalar: operationScalar ?? null,
      })

      // Mostramos el resultado calculado.
      setResult(response.result)

      // Actualizamos el historial después de ejecutar la operación.
      await loadHistory()
    } catch (err) {
      // Mostramos el error sin modificar la lógica existente.
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo ejecutar la operación.',
      )
    } finally {
      // Finalizamos el estado de carga.
      setLoading(false)
    }
  }

  // Limpia únicamente el resultado mostrado actualmente.
  const clearResult = () => {
    setResult(null)
  }

  // Convierte el resultado en un texto seguro para mostrarlo.
  const formatResult = (value: unknown) => {
    if (value === undefined || value === null) {
      return 'Resultado no disponible'
    }

    return Array.isArray(value) ? JSON.stringify(value) : String(value)
  }

  return (
    <div className="min-h-full bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Encabezado principal del módulo. */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Análisis matemático
          </p>

          <div className="mt-2 flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Operaciones
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                Ejecuta operaciones vectoriales y analiza sus resultados.
              </p>
            </div>

            {/* Indicador compacto del historial disponible. */}
            <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Operaciones registradas
              </p>

              <p className="mt-1 text-xl font-bold text-slate-900">
                {history.length}
              </p>
            </div>
          </div>
        </div>

        {/* Mensaje de error general. */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <span className="font-semibold">Error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Panel de valores de entrada. */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Parámetros
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Valores de entrada
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Define los valores que utilizarás en las operaciones.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-3">
            {/* Valor A. */}
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Valor A
              </label>

              <input
                type="number"
                value={a}
                onChange={(event) => setA(Number(event.target.value))}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            {/* Valor B. */}
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Valor B
              </label>

              <input
                type="number"
                value={b}
                onChange={(event) => setB(Number(event.target.value))}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            {/* Escalar utilizado únicamente en la multiplicación escalar. */}
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Escalar
              </label>

              <input
                type="number"
                value={scalar}
                onChange={(event) => setScalar(Number(event.target.value))}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
              />
            </div>
          </div>
        </section>

        {/* Operaciones disponibles. */}
        <section className="mt-8">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Herramientas
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Operaciones disponibles
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Operación de suma. */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Suma
                  </p>

                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    A + B
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    {a} + {b}
                  </p>
                </div>

                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-lg font-bold text-slate-700">
                  +
                </span>
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  executeOperation(
                    'sum_vector',
                    `Suma ${a} + ${b}`,
                    [[a]],
                    [[b]],
                  )
                }
                className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Ejecutar suma
              </button>
            </div>

            {/* Operación de resta. */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Resta
                  </p>

                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    A − B
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    {a} − {b}
                  </p>
                </div>

                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-lg font-bold text-slate-700">
                  −
                </span>
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  executeOperation(
                    'subtract_vector',
                    `Resta ${a} - ${b}`,
                    [[a]],
                    [[b]],
                  )
                }
                className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Ejecutar resta
              </button>
            </div>

            {/* Producto punto. */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Producto punto
                  </p>

                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    A · B
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    {a} · {b}
                  </p>
                </div>

                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-lg font-bold text-slate-700">
                  ·
                </span>
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  executeOperation(
                    'dot_product',
                    `Producto punto ${a} · ${b}`,
                    [[a]],
                    [[b]],
                  )
                }
                className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Ejecutar producto punto
              </button>
            </div>

            {/* Multiplicación por escalar. */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Multiplicación por escalar
                  </p>

                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    A × escalar
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    {a} × {scalar}
                  </p>
                </div>

                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-lg font-bold text-slate-700">
                  ×
                </span>
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  executeOperation(
                    'scalar_multiply',
                    `Multiplicación ${a} × ${scalar}`,
                    [[a]],
                    null,
                    scalar,
                  )
                }
                className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Ejecutar multiplicación
              </button>
            </div>
          </div>
        </section>

        {/* Resultado de la última operación. */}
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Resultado
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                Última operación
              </h2>
            </div>

            <button
              type="button"
              onClick={clearResult}
              disabled={result === null}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Limpiar
            </button>
          </div>

          <div className="mt-6 flex min-h-32 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6">
            {result === null ? (
              <p className="text-sm text-slate-400">
                Ejecuta una operación para visualizar el resultado.
              </p>
            ) : (
              <div className="text-center">
                <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Calculado
                </span>

                <p className="mt-3 break-all text-3xl font-bold text-slate-900">
                  {formatResult(result)}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Historial de operaciones realizadas. */}
        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Registro
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Historial de operaciones
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Consulta las operaciones realizadas anteriormente.
            </p>
          </div>

          <div className="p-6">
            {history.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
                <p className="font-semibold text-slate-600">
                  No hay operaciones registradas.
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  Las operaciones realizadas aparecerán aquí.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <div className="hidden grid-cols-[1.5fr_1fr_1fr] gap-4 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 md:grid">
                  <span>Operación</span>
                  <span>Tipo</span>
                  <span className="text-right">Resultado</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {history.map((operation) => (
                    <div
                      key={operation.id}
                      className="grid gap-3 px-5 py-4 md:grid-cols-[1.5fr_1fr_1fr] md:items-center"
                    >
                      <div>
                        <p className="font-semibold text-slate-800">
                          {operation.name || 'Operación matemática'}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Registro #{operation.id}
                        </p>
                      </div>

                      <div>
                        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          {operation.operation_type}
                        </span>
                      </div>

                      <p className="break-all text-left text-lg font-bold text-slate-900 md:text-right">
                        {formatResult(operation.result)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default Operaciones