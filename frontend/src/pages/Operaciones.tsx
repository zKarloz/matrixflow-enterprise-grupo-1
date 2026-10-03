import { useEffect, useMemo, useState } from 'react'

import {
  Calculator,
  CheckCircle2,
  Table2,
  VectorSquare,
} from 'lucide-react'

import {
  createOperation,
  getMatrices,
  getVectors,
  type Matrix,
  type Vector,
} from '../services/api'

// ============================================================
// CONFIGURACIÓN
// ============================================================

// Empresa utilizada actualmente por los módulos matemáticos.
// Más adelante podremos obtener este valor dinámicamente
// desde la sesión del usuario.
const DEFAULT_COMPANY_ID = 2

// ============================================================
// TIPOS DE DATOS
// ============================================================

// El usuario puede trabajar con vectores o con matrices.
type DataType = 'vector' | 'matrix'

// Todas las operaciones soportadas actualmente por FastAPI.
type OperationType =
  | 'sum_vector'
  | 'subtract_vector'
  | 'dot_product'
  | 'scalar_multiply'
  | 'add_matrix'
  | 'subtract_matrix'
  | 'multiply_matrix'
  | 'transpose_matrix'
  | 'scalar_multiply_matrix'

// ============================================================
// OPERACIONES DISPONIBLES
// ============================================================

// Operaciones para vectores.
// La combinación lineal se trabajará en su módulo específico.
const VECTOR_OPERATIONS = [
  {
    value: 'sum_vector',
    label: 'Suma de vectores',
  },
  {
    value: 'subtract_vector',
    label: 'Resta de vectores',
  },
  {
    value: 'dot_product',
    label: 'Producto punto',
  },
  {
    value: 'scalar_multiply',
    label: 'Multiplicación por escalar',
  },
] as const

// Operaciones disponibles para matrices.
const MATRIX_OPERATIONS = [
  {
    value: 'add_matrix',
    label: 'Suma de matrices',
  },
  {
    value: 'subtract_matrix',
    label: 'Resta de matrices',
  },
  {
    value: 'multiply_matrix',
    label: 'Multiplicación matricial',
  },
  {
    value: 'transpose_matrix',
    label: 'Matriz transpuesta',
  },
  {
    value: 'scalar_multiply_matrix',
    label: 'Multiplicación por escalar',
  },
] as const

// ============================================================
// COMPONENTE
// ============================================================

