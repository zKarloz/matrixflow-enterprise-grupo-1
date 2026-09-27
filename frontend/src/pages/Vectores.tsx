import { useMemo, useState } from 'react'

function Vectores() {
  const [vectorA, setVectorA] = useState<number[]>([
    2,
    4,
    6,
  ])

  const [vectorB, setVectorB] = useState<number[]>([
    1,
    3,
    5,
  ])

  const [scalar, setScalar] = useState('2')

  const [newValueA, setNewValueA] = useState('')
  const [newValueB, setNewValueB] = useState('')

  const sameDimension =
    vectorA.length === vectorB.length

  const suma = useMemo(() => {
    if (!sameDimension) {
      return []
    }

    return vectorA.map(
      (value, index) => value + vectorB[index],
    )
  }, [vectorA, vectorB, sameDimension])

  const resta = useMemo(() => {
    if (!sameDimension) {
      return []
    }

    return vectorA.map(
      (value, index) => value - vectorB[index],
    )
  }, [vectorA, vectorB, sameDimension])

  const productoPunto = useMemo(() => {
    if (!sameDimension) {
      return 0
    }

    return vectorA.reduce(
      (total, value, index) =>
        total + value * vectorB[index],
      0,
    )
  }, [vectorA, vectorB, sameDimension])

  const magnitudA = Math.sqrt(
    vectorA.reduce(
      (total, value) => total + value ** 2,
      0,
    ),
  )

  const magnitudB = Math.sqrt(
    vectorB.reduce(
      (total, value) => total + value ** 2,
      0,
    ),
  )

  const scalarValue = Number(scalar)

  const productoEscalar = vectorA.map(
    (value) => value * scalarValue,
  )

  const updateVectorA = (
    index: number,
    value: number,
  ) => {
    const newVector = [...vectorA]

    newVector[index] = value

    setVectorA(newVector)
  }

  const updateVectorB = (
    index: number,
    value: number,
  ) => {
    const newVector = [...vectorB]

    newVector[index] = value

    setVectorB(newVector)
  }

  const addComponentA = () => {
    if (!newValueA.trim()) {
      return
    }

    setVectorA([
      ...vectorA,
      Number(newValueA),
    ])

    setNewValueA('')
  }

  const addComponentB = () => {
    if (!newValueB.trim()) {
      return
    }

    setVectorB([
      ...vectorB,
      Number(newValueB),
    ])

    setNewValueB('')
  }

  const removeComponentA = () => {
    if (vectorA.length <= 1) {
      return
    }

    setVectorA(vectorA.slice(0, -1))
  }

  const removeComponentB = () => {
    if (vectorB.length <= 1) {
      return
    }

    setVectorB(vectorB.slice(0, -1))
  }

  return (
    <div>

      {/* ENCABEZADO */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Vectores
        </h1>

        <p className="mt-2 text-slate-500">
          Operaciones matemáticas con vectores.
        </p>
      </div>

      {/* ESTADO */}

      <div
        className={`mb-6 rounded-xl border p-4 ${
          sameDimension
            ? 'border-green-200 bg-green-50'
            : 'border-red-200 bg-red-50'
        }`}
      >
        <p
          className={`text-sm font-medium ${
            sameDimension
              ? 'text-green-700'
              : 'text-red-700'
          }`}
        >
          {sameDimension
            ? `Dimensión válida: ambos vectores tienen ${vectorA.length} componentes.`
            : 'Los vectores deben tener la misma cantidad de componentes para realizar suma, resta y producto punto.'}
        </p>
      </div>

      {/* VECTORES */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* VECTOR A */}

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Vector A
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {vectorA.length} componentes
              </p>
            </div>

            <button
              type="button"
              onClick={removeComponentA}
              disabled={vectorA.length <= 1}
              className="rounded-lg border border-red-300 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              - Quitar
            </button>

          </div>

          <div className="mt-5 flex flex-wrap gap-3">

            {vectorA.map((value, index) => (
              <input
                key={index}
                type="number"
                value={value}
                onChange={(event) =>
                  updateVectorA(
                    index,
                    Number(event.target.value),
                  )
                }
                className="w-20 rounded-lg border border-slate-300 px-3 py-2 text-center outline-none focus:border-blue-500"
              />
            ))}

          </div>

          <div className="mt-5 flex gap-2">

            <input
              type="number"
              value={newValueA}
              onChange={(event) =>
                setNewValueA(event.target.value)
              }
              placeholder="Nuevo valor"
              className="flex-1 rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500"
            />

            <button
              type="button"
              onClick={addComponentA}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              + Agregar
            </button>

          </div>

          <div className="mt-5 rounded-lg bg-slate-50 p-4">

            <p className="text-sm text-slate-500">
              Vector A
            </p>

            <p className="mt-2 text-lg font-bold text-slate-900">
              [{vectorA.join(', ')}]
            </p>

          </div>

        </div>

        {/* VECTOR B */}

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Vector B
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {vectorB.length} componentes
              </p>
            </div>

            <button
              type="button"
              onClick={removeComponentB}
              disabled={vectorB.length <= 1}
              className="rounded-lg border border-red-300 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              - Quitar
            </button>

          </div>

          <div className="mt-5 flex flex-wrap gap-3">

            {vectorB.map((value, index) => (
              <input
                key={index}
                type="number"
                value={value}
                onChange={(event) =>
                  updateVectorB(
                    index,
                    Number(event.target.value),
                  )
                }
                className="w-20 rounded-lg border border-slate-300 px-3 py-2 text-center outline-none focus:border-blue-500"
              />
            ))}

          </div>

          <div className="mt-5 flex gap-2">

            <input
              type="number"
              value={newValueB}
              onChange={(event) =>
                setNewValueB(event.target.value)
              }
              placeholder="Nuevo valor"
              className="flex-1 rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500"
            />

            <button
              type="button"
              onClick={addComponentB}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              + Agregar
            </button>

          </div>

          <div className="mt-5 rounded-lg bg-slate-50 p-4">

            <p className="text-sm text-slate-500">
              Vector B
            </p>

            <p className="mt-2 text-lg font-bold text-slate-900">
              [{vectorB.join(', ')}]
            </p>

          </div>

        </div>

      </div>

      {/* OPERACIONES */}

      <div className="mt-8">

        <h2 className="mb-4 text-xl font-bold text-slate-900">
          Operaciones
        </h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

            <p className="text-sm text-slate-500">
              A + B
            </p>

            <p className="mt-3 text-xl font-bold text-slate-900">
              {sameDimension
                ? `[${suma.join(', ')}]`
                : 'Dimensiones diferentes'}
            </p>

          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

            <p className="text-sm text-slate-500">
              A - B
            </p>

            <p className="mt-3 text-xl font-bold text-slate-900">
              {sameDimension
                ? `[${resta.join(', ')}]`
                : 'Dimensiones diferentes'}
            </p>

          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

            <p className="text-sm text-slate-500">
              Producto punto
            </p>

            <p className="mt-3 text-xl font-bold text-blue-600">
              {sameDimension
                ? productoPunto
                : 'No disponible'}
            </p>

          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

            <p className="text-sm text-slate-500">
              Magnitudes
            </p>

            <p className="mt-3 text-sm font-bold text-slate-900">
              |A| = {magnitudA.toFixed(2)}
            </p>

            <p className="mt-1 text-sm font-bold text-slate-900">
              |B| = {magnitudB.toFixed(2)}
            </p>

          </div>

        </div>

      </div>

      {/* ESCALAR */}

      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

        <h2 className="text-xl font-bold text-slate-900">
          Multiplicación por escalar
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Multiplica cada componente del Vector A por un número.
        </p>

        <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-center">

          <input
            type="number"
            value={scalar}
            onChange={(event) =>
              setScalar(event.target.value)
            }
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 md:w-32"
          />

          <div className="rounded-lg bg-slate-50 px-5 py-3">

            <span className="text-sm text-slate-500">
              Resultado:
            </span>

            <span className="ml-2 font-bold text-slate-900">
              [{productoEscalar.join(', ')}]
            </span>

          </div>

        </div>

      </div>

    </div>
  )
}

export default Vectores