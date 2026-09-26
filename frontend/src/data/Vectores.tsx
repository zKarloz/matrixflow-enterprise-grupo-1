import { useState } from 'react'

function Vectores() {
  const [vectorA, setVectorA] = useState([2, 4, 6])
  const [vectorB, setVectorB] = useState([1, 3, 5])

  const suma = vectorA.map(
    (value, index) => value + vectorB[index],
  )

  const resta = vectorA.map(
    (value, index) => value - vectorB[index],
  )

  const productoPunto = vectorA.reduce(
    (total, value, index) =>
      total + value * vectorB[index],
    0,
  )

  return (
    <div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Vectores
        </h1>

        <p className="mt-2 text-slate-500">
          Operaciones matemáticas con vectores.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

          <h2 className="text-lg font-semibold text-slate-900">
            Vector A
          </h2>

          <div className="mt-4 flex gap-3">
            {vectorA.map((value, index) => (
              <input
                key={index}
                type="number"
                value={value}
                onChange={(event) => {
                  const newVector = [...vectorA]
                  newVector[index] = Number(event.target.value)
                  setVectorA(newVector)
                }}
                className="w-20 rounded-lg border border-slate-300 px-3 py-2 text-center"
              />
            ))}
          </div>

        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

          <h2 className="text-lg font-semibold text-slate-900">
            Vector B
          </h2>

          <div className="mt-4 flex gap-3">
            {vectorB.map((value, index) => (
              <input
                key={index}
                type="number"
                value={value}
                onChange={(event) => {
                  const newVector = [...vectorB]
                  newVector[index] = Number(event.target.value)
                  setVectorB(newVector)
                }}
                className="w-20 rounded-lg border border-slate-300 px-3 py-2 text-center"
              />
            ))}
          </div>

        </div>

      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            A + B
          </p>

          <p className="mt-3 text-xl font-bold text-slate-900">
            [{suma.join(', ')}]
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            A - B
          </p>

          <p className="mt-3 text-xl font-bold text-slate-900">
            [{resta.join(', ')}]
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Producto punto
          </p>

          <p className="mt-3 text-xl font-bold text-blue-600">
            {productoPunto}
          </p>
        </div>

      </div>

    </div>
  )
}

export default Vectores