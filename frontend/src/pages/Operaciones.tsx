import { useState } from 'react'

interface Operation {
  id: number
  expression: string
  result: string
}

function Operaciones() {
  const [a, setA] = useState(10)
  const [b, setB] = useState(5)

  const [history, setHistory] = useState<Operation[]>([])

  const suma = a + b
  const resta = a - b
  const multiplicacion = a * b
  const division = b === 0 ? null : a / b

  const potencia = a ** b

  const modulo = b === 0 ? null : a % b

  const raizA = a >= 0 ? Math.sqrt(a) : null
  const raizB = b >= 0 ? Math.sqrt(b) : null

  const addHistory = (
    expression: string,
    result: string,
  ) => {
    const newOperation: Operation = {
      id: Date.now(),
      expression,
      result,
    }

    setHistory((current) => [
      newOperation,
      ...current,
    ])
  }

  const clearHistory = () => {
    setHistory([])
  }

  return (
    <div>

      {/* ENCABEZADO */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Operaciones
        </h1>

        <p className="mt-2 text-slate-500">
          Centro de operaciones matemáticas de MATRIXFLOW.
        </p>
      </div>

      {/* VALORES */}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

        <h2 className="text-xl font-bold text-slate-900">
          Valores de entrada
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Introduce los valores que deseas utilizar en las operaciones.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">

          <div>

            <label className="text-sm font-medium text-slate-600">
              Valor A
            </label>

            <input
              type="number"
              value={a}
              onChange={(event) =>
                setA(Number(event.target.value))
              }
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />

          </div>

          <div>

            <label className="text-sm font-medium text-slate-600">
              Valor B
            </label>

            <input
              type="number"
              value={b}
              onChange={(event) =>
                setB(Number(event.target.value))
              }
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />

          </div>

        </div>

      </div>

      {/* OPERACIONES BÁSICAS */}

      <div className="mt-8">

        <h2 className="mb-4 text-xl font-bold text-slate-900">
          Operaciones básicas
        </h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">

          {/* SUMA */}

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

            <p className="text-sm text-slate-500">
              Suma
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {suma}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {a} + {b}
            </p>

            <button
              type="button"
              onClick={() =>
                addHistory(
                  `${a} + ${b}`,
                  suma.toString(),
                )
              }
              className="mt-4 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
            >
              Guardar resultado
            </button>

          </div>

          {/* RESTA */}

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

            <p className="text-sm text-slate-500">
              Resta
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {resta}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {a} - {b}
            </p>

            <button
              type="button"
              onClick={() =>
                addHistory(
                  `${a} - ${b}`,
                  resta.toString(),
                )
              }
              className="mt-4 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
            >
              Guardar resultado
            </button>

          </div>

          {/* MULTIPLICACIÓN */}

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

            <p className="text-sm text-slate-500">
              Multiplicación
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {multiplicacion}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {a} × {b}
            </p>

            <button
              type="button"
              onClick={() =>
                addHistory(
                  `${a} × ${b}`,
                  multiplicacion.toString(),
                )
              }
              className="mt-4 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
            >
              Guardar resultado
            </button>

          </div>

          {/* DIVISIÓN */}

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

            <p className="text-sm text-slate-500">
              División
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {division === null
                ? 'No definida'
                : division.toFixed(2)}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {a} ÷ {b}
            </p>

            <button
              type="button"
              disabled={division === null}
              onClick={() =>
                division !== null &&
                addHistory(
                  `${a} ÷ ${b}`,
                  division.toFixed(2),
                )
              }
              className="mt-4 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Guardar resultado
            </button>

          </div>

        </div>

      </div>

      {/* OPERACIONES AVANZADAS */}

      <div className="mt-8">

        <h2 className="mb-4 text-xl font-bold text-slate-900">
          Operaciones avanzadas
        </h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">

          {/* POTENCIA */}

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

            <p className="text-sm text-slate-500">
              Potencia
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {potencia}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {a} ^ {b}
            </p>

            <button
              type="button"
              onClick={() =>
                addHistory(
                  `${a} ^ ${b}`,
                  potencia.toString(),
                )
              }
              className="mt-4 rounded-lg bg-slate-800 px-3 py-2 text-xs font-medium text-white hover:bg-slate-900"
            >
              Guardar resultado
            </button>

          </div>

          {/* MÓDULO */}

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

            <p className="text-sm text-slate-500">
              Módulo
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {modulo === null
                ? 'No definido'
                : modulo}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {a} % {b}
            </p>

            <button
              type="button"
              disabled={modulo === null}
              onClick={() =>
                modulo !== null &&
                addHistory(
                  `${a} % ${b}`,
                  modulo.toString(),
                )
              }
              className="mt-4 rounded-lg bg-slate-800 px-3 py-2 text-xs font-medium text-white hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Guardar resultado
            </button>

          </div>

          {/* RAÍZ A */}

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

            <p className="text-sm text-slate-500">
              Raíz de A
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {raizA === null
                ? 'No definida'
                : raizA.toFixed(2)}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              √{a}
            </p>

            <button
              type="button"
              disabled={raizA === null}
              onClick={() =>
                raizA !== null &&
                addHistory(
                  `√${a}`,
                  raizA.toFixed(2),
                )
              }
              className="mt-4 rounded-lg bg-slate-800 px-3 py-2 text-xs font-medium text-white hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Guardar resultado
            </button>

          </div>

          {/* RAÍZ B */}

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

            <p className="text-sm text-slate-500">
              Raíz de B
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {raizB === null
                ? 'No definida'
                : raizB.toFixed(2)}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              √{b}
            </p>

            <button
              type="button"
              disabled={raizB === null}
              onClick={() =>
                raizB !== null &&
                addHistory(
                  `√${b}`,
                  raizB.toFixed(2),
                )
              }
              className="mt-4 rounded-lg bg-slate-800 px-3 py-2 text-xs font-medium text-white hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Guardar resultado
            </button>

          </div>

        </div>

      </div>

      {/* HISTORIAL */}

      <div className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm">

        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-6 md:flex-row md:items-center">

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Historial de operaciones
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Resultados guardados durante esta sesión.
            </p>
          </div>

          <button
            type="button"
            onClick={clearHistory}
            disabled={history.length === 0}
            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Limpiar historial
          </button>

        </div>

        <div className="p-6">

          {history.length === 0 ? (

            <div className="rounded-lg bg-slate-50 p-8 text-center">

              <p className="font-medium text-slate-600">
                No hay operaciones guardadas.
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Utiliza "Guardar resultado" para agregar operaciones.
              </p>

            </div>

          ) : (

            <div className="space-y-3">

              {history.map((operation) => (

                <div
                  key={operation.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 p-4"
                >

                  <div>

                    <p className="font-medium text-slate-700">
                      {operation.expression}
                    </p>

                  </div>

                  <p className="text-lg font-bold text-blue-600">
                    = {operation.result}
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