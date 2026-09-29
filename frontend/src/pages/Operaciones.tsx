import { useEffect, useState } from 'react'
import {
  createOperation,
  getOperations,
  type Operation,
} from '../services/api'

// Empresa utilizada durante el desarrollo local.
// Debe coincidir con la empresa que venimos utilizando en MatrixFlow.
const DEFAULT_COMPANY_ID = 2

// Operaciones matemáticas que actualmente soporta el backend.
type OperationType =
  | 'sum_vector'
  | 'subtract_vector'
  | 'dot_product'
  | 'scalar_multiply'

// Página principal del módulo de operaciones.
function Operaciones() {
  // Valores de entrada introducidos por el usuario.
  const [a, setA] = useState<number>(10)
  const [b, setB] = useState<number>(5)

  // Escalar utilizado para la multiplicación escalar.
  const [scalar, setScalar] = useState<number>(2)

  // Historial obtenido realmente desde el backend.
  const [history, setHistory] = useState<Operation[]>([])

  // Resultado de la última operación ejecutada.
  const [result, setResult] = useState<unknown>(null)

  // Indica si estamos consultando o ejecutando una operación.
  const [loading, setLoading] = useState(false)

  // Mensaje de error mostrado al usuario.
  const [error, setError] = useState<string | null>(null)

  // Carga el historial real almacenado por el backend.
  const loadHistory = async () => {
    try {
      setError(null)

      // Consultamos las operaciones registradas.
      const operations = await getOperations()

      // Mostramos las operaciones recibidas.
      setHistory(operations)
    } catch (err) {
      // Mostramos un mensaje comprensible si falla la petición.
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo cargar el historial.'
      )
    }
  }

  // Cargamos el historial cuando se abre la página.
  useEffect(() => {
    loadHistory()
  }, [])

  // Ejecuta una operación utilizando FastAPI.
  const executeOperation = async (
    operationType: OperationType,
    operationName: string,
    firstValues: number[][],
    secondValues?: number[][] | null,
    operationScalar?: number | null
  ) => {
    try {
      setLoading(true)
      setError(null)

      // Enviamos los datos al backend.
      const response = await createOperation({
        company_id: DEFAULT_COMPANY_ID,
        name: operationName,
        operation_type: operationType,
        first_values: firstValues,
        second_values: secondValues ?? null,
        scalar: operationScalar ?? null,
      })

      // Guardamos el resultado calculado por FastAPI.
      setResult(response.result)

      // Volvemos a consultar el historial para mostrar
      // la operación que acaba de registrarse en PostgreSQL.
      await loadHistory()
    } catch (err) {
      // Mostramos el error devuelto por el backend.
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo ejecutar la operación.'
      )
    } finally {
      // Finalizamos el estado de carga.
      setLoading(false)
    }
  }

  // Limpia únicamente el resultado mostrado actualmente.
  // El historial permanece almacenado en el backend.
  const clearResult = () => {
    setResult(null)
  }

  return (
    <div>
      {/* Encabezado principal del módulo. */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Operaciones
        </h1>

        <p className="mt-2 text-slate-500">
          Centro de operaciones matemáticas de MATRIXFLOW.
        </p>
      </div>

      {/* Mensaje de error del backend. */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Valores de entrada. */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">
          Valores de entrada
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Introduce los valores que deseas utilizar.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
          {/* Valor A. */}
          <div>
            <label className="text-sm font-medium text-slate-600">
              Valor A
            </label>

            <input
              type="number"
              value={a}
              onChange={(event) => setA(Number(event.target.value))}
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          {/* Valor B. */}
          <div>
            <label className="text-sm font-medium text-slate-600">
              Valor B
            </label>

            <input
              type="number"
              value={b}
              onChange={(event) => setB(Number(event.target.value))}
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          {/* Escalar. */}
          <div>
            <label className="text-sm font-medium text-slate-600">
              Escalar
            </label>

            <input
              type="number"
              value={scalar}
              onChange={(event) =>
                setScalar(Number(event.target.value))
              }
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Operaciones disponibles en el backend. */}
      <div className="mt-8">
        <h2 className="mb-4 text-xl font-bold text-slate-900">
          Operaciones disponibles
        </h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Suma. */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Suma
            </p>

            <p className="mt-2 text-lg font-semibold text-slate-900">
              A + B
            </p>

            <p className="mt-1 text-sm text-slate-400">
              {a} + {b}
            </p>

            <button
              type="button"
              disabled={loading}
              onClick={() =>
                executeOperation(
                  'sum_vector',
                  `Suma ${a} + ${b}`,
                  [[a]],
                  [[b]]
                )
              }
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Ejecutar suma
            </button>
          </div>

          {/* Resta. */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Resta
            </p>

            <p className="mt-2 text-lg font-semibold text-slate-900">
              A - B
            </p>

            <p className="mt-1 text-sm text-slate-400">
              {a} - {b}
            </p>

            <button
              type="button"
              disabled={loading}
              onClick={() =>
                executeOperation(
                  'subtract_vector',
                  `Resta ${a} - ${b}`,
                  [[a]],
                  [[b]]
                )
              }
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Ejecutar resta
            </button>
          </div>

          {/* Producto punto. */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Producto punto
            </p>

            <p className="mt-2 text-lg font-semibold text-slate-900">
              A · B
            </p>

            <p className="mt-1 text-sm text-slate-400">
              {a} · {b}
            </p>

            <button
              type="button"
              disabled={loading}
              onClick={() =>
                executeOperation(
                  'dot_product',
                  `Producto punto ${a} · ${b}`,
                  [[a]],
                  [[b]]
                )
              }
              className="mt-4 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Ejecutar producto punto
            </button>
          </div>

          {/* Multiplicación por escalar. */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Multiplicación por escalar
            </p>

            <p className="mt-2 text-lg font-semibold text-slate-900">
              A × escalar
            </p>

            <p className="mt-1 text-sm text-slate-400">
              {a} × {scalar}
            </p>

            <button
              type="button"
              disabled={loading}
              onClick={() =>
                executeOperation(
                  'scalar_multiply',
                  `Multiplicación ${a} × ${scalar}`,
                  [[a]],
                  null,
                  scalar
                )
              }
              className="mt-4 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Ejecutar multiplicación
            </button>
          </div>
        </div>
      </div>

      {/* Resultado recibido desde FastAPI. */}
      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Resultado
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Resultado calculado por el backend.
            </p>
          </div>

          <button
            type="button"
            onClick={clearResult}
            disabled={result === null}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Limpiar
          </button>
        </div>

        <div className="mt-6 rounded-lg bg-slate-50 p-6 text-center">
          {result === null ? (
            <p className="text-sm text-slate-400">
              Ejecuta una operación para ver el resultado.
            </p>
          ) : (
            <p className="text-3xl font-bold text-blue-600">
              {Array.isArray(result)
                ? JSON.stringify(result)
                : String(result)}
            </p>
          )}
        </div>
      </div>

      {/* Historial persistido en el backend. */}
      <div className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900">
            Historial de operaciones
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Operaciones registradas por MATRIXFLOW.
          </p>
        </div>

        <div className="p-6">
          {history.length === 0 ? (
            <div className="rounded-lg bg-slate-50 p-8 text-center">
              <p className="font-medium text-slate-600">
                No hay operaciones registradas.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((operation) => (
                <div
                  key={operation.id}
                  className="flex flex-col gap-2 rounded-lg border border-slate-200 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-medium text-slate-700">
                      {/* Mostramos un texto alternativo si el registro antiguo no tiene nombre. */}
                      {operation.name || 'Operación matemática'}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {operation.operation_type}
                    </p>
                  </div>

                  <p className="text-lg font-bold text-blue-600">
                    {/*
                      Convertimos el resultado del backend en un texto seguro.
                      Así evitamos mostrar "undefined" cuando una operación antigua
                      no tenga un resultado disponible.
                    */}
                    {operation.result === undefined || operation.result === null
                      ? 'Resultado no disponible'
                      : Array.isArray(operation.result)
                        ? JSON.stringify(operation.result)
                        : String(operation.result)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Operaciones