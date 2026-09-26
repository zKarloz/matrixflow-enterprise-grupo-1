import { useMemo, useState } from 'react'

type Matrix = number[][]

function Matrices() {
  const [matrixA, setMatrixA] = useState<Matrix>([
    [1, 2],
    [3, 4],
  ])

  const [matrixB, setMatrixB] = useState<Matrix>([
    [5, 6],
    [7, 8],
  ])

  const [newValueA, setNewValueA] = useState('')
  const [newValueB, setNewValueB] = useState('')

  const [scalar, setScalar] = useState('2')

  const sameDimensions =
    matrixA.length === matrixB.length &&
    matrixA[0]?.length === matrixB[0]?.length

  const canMultiply =
    matrixA[0]?.length === matrixB.length

  const suma = useMemo(() => {
    if (!sameDimensions) {
      return []
    }

    return matrixA.map((row, i) =>
      row.map(
        (value, j) => value + matrixB[i][j],
      ),
    )
  }, [matrixA, matrixB, sameDimensions])

  const resta = useMemo(() => {
    if (!sameDimensions) {
      return []
    }

    return matrixA.map((row, i) =>
      row.map(
        (value, j) => value - matrixB[i][j],
      ),
    )
  }, [matrixA, matrixB, sameDimensions])

  const multiplicacion = useMemo(() => {
    if (!canMultiply) {
      return []
    }

    return matrixA.map((row) =>
      matrixB[0].map((_, columnIndex) =>
        row.reduce(
          (total, value, rowIndex) =>
            total +
            value *
              matrixB[rowIndex][columnIndex],
          0,
        ),
      ),
    )
  }, [matrixA, matrixB, canMultiply])

  const transposeA = useMemo(() => {
    return matrixA[0].map((_, columnIndex) =>
      matrixA.map(
        (row) => row[columnIndex],
      ),
    )
  }, [matrixA])

  const transposeB = useMemo(() => {
    return matrixB[0].map((_, columnIndex) =>
      matrixB.map(
        (row) => row[columnIndex],
      ),
    )
  }, [matrixB])

  const determinantA =
    matrixA.length === 2 &&
    matrixA[0].length === 2
      ? matrixA[0][0] * matrixA[1][1] -
        matrixA[0][1] * matrixA[1][0]
      : null

  const determinantB =
    matrixB.length === 2 &&
    matrixB[0].length === 2
      ? matrixB[0][0] * matrixB[1][1] -
        matrixB[0][1] * matrixB[1][0]
      : null

  const scalarValue = Number(scalar)

  const scalarMatrix = matrixA.map(
    (row) =>
      row.map(
        (value) => value * scalarValue,
      ),
  )

  const updateMatrix = (
    matrix: Matrix,
    setMatrix: React.Dispatch<
      React.SetStateAction<Matrix>
    >,
    row: number,
    column: number,
    value: number,
  ) => {
    const newMatrix = matrix.map(
      (currentRow) => [...currentRow],
    )

    newMatrix[row][column] = value

    setMatrix(newMatrix)
  }

  const addRow = (
    matrix: Matrix,
    setMatrix: React.Dispatch<
      React.SetStateAction<Matrix>
    >,
    value: number,
  ) => {
    const columns = matrix[0]?.length ?? 2

    setMatrix([
      ...matrix,
      Array(columns).fill(value),
    ])
  }

  const removeRow = (
    matrix: Matrix,
    setMatrix: React.Dispatch<
      React.SetStateAction<Matrix>
    >,
  ) => {
    if (matrix.length <= 1) {
      return
    }

    setMatrix(matrix.slice(0, -1))
  }

  const addColumn = (
    matrix: Matrix,
    setMatrix: React.Dispatch<
      React.SetStateAction<Matrix>
    >,
    value: number,
  ) => {
    setMatrix(
      matrix.map((row) => [
        ...row,
        value,
      ]),
    )
  }

  const removeColumn = (
    matrix: Matrix,
    setMatrix: React.Dispatch<
      React.SetStateAction<Matrix>
    >,
  ) => {
    if ((matrix[0]?.length ?? 0) <= 1) {
      return
    }

    setMatrix(
      matrix.map((row) =>
        row.slice(0, -1),
      ),
    )
  }

  const addComponentA = () => {
    if (!newValueA.trim()) {
      return
    }

    addRow(
      matrixA,
      setMatrixA,
      Number(newValueA),
    )

    setNewValueA('')
  }

  const addComponentB = () => {
    if (!newValueB.trim()) {
      return
    }

    addRow(
      matrixB,
      setMatrixB,
      Number(newValueB),
    )

    setNewValueB('')
  }

  const renderMatrix = (
    matrix: Matrix,
    color = 'text-slate-900',
  ) => (
    <div className="space-y-2">
      {matrix.map((row, rowIndex) => (
        <p
          key={rowIndex}
          className={`font-mono text-lg ${color}`}
        >
          [{row.join(', ')}]
        </p>
      ))}
    </div>
  )

  return (
    <div>

      {/* ENCABEZADO */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Matrices
        </h1>

        <p className="mt-2 text-slate-500">
          Operaciones matemáticas con matrices.
        </p>
      </div>

      {/* ESTADO */}

      <div
        className={`mb-6 rounded-xl border p-4 ${
          sameDimensions
            ? 'border-green-200 bg-green-50'
            : 'border-red-200 bg-red-50'
        }`}
      >
        <p
          className={`text-sm font-medium ${
            sameDimensions
              ? 'text-green-700'
              : 'text-red-700'
          }`}
        >
          {sameDimensions
            ? `Dimensiones compatibles para suma y resta: ${matrixA.length} × ${matrixA[0].length}.`
            : 'Las matrices deben tener las mismas dimensiones para realizar suma y resta.'}
        </p>
      </div>

      {/* MATRICES */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* MATRIZ A */}

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Matriz A
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {matrixA.length} × {matrixA[0].length}
              </p>
            </div>

            <div className="flex gap-2">

              <button
                type="button"
                onClick={() =>
                  addColumn(
                    matrixA,
                    setMatrixA,
                    0,
                  )
                }
                className="rounded-lg border border-blue-300 px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50"
              >
                + Columna
              </button>

              <button
                type="button"
                onClick={() =>
                  removeColumn(
                    matrixA,
                    setMatrixA,
                  )
                }
                className="rounded-lg border border-red-300 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
              >
                - Columna
              </button>

            </div>

          </div>

          <div className="mt-5 space-y-3">

            {matrixA.map(
              (row, rowIndex) => (
                <div
                  key={rowIndex}
                  className="flex gap-3"
                >

                  {row.map(
                    (value, columnIndex) => (
                      <input
                        key={columnIndex}
                        type="number"
                        value={value}
                        onChange={(event) =>
                          updateMatrix(
                            matrixA,
                            setMatrixA,
                            rowIndex,
                            columnIndex,
                            Number(
                              event.target.value,
                            ),
                          )
                        }
                        className="w-20 rounded-lg border border-slate-300 px-3 py-2 text-center outline-none focus:border-blue-500"
                      />
                    ),
                  )}

                </div>
              ),
            )}

          </div>

          <div className="mt-5 flex gap-2">

            <input
              type="number"
              value={newValueA}
              onChange={(event) =>
                setNewValueA(
                  event.target.value,
                )
              }
              placeholder="Valor fila"
              className="flex-1 rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500"
            />

            <button
              type="button"
              onClick={addComponentA}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              + Fila
            </button>

            <button
              type="button"
              onClick={() =>
                removeRow(
                  matrixA,
                  setMatrixA,
                )
              }
              className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              - Fila
            </button>

          </div>

        </div>

        {/* MATRIZ B */}

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Matriz B
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {matrixB.length} × {matrixB[0].length}
              </p>
            </div>

            <div className="flex gap-2">

              <button
                type="button"
                onClick={() =>
                  addColumn(
                    matrixB,
                    setMatrixB,
                    0,
                  )
                }
                className="rounded-lg border border-blue-300 px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50"
              >
                + Columna
              </button>

              <button
                type="button"
                onClick={() =>
                  removeColumn(
                    matrixB,
                    setMatrixB,
                  )
                }
                className="rounded-lg border border-red-300 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
              >
                - Columna
              </button>

            </div>

          </div>

          <div className="mt-5 space-y-3">

            {matrixB.map(
              (row, rowIndex) => (
                <div
                  key={rowIndex}
                  className="flex gap-3"
                >

                  {row.map(
                    (value, columnIndex) => (
                      <input
                        key={columnIndex}
                        type="number"
                        value={value}
                        onChange={(event) =>
                          updateMatrix(
                            matrixB,
                            setMatrixB,
                            rowIndex,
                            columnIndex,
                            Number(
                              event.target.value,
                            ),
                          )
                        }
                        className="w-20 rounded-lg border border-slate-300 px-3 py-2 text-center outline-none focus:border-blue-500"
                      />
                    ),
                  )}

                </div>
              ),
            )}

          </div>

          <div className="mt-5 flex gap-2">

            <input
              type="number"
              value={newValueB}
              onChange={(event) =>
                setNewValueB(
                  event.target.value,
                )
              }
              placeholder="Valor fila"
              className="flex-1 rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500"
            />

            <button
              type="button"
              onClick={addComponentB}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              + Fila
            </button>

            <button
              type="button"
              onClick={() =>
                removeRow(
                  matrixB,
                  setMatrixB,
                )
              }
              className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              - Fila
            </button>

          </div>

        </div>

      </div>

      {/* OPERACIONES */}

      <div className="mt-8">

        <h2 className="mb-4 text-xl font-bold text-slate-900">
          Operaciones
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

          {/* SUMA */}

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

            <h3 className="font-semibold text-slate-900">
              A + B
            </h3>

            <div className="mt-4">

              {sameDimensions
                ? renderMatrix(
                    suma,
                  )
                : (
                  <p className="text-sm text-red-500">
                    Dimensiones incompatibles.
                  </p>
                )}

            </div>

          </div>

          {/* RESTA */}

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

            <h3 className="font-semibold text-slate-900">
              A - B
            </h3>

            <div className="mt-4">

              {sameDimensions
                ? renderMatrix(
                    resta,
                  )
                : (
                  <p className="text-sm text-red-500">
                    Dimensiones incompatibles.
                  </p>
                )}

            </div>

          </div>

          {/* MULTIPLICACIÓN */}

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

            <h3 className="font-semibold text-slate-900">
              A × B
            </h3>

            <div className="mt-4">

              {canMultiply
                ? renderMatrix(
                    multiplicacion,
                    'text-blue-600',
                  )
                : (
                  <p className="text-sm text-red-500">
                    Las columnas de A deben coincidir con las filas de B.
                  </p>
                )}

            </div>

          </div>

          {/* TRANSPUESTAS */}

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

            <h3 className="font-semibold text-slate-900">
              Transpuesta
            </h3>

            <div className="mt-4 grid grid-cols-2 gap-6">

              <div>
                <p className="mb-2 text-sm text-slate-500">
                  Aᵀ
                </p>

                {renderMatrix(
                  transposeA,
                )}
              </div>

              <div>
                <p className="mb-2 text-sm text-slate-500">
                  Bᵀ
                </p>

                {renderMatrix(
                  transposeB,
                )}
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* DETERMINANTES */}

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

          <p className="text-sm text-slate-500">
            Determinante de A
          </p>

          <p className="mt-3 text-2xl font-bold text-blue-600">
            {determinantA !== null
              ? determinantA
              : 'Disponible para matrices 2 × 2'}
          </p>

        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

          <p className="text-sm text-slate-500">
            Determinante de B
          </p>

          <p className="mt-3 text-2xl font-bold text-blue-600">
            {determinantB !== null
              ? determinantB
              : 'Disponible para matrices 2 × 2'}
          </p>

        </div>

      </div>

      {/* ESCALAR */}

      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

        <h2 className="text-xl font-bold text-slate-900">
          Multiplicación por escalar
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Multiplica todos los elementos de la matriz A por un número.
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
              {scalarMatrix.map(
                (row) => `[${row.join(', ')}]`,
              ).join(' ')}
            </span>

          </div>

        </div>

      </div>

    </div>
  )
}

export default Matrices