function Operaciones() {
  // ==========================================================
  // DATOS REGISTRADOS
  // ==========================================================

  const [vectors, setVectors] = useState<Vector[]>([])
  const [matrices, setMatrices] = useState<Matrix[]>([])

  // ==========================================================
  // SELECCIÓN DEL USUARIO
  // ==========================================================

  // Determina si trabajamos con vectores o matrices.
  const [dataType, setDataType] =
    useState<DataType>('vector')

  // Operación matemática seleccionada.
  const [operationType, setOperationType] =
    useState<OperationType>('sum_vector')

  // IDs de las estructuras matemáticas seleccionadas.
  const [firstId, setFirstId] = useState('')
  const [secondId, setSecondId] = useState('')

  // Valor utilizado por las operaciones escalares.
  const [scalar, setScalar] = useState('2')

  // ==========================================================
  // RESULTADO E INTERFAZ
  // ==========================================================

  const [result, setResult] = useState<unknown>(null)

  const [loading, setLoading] = useState(true)
  const [executing, setExecuting] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // ==========================================================
  // CARGAR VECTORES Y MATRICES
  // ==========================================================

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError('')

        // Recuperamos las estructuras matemáticas persistidas
        // previamente desde PostgreSQL.
        const [vectorData, matrixData] =
          await Promise.all([
            getVectors(),
            getMatrices(),
          ])

        setVectors(vectorData)
        setMatrices(matrixData)
      } catch (requestError) {
        console.error(
          'Error al cargar datos matemáticos:',
          requestError,
        )

        setError(
          requestError instanceof Error
            ? requestError.message
            : 'No se pudieron cargar los datos matemáticos.',
        )
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // ==========================================================
  // ELEMENTOS SELECCIONADOS
  // ==========================================================

  const firstVector = useMemo(
    () =>
      vectors.find(
        (vector) =>
          vector.id === Number(firstId),
      ),
    [vectors, firstId],
  )

  const secondVector = useMemo(
    () =>
      vectors.find(
        (vector) =>
          vector.id === Number(secondId),
      ),
    [vectors, secondId],
  )

  const firstMatrix = useMemo(
    () =>
      matrices.find(
        (matrix) =>
          matrix.id === Number(firstId),
      ),
    [matrices, firstId],
  )

  const secondMatrix = useMemo(
    () =>
      matrices.find(
        (matrix) =>
          matrix.id === Number(secondId),
      ),
    [matrices, secondId],
  )

  // ==========================================================
  // CAMBIAR TIPO DE DATO
  // ==========================================================

  function handleDataTypeChange(
    newType: DataType,
  ) {
    setDataType(newType)

    // Limpiamos las selecciones anteriores porque un ID
    // de vector no debe reutilizarse como ID de matriz.
    setFirstId('')
    setSecondId('')
    setResult(null)
    setError('')
    setSuccess('')

    // Elegimos automáticamente una operación válida
    // para el nuevo tipo de estructura.
    if (newType === 'vector') {
      setOperationType('sum_vector')
    } else {
      setOperationType('add_matrix')
    }
  }

  // ==========================================================
  // DETERMINAR PARÁMETROS NECESARIOS
  // ==========================================================

  const requiresSecondOperand =
    operationType === 'sum_vector' ||
    operationType === 'subtract_vector' ||
    operationType === 'dot_product' ||
    operationType === 'add_matrix' ||
    operationType === 'subtract_matrix' ||
    operationType === 'multiply_matrix'

  const requiresScalar =
    operationType === 'scalar_multiply' ||
    operationType === 'scalar_multiply_matrix'

  // ==========================================================
  // VALIDACIONES
  // ==========================================================

  function validateVectorOperation() {
    if (!firstVector) {
      throw new Error(
        'Selecciona el primer vector.',
      )
    }

    if (
      requiresSecondOperand &&
      !secondVector
    ) {
      throw new Error(
        'Selecciona el segundo vector.',
      )
    }

    // Suma, resta y producto punto requieren vectores
    // con la misma dimensión.
    if (
      requiresSecondOperand &&
      secondVector &&
      firstVector.dimension !==
      secondVector.dimension
    ) {
      throw new Error(
        `Los vectores deben tener la misma dimensión. ` +
        `El primero tiene dimensión ${firstVector.dimension} ` +
        `y el segundo ${secondVector.dimension}.`,
      )
    }
  }

  function validateMatrixOperation() {
    if (!firstMatrix) {
      throw new Error(
        'Selecciona la primera matriz.',
      )
    }

    if (
      requiresSecondOperand &&
      !secondMatrix
    ) {
      throw new Error(
        'Selecciona la segunda matriz.',
      )
    }

    // Suma y resta requieren las mismas dimensiones.
    if (
      (
        operationType === 'add_matrix' ||
        operationType === 'subtract_matrix'
      ) &&
      secondMatrix &&
      (
        firstMatrix.rows !== secondMatrix.rows ||
        firstMatrix.columns !== secondMatrix.columns
      )
    ) {
      throw new Error(
        'Para sumar o restar, ambas matrices deben tener las mismas dimensiones.',
      )
    }

    // Para A × B, las columnas de A deben ser iguales
    // al número de filas de B.
    if (
      operationType === 'multiply_matrix' &&
      secondMatrix &&
      firstMatrix.columns !== secondMatrix.rows
    ) {
      throw new Error(
        `No se pueden multiplicar estas matrices. ` +
        `Las ${firstMatrix.columns} columnas de A deben ` +
        `coincidir con las ${secondMatrix.rows} filas de B.`,
      )
    }
  }

  // ==========================================================
  // EJECUTAR OPERACIÓN
  // ==========================================================

  async function handleExecuteOperation() {
    try {
      setExecuting(true)
      setError('')
      setSuccess('')
      setResult(null)

      // Validamos el escalar cuando la operación lo necesita.
      if (requiresScalar) {
        const numericScalar = Number(scalar)

        if (!Number.isFinite(numericScalar)) {
          throw new Error(
            'Ingresa un escalar válido.',
          )
        }
      }

      // ------------------------------------------------------
      // OPERACIONES CON VECTORES
      // ------------------------------------------------------

      if (dataType === 'vector') {
        validateVectorOperation()

        // Después de la validación sabemos que existe.
        if (!firstVector) {
          return
        }

        const selectedOperation =
          VECTOR_OPERATIONS.find(
            (item) =>
              item.value === operationType,
          )

        const operationName =
          secondVector && requiresSecondOperand
            ? `${selectedOperation?.label}: ${firstVector.name} y ${secondVector.name}`
            : `${selectedOperation?.label}: ${firstVector.name}`

        const response = await createOperation({
          company_id: DEFAULT_COMPANY_ID,
          name: operationName,
          operation_type: operationType,

          // El backend recibe los vectores como una
          // matriz de una sola fila.
          first_values: [
            firstVector.values,
          ],

          second_values:
            secondVector && requiresSecondOperand
              ? [secondVector.values]
              : null,

          scalar:
            requiresScalar
              ? Number(scalar)
              : null,

          // Guardamos también la relación con los vectores
          // persistidos en PostgreSQL.
          first_vector_id: firstVector.id,

          second_vector_id:
            secondVector && requiresSecondOperand
              ? secondVector.id
              : null,
        })

        setResult(response.result)

        setSuccess(
          'Operación vectorial ejecutada correctamente.',
        )

        return
      }

      // ------------------------------------------------------
      // OPERACIONES CON MATRICES
      // ------------------------------------------------------

      validateMatrixOperation()

      if (!firstMatrix) {
        return
      }

      const selectedOperation =
        MATRIX_OPERATIONS.find(
          (item) =>
            item.value === operationType,
        )

      const operationName =
        secondMatrix && requiresSecondOperand
          ? `${selectedOperation?.label}: ${firstMatrix.name} y ${secondMatrix.name}`
          : `${selectedOperation?.label}: ${firstMatrix.name}`

      const response = await createOperation({
        company_id: DEFAULT_COMPANY_ID,
        name: operationName,
        operation_type: operationType,

        // Las matrices ya están almacenadas como number[][].
        first_values: firstMatrix.values,

        second_values:
          secondMatrix && requiresSecondOperand
            ? secondMatrix.values
            : null,

        scalar:
          requiresScalar
            ? Number(scalar)
            : null,

        // Relacionamos la operación con las matrices
        // seleccionadas.
        first_matrix_id: firstMatrix.id,

        second_matrix_id:
          secondMatrix && requiresSecondOperand
            ? secondMatrix.id
            : null,
      })

      setResult(response.result)

      setSuccess(
        'Operación matricial ejecutada correctamente.',
      )
    } catch (requestError) {
      console.error(
        'Error al ejecutar operación:',
        requestError,
      )

      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No se pudo ejecutar la operación.',
      )
    } finally {
      setExecuting(false)
    }
  }

  // ==========================================================
  // MOSTRAR RESULTADO
  // ==========================================================

  function renderResult() {
    if (result === null) {
      return null
    }

    // Matriz: [[1, 2], [3, 4]]
    if (
      Array.isArray(result) &&
      Array.isArray(result[0])
    ) {
      return (
        <div className="space-y-2">
          {(result as number[][]).map(
            (row, index) => (
              <p
                key={index}
                className="whitespace-nowrap font-mono text-lg font-bold text-slate-900"
              >
                [{row.join(', ')}]
              </p>
            ),
          )}
        </div>
      )
    }

    // Vector: [1, 2, 3]
    if (Array.isArray(result)) {
      return (
        <p className="font-mono text-xl font-bold text-slate-900">
          [{result.join(', ')}]
        </p>
      )
    }

    // Resultado escalar.
    return (
      <p className="font-mono text-3xl font-bold text-slate-900">
        {String(result)}
      </p>
    )
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-full bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">

        {/* ===================================================
            MENSAJES
            =================================================== */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-semibold">
              No se pudo completar la operación
            </p>

            <p className="mt-1">
              {error}
            </p>
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            <CheckCircle2 className="h-5 w-5 shrink-0" />

            <span className="font-medium">
              {success}
            </span>
          </div>
        )}

        {/* ===================================================
            CENTRO DE OPERACIONES
            =================================================== */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Encabezado de la tarjeta. */}
          <div className="border-b border-slate-100 px-6 py-5">
            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50">
                <Calculator className="h-5 w-5 text-cyan-600" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Ejecutar operación matemática
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Utiliza vectores y matrices registrados con
                  información empresarial.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">

            {/* ===============================================
                TIPO DE ESTRUCTURA
                =============================================== */}

            <div>
              <label className="mb-3 block text-sm font-semibold text-slate-700">
                Tipo de estructura
              </label>

              <div className="grid gap-3 sm:grid-cols-2">

                <button
                  type="button"
                  onClick={() =>
                    handleDataTypeChange('vector')
                  }
                  className={
                    dataType === 'vector'
                      ? 'flex items-center gap-3 rounded-xl border border-cyan-300 bg-cyan-50 p-4 text-left'
                      : 'flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:bg-slate-50'
                  }
                >
                  <VectorSquare
                    className={
                      dataType === 'vector'
                        ? 'h-5 w-5 text-cyan-600'
                        : 'h-5 w-5 text-slate-500'
                    }
                  />

                  <div>
                    <p className="font-semibold text-slate-900">
                      Vectores
                    </p>

                    <p className="text-xs text-slate-500">
                      {vectors.length} disponibles
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleDataTypeChange('matrix')
                  }
                  className={
                    dataType === 'matrix'
                      ? 'flex items-center gap-3 rounded-xl border border-cyan-300 bg-cyan-50 p-4 text-left'
                      : 'flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:bg-slate-50'
                  }
                >
                  <Table2
                    className={
                      dataType === 'matrix'
                        ? 'h-5 w-5 text-cyan-600'
                        : 'h-5 w-5 text-slate-500'
                    }
                  />

                  <div>
                    <p className="font-semibold text-slate-900">
                      Matrices
                    </p>

                    <p className="text-xs text-slate-500">
                      {matrices.length} disponibles
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* ===============================================
                OPERACIÓN
                =============================================== */}

            <div className="mt-6">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Operación
              </label>

              <select
                value={operationType}
                disabled={loading}
                onChange={(event) => {
                  setOperationType(
                    event.target.value as OperationType,
                  )

                  // Limpiamos resultados anteriores para no
                  // confundirlos con la nueva operación.
                  setResult(null)
                  setError('')
                  setSuccess('')
                }}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
              >
                {dataType === 'vector'
                  ? VECTOR_OPERATIONS.map(
                    (operation) => (
                      <option
                        key={operation.value}
                        value={operation.value}
                      >
                        {operation.label}
                      </option>
                    ),
                  )
                  : MATRIX_OPERATIONS.map(
                    (operation) => (
                      <option
                        key={operation.value}
                        value={operation.value}
                      >
                        {operation.label}
                      </option>
                    ),
                  )}
              </select>
            </div>

            {/* ===============================================
                ENTRADAS
                =============================================== */}

            <div className="mt-6 grid gap-5 md:grid-cols-2">

              {/* Primer operando. */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  {dataType === 'vector'
                    ? 'Primer vector'
                    : 'Matriz A'}
                </label>

                <select
                  value={firstId}
                  disabled={loading}
                  onChange={(event) =>
                    setFirstId(event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
                >
                  <option value="">
                    Seleccionar
                  </option>

                  {dataType === 'vector'
                    ? vectors.map((vector) => (
                      <option
                        key={vector.id}
                        value={vector.id}
                      >
                        {vector.name} — dimensión{' '}
                        {vector.dimension}
                      </option>
                    ))
                    : matrices.map((matrix) => (
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

              {/* Segundo operando. */}
              {requiresSecondOperand && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    {dataType === 'vector'
                      ? 'Segundo vector'
                      : 'Matriz B'}
                  </label>

                  <select
                    value={secondId}
                    disabled={loading}
                    onChange={(event) =>
                      setSecondId(event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
                  >
                    <option value="">
                      Seleccionar
                    </option>

                    {dataType === 'vector'
                      ? vectors.map((vector) => (
                        <option
                          key={vector.id}
                          value={vector.id}
                        >
                          {vector.name} — dimensión{' '}
                          {vector.dimension}
                        </option>
                      ))
                      : matrices.map((matrix) => (
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
              )}
            </div>

            {/* Escalar. */}
            {requiresScalar && (
              <div className="mt-5 max-w-sm">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Escalar
                </label>

                <input
                  type="number"
                  value={scalar}
                  onChange={(event) =>
                    setScalar(event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
                />
              </div>
            )}

            {/* Botón principal. */}
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handleExecuteOperation}
                disabled={executing || loading}
                className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {executing
                  ? 'Calculando...'
                  : 'Ejecutar operación'}
              </button>
            </div>
          </div>
        </section>

        {/* ===================================================
            RESULTADO
            =================================================== */}

        {result !== null && (
          <section className="mt-8 overflow-hidden rounded-2xl border border-cyan-200 bg-white shadow-sm">

            <div className="border-b border-cyan-100 px-6 py-5">
              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50">
                  <CheckCircle2 className="h-5 w-5 text-cyan-600" />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Resultado
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Resultado calculado por el motor matemático
                    del backend.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="overflow-x-auto rounded-xl bg-slate-50 p-6">
                {renderResult()}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

export default Operaciones