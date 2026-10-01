import { useEffect, useState } from 'react'

import {
  createMatrix,
  createOperation,
  getMatrices,
  type Matrix,
} from '../services/api'

// Empresa utilizada actualmente para registrar las operaciones.
// Se mantiene para conservar la integración existente.
const DEFAULT_COMPANY_ID = 2

// Operaciones matriciales disponibles en la aplicación.
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

  // Lista de matrices registradas.
  const [matrices, setMatrices] = useState<Matrix[]>([])

  // Matriz seleccionada como primera entrada.
  const [selectedMatrixA, setSelectedMatrixA] =
    useState<number | ''>('')

  // Matriz seleccionada como segunda entrada.
  const [selectedMatrixB, setSelectedMatrixB] =
    useState<number | ''>('')

  // Valor utilizado para la multiplicación por escalar.
  const [scalar, setScalar] = useState('2')

  // Resultado de la operación actual.
  const [operationResult, setOperationResult] =
    useState<unknown>(null)

  // Operación actualmente seleccionada.
  const [operation, setOperation] =
    useState<MatrixOperation>('add_matrix')

  // ============================================================
  // FORMULARIO DE CREACIÓN
  // ============================================================

  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')

  // Cada línea representa una fila de la matriz.
  const [newValues, setNewValues] = useState('')

  // ============================================================
  // ESTADO DE LA INTERFAZ
  // ============================================================

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [operating, setOperating] = useState(false)
  const [error, setError] = useState('')

  // ============================================================
  // CARGAR MATRICES
  // ============================================================

  async function loadMatrices() {
    try {
      setLoading(true)
      setError('')

      // Recuperamos las matrices registradas.
      const data = await getMatrices()

      setMatrices(data)

      // Seleccionamos automáticamente las primeras matrices
      // disponibles para facilitar el uso de la herramienta.
      if (data.length > 0) {
        setSelectedMatrixA(data[0].id)
      }

      if (data.length > 1) {
        setSelectedMatrixB(data[1].id)
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
  // EJECUTAR OPERACIÓN MATRICIAL
  // ============================================================

  async function handleOperation() {
    try {
      setOperating(true)
      setError('')
      setOperationResult(null)

      // La primera matriz siempre es necesaria.
      if (selectedMatrixA === '') {
        throw new Error('Selecciona la primera matriz.')
      }

      // Buscamos la matriz seleccionada.
      const matrixA = matrices.find(
        (matrix) => matrix.id === selectedMatrixA,
      )

      if (!matrixA) {
        throw new Error('No se encontró la primera matriz.')
      }

      // Estas operaciones requieren una segunda matriz.
      const needsSecondMatrix =
        operation === 'add_matrix' ||
        operation === 'subtract_matrix' ||
        operation === 'multiply_matrix'

      let matrixB: Matrix | undefined

      if (needsSecondMatrix) {
        if (selectedMatrixB === '') {
          throw new Error('Selecciona la segunda matriz.')
        }

        matrixB = matrices.find(
          (matrix) => matrix.id === selectedMatrixB,
        )

        if (!matrixB) {
          throw new Error('No se encontró la segunda matriz.')
        }
      }

      // Ejecutamos la operación seleccionada.
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

      // Mostramos únicamente el resultado obtenido.
      setOperationResult(response.result)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo ejecutar la operación.',
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
    className = 'text-slate-900',
  ) {
    return (
      <div className="space-y-2">
        {values.map((row, rowIndex) => (
          <p
            key={rowIndex}
            className={`font-mono text-base ${className}`}
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
    <div className="min-h-full bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* =====================================================
            ENCABEZADO
            ===================================================== */}

        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-slate-500">
            Análisis matemático
          </p>

          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Matrices
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Crea, consulta y ejecuta operaciones sobre
                matrices utilizadas en el análisis empresarial.
              </p>
            </div>

            {/* Indicador compacto de matrices disponibles. */}
            <div className="inline-flex w-fit items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 font-mono text-sm font-bold text-slate-700">
                M
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Registradas
                </p>

                <p className="text-lg font-bold text-slate-900">
                  {matrices.length}
                </p>
              </div>
            </div>
          </div>
        </div>

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

        <section className="mb-8">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-900">
              Matrices registradas
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Consulta la estructura y los valores disponibles
              para realizar operaciones.
            </p>
          </div>

          {loading ? (
            // Skeleton visual mientras se cargan las matrices.
            <div className="grid gap-5 md:grid-cols-2">
              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6"
                >
                  <div className="h-5 w-40 rounded bg-slate-200" />
                  <div className="mt-3 h-3 w-24 rounded bg-slate-100" />

                  <div className="mt-6 space-y-3">
                    <div className="h-4 w-48 rounded bg-slate-100" />
                    <div className="h-4 w-56 rounded bg-slate-100" />
                    <div className="h-4 w-44 rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : matrices.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 font-mono text-lg font-bold text-slate-500">
                M
              </div>

              <h3 className="mt-4 text-sm font-semibold text-slate-900">
                No hay matrices registradas
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Registra una matriz para comenzar a trabajar
                con operaciones matemáticas.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {matrices.map((matrix) => (
                <div
                  key={matrix.id}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                >
                  {/* Encabezado de la tarjeta */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="truncate font-bold text-slate-900">
                        {matrix.name}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Matriz {matrix.rows} × {matrix.columns}
                      </p>
                    </div>

                    <span className="shrink-0 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                      #{matrix.id}
                    </span>
                  </div>

                  {/* Descripción */}
                  {matrix.description && (
                    <p className="mt-4 border-l-2 border-slate-200 pl-3 text-sm leading-5 text-slate-500">
                      {matrix.description}
                    </p>
                  )}

                  {/* Representación visual de la matriz */}
                  <div className="mt-5 overflow-x-auto rounded-xl border border-slate-100 bg-slate-50 p-4">
                    {renderMatrix(matrix.values)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* =====================================================
            OPERACIONES MATRICIALES
            ===================================================== */}

        {matrices.length > 0 && (
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 font-mono text-sm font-bold text-white">
                  ∑
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Operaciones matriciales
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Selecciona las matrices y la operación que
                    deseas ejecutar.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Selección de matrices */}
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Matriz A
                  </label>

                  <select
                    value={selectedMatrixA}
                    onChange={(event) =>
                      setSelectedMatrixA(
                        event.target.value
                          ? Number(event.target.value)
                          : '',
                      )
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
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
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Matriz B
                  </label>

                  <select
                    value={selectedMatrixB}
                    onChange={(event) =>
                      setSelectedMatrixB(
                        event.target.value
                          ? Number(event.target.value)
                          : '',
                      )
                    }
                    disabled={
                      operation === 'transpose_matrix' ||
                      operation ===
                      'scalar_multiply_matrix'
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
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
              </div>

              {/* Tipo de operación */}
              <div className="mt-5">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Operación
                </label>

                <select
                  value={operation}
                  onChange={(event) =>
                    setOperation(
                      event.target.value as MatrixOperation,
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                >
                  <option value="add_matrix">
                    Suma A + B
                  </option>

                  <option value="subtract_matrix">
                    Resta A − B
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
              </div>

              {/* Escalar */}
              {operation === 'scalar_multiply_matrix' && (
                <div className="mt-5 max-w-xs">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Escalar
                  </label>

                  <input
                    type="number"
                    value={scalar}
                    onChange={(event) =>
                      setScalar(event.target.value)
                    }
                    placeholder="Ej. 2"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                  />
                </div>
              )}

              {/* Botón de ejecución */}
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={handleOperation}
                  disabled={operating}
                  className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {operating
                    ? 'Ejecutando...'
                    : 'Ejecutar operación'}
                </button>
              </div>

              {/* =================================================
                  RESULTADO
                  ================================================= */}

              {operationResult !== null && (
                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Resultado
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Resultado de la operación seleccionada
                      </p>
                    </div>

                    <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      Calculado
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-5">
                    {Array.isArray(operationResult) &&
                      Array.isArray(operationResult[0]) ? (
                      renderMatrix(
                        operationResult as number[][],
                        'text-slate-900',
                      )
                    ) : (
                      <p className="font-mono text-lg font-bold text-slate-900">
                        {String(operationResult)}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

export default Matrices