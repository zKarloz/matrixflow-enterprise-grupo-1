import { useEffect, useState } from 'react'

import {
  createMatrix,
  createOperation,
  getMatrices,
  type Matrix,
} from '../services/api'

// Empresa utilizada durante el desarrollo local.
// Debe corresponder a una empresa existente en la BD.
const DEFAULT_COMPANY_ID = 2

// Operaciones de matrices soportadas actualmente
// por el backend de MatrixFlow.
type MatrixOperation =
  | 'add_matrix'
  | 'subtract_matrix'
  | 'multiply_matrix'
  | 'transpose_matrix'
  | 'scalar_multiply_matrix'

function Matrices() {
  // ============================================================
  // ESTADO DE DATOS
  // ============================================================

  // Lista real de matrices obtenidas desde FastAPI.
  const [matrices, setMatrices] = useState<Matrix[]>([])

  // Matriz seleccionada como primera entrada.
  const [selectedMatrixA, setSelectedMatrixA] =
    useState<number | ''>('')

  // Matriz seleccionada como segunda entrada.
  const [selectedMatrixB, setSelectedMatrixB] =
    useState<number | ''>('')

  // Escalar utilizado para multiplicación.
  const [scalar, setScalar] = useState('2')

  // Resultado devuelto directamente por el backend.
  const [operationResult, setOperationResult] =
    useState<unknown>(null)

  // Operación actualmente seleccionada.
  const [operation, setOperation] =
    useState<MatrixOperation>('add_matrix')

  // ============================================================
  // ESTADO DEL FORMULARIO DE CREACIÓN
  // ============================================================

  const [newName, setNewName] = useState('')

  const [newDescription, setNewDescription] =
    useState('')

  // Los valores se introducen como:
  // 1,2,3
  // 4,5,6
  const [newValues, setNewValues] =
    useState('')

  // ============================================================
  // ESTADO DE LA INTERFAZ
  // ============================================================

  const [loading, setLoading] = useState(true)

  const [saving, setSaving] = useState(false)

  const [operating, setOperating] = useState(false)

  const [error, setError] = useState('')

  // ============================================================
  // CARGAR MATRICES DESDE EL BACKEND
  // ============================================================

  async function loadMatrices() {
    try {
      setLoading(true)
      setError('')

      // Consultamos las matrices reales.
      const data = await getMatrices()

      setMatrices(data)

      // Si existen matrices, seleccionamos automáticamente
      // las dos primeras.
      if (data.length > 0) {
        setSelectedMatrixA(data[0].id)
      }

      if (data.length > 1) {
        setSelectedMatrixB(data[1].id)
      }
    } catch (err) {
      // Mostramos el error recibido desde FastAPI.
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudieron cargar las matrices.'
      )
    } finally {
      setLoading(false)
    }
  }

  // Cargamos las matrices cuando entra la página.
  useEffect(() => {
    loadMatrices()
  }, [])

  // ============================================================
  // CREAR MATRIZ
  // ============================================================

  function parseMatrixValues(): number[][] {
    // Cada línea representa una fila.
    const rows = newValues
      .trim()
      .split('\n')
      .map((row) =>
        row
          .split(',')
          .map((value) => Number(value.trim()))
      )

    // Validamos que todos los valores sean numéricos.
    if (
      rows.length === 0 ||
      rows.some((row) =>
        row.some((value) => Number.isNaN(value))
      )
    ) {
      throw new Error(
        'Los valores de la matriz deben ser números.'
      )
    }

    // Validamos que todas las filas tengan
    // la misma cantidad de columnas.
    const columns = rows[0].length

    if (
      columns === 0 ||
      rows.some(
        (row) => row.length !== columns
      )
    ) {
      throw new Error(
        'Todas las filas deben tener la misma cantidad de columnas.'
      )
    }

    return rows
  }

  async function handleCreateMatrix() {
    try {
      setSaving(true)
      setError('')

      // Validamos los valores introducidos.
      const values = parseMatrixValues()

      // Enviamos la matriz real al backend.
      await createMatrix({
        company_id: DEFAULT_COMPANY_ID,
        name: newName,
        description: newDescription || null,
        values,
      })

      // Limpiamos el formulario.
      setNewName('')
      setNewDescription('')
      setNewValues('')

      // Volvemos a consultar PostgreSQL.
      await loadMatrices()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo crear la matriz.'
      )
    } finally {
      setSaving(false)
    }
  }

  // ============================================================
  // EJECUTAR OPERACIÓN MATRICIAL
  // ============================================================

  async function handleOperation() {
    try {
      setOperating(true)
      setError('')
      setOperationResult(null)

      // Validamos la primera matriz.
      if (selectedMatrixA === '') {
        throw new Error(
          'Selecciona la primera matriz.'
        )
      }

      // Buscamos la matriz real.
      const matrixA = matrices.find(
        (matrix) =>
          matrix.id === selectedMatrixA
      )

      if (!matrixA) {
        throw new Error(
          'No se encontró la primera matriz.'
        )
      }

      // Determinamos si la operación necesita
      // una segunda matriz.
      const needsSecondMatrix =
        operation === 'add_matrix' ||
        operation === 'subtract_matrix' ||
        operation === 'multiply_matrix'

      let matrixB: Matrix | undefined

      if (needsSecondMatrix) {
        if (selectedMatrixB === '') {
          throw new Error(
            'Selecciona la segunda matriz.'
          )
        }

        matrixB = matrices.find(
          (matrix) =>
            matrix.id === selectedMatrixB
        )

        if (!matrixB) {
          throw new Error(
            'No se encontró la segunda matriz.'
          )
        }
      }

      // Ejecutamos la operación contra el backend.
      const response = await createOperation({
        company_id: DEFAULT_COMPANY_ID,
        name: `Operación ${operation}`,
        operation_type: operation,
        first_values: matrixA.values,
        second_values: matrixB?.values ?? null,
        scalar:
          operation === 'scalar_multiply_matrix'
            ? Number(scalar)
            : null,
        first_matrix_id: matrixA.id,
        second_matrix_id: matrixB?.id ?? null,
      })

      // Guardamos únicamente el resultado que devuelve el backend.
      // Así evitamos recargar toda la página y perder las selecciones.
      setOperationResult(response.result)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo ejecutar la operación.'
      )
    } finally {
      setOperating(false)
    }
  }

  // ============================================================
  // RENDERIZAR MATRIZ
  // ============================================================

  function renderMatrix(
    values: number[][],
    className = 'text-slate-900'
  ) {
    return (
      <div className="space-y-2">
        {values.map((row, rowIndex) => (
          <p
            key={rowIndex}
            className={`font-mono text-lg ${className}`}
          >
            [{row.join(', ')}]
          </p>
        ))}
      </div>
    )
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div>
      {/* ENCABEZADO */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Matrices
        </h1>

        <p className="mt-2 text-slate-500">
          Gestión y operaciones matemáticas con matrices
          almacenadas en el backend.
        </p>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">
            {error}
          </p>
        </div>
      )}

      {/* CREAR MATRIZ */}
      <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">
          Registrar matriz
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Los datos serán guardados directamente en
          PostgreSQL mediante FastAPI.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <input
            value={newName}
            onChange={(event) =>
              setNewName(event.target.value)
            }
            placeholder="Nombre de la matriz"
            className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
          />

          <input
            value={newDescription}
            onChange={(event) =>
              setNewDescription(
                event.target.value
              )
            }
            placeholder="Descripción"
            className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        <textarea
          value={newValues}
          onChange={(event) =>
            setNewValues(event.target.value)
          }
          placeholder={'1,2,3\n4,5,6'}
          rows={4}
          className="mt-4 w-full rounded-lg border border-slate-300 px-4 py-3 font-mono outline-none focus:border-blue-500"
        />

        <button
          type="button"
          onClick={handleCreateMatrix}
          disabled={saving}
          className="mt-4 rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving
            ? 'Guardando...'
            : 'Registrar matriz'}
        </button>
      </section>

      {/* MATRICES REALES */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-bold text-slate-900">
          Matrices registradas
        </h2>

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <p className="text-slate-500">
              Cargando matrices...
            </p>
          </div>
        ) : matrices.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <p className="text-slate-500">
              No existen matrices registradas.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {matrices.map((matrix) => (
              <div
                key={matrix.id}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {matrix.name}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {matrix.rows} × {matrix.columns}
                    </p>
                  </div>

                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                    ID {matrix.id}
                  </span>
                </div>

                {matrix.description && (
                  <p className="mt-3 text-sm text-slate-500">
                    {matrix.description}
                  </p>
                )}

                <div className="mt-5">
                  {renderMatrix(matrix.values)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* OPERACIONES */}
      {matrices.length > 0 && (
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">
            Operaciones matriciales
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Las operaciones son ejecutadas por FastAPI
            utilizando el motor matemático del backend.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {/* PRIMERA MATRIZ */}
            <select
              value={selectedMatrixA}
              onChange={(event) =>
                setSelectedMatrixA(
                  event.target.value
                    ? Number(event.target.value)
                    : ''
                )
              }
              className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="">
                Seleccionar matriz A
              </option>

              {matrices.map((matrix) => (
                <option
                  key={matrix.id}
                  value={matrix.id}
                >
                  {matrix.name} — {matrix.rows}×
                  {matrix.columns}
                </option>
              ))}
            </select>

            {/* SEGUNDA MATRIZ */}
            <select
              value={selectedMatrixB}
              onChange={(event) =>
                setSelectedMatrixB(
                  event.target.value
                    ? Number(event.target.value)
                    : ''
                )
              }
              disabled={
                operation === 'transpose_matrix' ||
                operation ===
                'scalar_multiply_matrix'
              }
              className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 disabled:bg-slate-100"
            >
              <option value="">
                Seleccionar matriz B
              </option>

              {matrices.map((matrix) => (
                <option
                  key={matrix.id}
                  value={matrix.id}
                >
                  {matrix.name} — {matrix.rows}×
                  {matrix.columns}
                </option>
              ))}
            </select>
          </div>

          {/* OPERACIÓN */}
          <select
            value={operation}
            onChange={(event) =>
              setOperation(
                event.target.value as MatrixOperation
              )
            }
            className="mt-4 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
          >
            <option value="add_matrix">
              Suma A + B
            </option>

            <option value="subtract_matrix">
              Resta A - B
            </option>

            <option value="multiply_matrix">
              Multiplicación A × B
            </option>

            <option value="transpose_matrix">
              Transpuesta de A
            </option>

            <option value="scalar_multiply_matrix">
              Multiplicación de A por escalar
            </option>
          </select>

          {/* ESCALAR */}
          {operation ===
            'scalar_multiply_matrix' && (
              <input
                type="number"
                value={scalar}
                onChange={(event) =>
                  setScalar(event.target.value)
                }
                placeholder="Escalar"
                className="mt-4 rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            )}

          {/* BOTÓN */}
          <button
            type="button"
            onClick={handleOperation}
            disabled={operating}
            className="mt-4 rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {operating
              ? 'Ejecutando...'
              : 'Ejecutar operación'}
          </button>

          {/* RESULTADO */}
          {operationResult !== null && (
            <div className="mt-6 rounded-xl bg-slate-50 p-5">
              <p className="mb-3 text-sm font-medium text-slate-500">
                Resultado devuelto por el backend
              </p>

              {Array.isArray(
                operationResult
              ) &&
                Array.isArray(
                  operationResult[0]
                ) ? (
                renderMatrix(
                  operationResult as number[][],
                  'text-blue-600'
                )
              ) : (
                <p className="font-mono text-lg font-bold text-blue-600">
                  {String(operationResult)}
                </p>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  )
}

export default Matrices