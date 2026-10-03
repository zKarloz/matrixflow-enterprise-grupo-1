import { useEffect, useMemo, useState } from 'react'

import {
  Calculator,
  CheckCircle2,
  ChevronDown,
  Info,
  Table2,
  VectorSquare,
} from 'lucide-react'

import {
  createOperation,
  getBranches,
  getDashboard,
  getMatrices,
  getProducts,
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

  // Controla qué operando tiene abierto su detalle.
  const [
    expandedOperand,
    setExpandedOperand,
  ] = useState<'first' | 'second' | null>(null)

  // Referencias empresariales utilizadas para interpretar
  // vectores y matrices ya registradas.
  const [
    productReferenceLabels,
    setProductReferenceLabels,
  ] = useState<string[]>([])

  const [
    salesReferenceLabels,
    setSalesReferenceLabels,
  ] = useState<string[]>([])

  const [
    branchReferenceLabels,
    setBranchReferenceLabels,
  ] = useState<string[]>([])

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

        // Las referencias son complementarias:
        // si alguna consulta falla, las operaciones siguen funcionando.
        const [
          productsResult,
          branchesResult,
          dashboardResult,
        ] = await Promise.allSettled([
          getProducts(),
          getBranches(),
          getDashboard(),
        ])

        if (productsResult.status === 'fulfilled') {
          const orderedProducts =
            productsResult.value
              .filter((product) => product.is_active)
              .sort((first, second) => first.id - second.id)

          setProductReferenceLabels(
            orderedProducts.map((product) => product.name),
          )
        }

        if (branchesResult.status === 'fulfilled') {
          const orderedBranches =
            branchesResult.value
              .filter(
                (branch) =>
                  branch.company_id === DEFAULT_COMPANY_ID &&
                  branch.is_active,
              )
              .sort((first, second) => first.id - second.id)

          setBranchReferenceLabels(
            orderedBranches.map((branch) => branch.name),
          )
        }

        if (dashboardResult.status === 'fulfilled') {
          const orderedSales =
            [...dashboardResult.value.sales_by_product].sort(
              (first, second) =>
                first.product_id - second.product_id,
            )

          setSalesReferenceLabels(
            orderedSales.map((item) => item.product_name),
          )
        }
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
    setExpandedOperand(null)

    // Elegimos automáticamente una operación válida
    // para el nuevo tipo de estructura.
    if (newType === 'vector') {
      setOperationType('sum_vector')
    } else {
      setOperationType('add_matrix')
    }
  }

  // ==========================================================
  // REFERENCIAS SEMÁNTICAS
  // ==========================================================

  function getVectorLabels(
    vector: Vector,
  ): string[] | null {
    const normalizedName =
      vector.name.trim().toLowerCase()

    if (
      normalizedName === 'stock total por producto' ||
      normalizedName === 'precio actual por producto'
    ) {
      if (
        productReferenceLabels.length <
        vector.values.length
      ) {
        return null
      }

      return productReferenceLabels.slice(
        0,
        vector.values.length,
      )
    }

    if (
      normalizedName === 'unidades vendidas por producto' ||
      normalizedName === 'importe vendido por producto'
    ) {
      if (
        salesReferenceLabels.length <
        vector.values.length
      ) {
        return null
      }

      return salesReferenceLabels.slice(
        0,
        vector.values.length,
      )
    }

    return null
  }

  function getMatrixReferences(
    matrix: Matrix,
  ): {
    rowLabels: string[]
    columnLabels: string[]
  } | null {
    const normalizedName =
      matrix.name.trim().toLowerCase()

    const isBusinessMatrix =
      normalizedName === 'stock por sucursal y producto' ||
      normalizedName === 'stock mínimo por sucursal y producto' ||
      normalizedName === 'valor de inventario por sucursal y producto'

    if (
      !isBusinessMatrix ||
      branchReferenceLabels.length < matrix.rows ||
      productReferenceLabels.length < matrix.columns
    ) {
      return null
    }

    return {
      rowLabels: branchReferenceLabels.slice(
        0,
        matrix.rows,
      ),
      columnLabels: productReferenceLabels.slice(
        0,
        matrix.columns,
      ),
    }
  }

  function renderVectorMeaning(
    vector: Vector,
  ) {
    const labels = getVectorLabels(vector)

    return (
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Significado de los componentes
          </p>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Vector {vector.name} · dimensión {vector.dimension}
          </p>
        </div>

        {labels ? (
          <div className="overflow-x-auto pb-2">
            <table className="min-w-max text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/70">
                  {labels.map((label, index) => (
                    <th
                      key={`${vector.id}-${index}-${label}`}
                      className="min-w-[180px] max-w-[240px] px-4 py-3 text-xs font-semibold leading-5 text-slate-600 dark:text-slate-300"
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                <tr>
                  {vector.values.map((value, index) => (
                    <td
                      key={`${vector.id}-${index}`}
                      className="px-4 py-4"
                    >
                      <span className="inline-flex min-w-10 items-center justify-center rounded-lg bg-slate-900 px-3 py-1.5 font-mono text-sm font-bold text-white dark:bg-slate-950">
                        {value}
                      </span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-start gap-3 px-5 py-5">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
              <Info size={17} />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Referencias no disponibles
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {vector.values.map((value, index) => (
                  <span
                    key={`${vector.id}-position-${index}`}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    Componente {index + 1}:{' '}
                    <strong className="font-mono text-slate-900 dark:text-white">
                      {value}
                    </strong>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  function renderMatrixMeaning(
    matrix: Matrix,
  ) {
    const references =
      getMatrixReferences(matrix)

    return (
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Significado de filas y columnas
          </p>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Matriz {matrix.name} · {matrix.rows} × {matrix.columns}
          </p>
        </div>

        {references ? (
          <div className="overflow-x-auto pb-2">
            <table className="min-w-max border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/70">
                  <th className="sticky left-0 z-10 min-w-[190px] border-r border-slate-200 bg-slate-50 px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    Sucursal / Producto
                  </th>

                  {references.columnLabels.map(
                    (label, index) => (
                      <th
                        key={`${matrix.id}-column-${index}`}
                        className="min-w-[180px] max-w-[240px] px-4 py-3 text-right text-xs font-semibold leading-5 text-slate-600 dark:text-slate-300"
                      >
                        {label}
                      </th>
                    ),
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {matrix.values.map((row, rowIndex) => (
                  <tr key={`${matrix.id}-row-${rowIndex}`}>
                    <td className="sticky left-0 z-10 border-r border-slate-200 bg-white px-4 py-4 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                      {references.rowLabels[rowIndex]}
                    </td>

                    {row.map((value, columnIndex) => (
                      <td
                        key={`${matrix.id}-${rowIndex}-${columnIndex}`}
                        className="px-4 py-4 text-right"
                      >
                        <span className="inline-flex min-w-12 items-center justify-center rounded-lg bg-slate-900 px-3 py-1.5 font-mono text-sm font-bold text-white dark:bg-slate-950">
                          {value}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto p-5">
            <table className="min-w-max border-collapse text-xs">
              <tbody>
                {matrix.values.map((row, rowIndex) => (
                  <tr key={`${matrix.id}-fallback-${rowIndex}`}>
                    <td className="border border-slate-200 bg-slate-50 px-3 py-2 font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      Fila {rowIndex + 1}
                    </td>

                    {row.map((value, columnIndex) => (
                      <td
                        key={`${matrix.id}-fallback-${rowIndex}-${columnIndex}`}
                        className="border border-slate-200 bg-white px-3 py-2 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                      >
                        C{columnIndex + 1}:{' '}
                        <strong className="font-mono text-slate-900 dark:text-white">
                          {value}
                        </strong>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )
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
                className="whitespace-nowrap font-mono text-lg font-bold text-slate-900 dark:text-slate-100"
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
        <p className="font-mono text-xl font-bold text-slate-900 dark:text-slate-100">
          [{result.join(', ')}]
        </p>
      )
    }

    // Resultado escalar.
    return (
      <p className="font-mono text-3xl font-bold text-slate-900 dark:text-slate-100">
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

            {/* ===============================================
                DETALLE SEMÁNTICO DE LOS OPERANDOS
                =============================================== */}

            {(
              (dataType === 'vector' && firstVector) ||
              (dataType === 'matrix' && firstMatrix)
            ) && (
                <div className="mt-6 space-y-3">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedOperand(
                        expandedOperand === 'first'
                          ? null
                          : 'first',
                      )
                    }
                    className={`
                    flex
                    w-full
                    items-center
                    justify-between
                    rounded-xl
                    border
                    px-4
                    py-3
                    text-left
                    transition-colors

                    ${expandedOperand === 'first'
                        ? 'border-blue-200 bg-blue-50/70 dark:border-blue-900/60 dark:bg-blue-950/30'
                        : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800/60'
                      }
                  `}
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {dataType === 'vector'
                          ? 'Interpretar primer vector'
                          : 'Interpretar Matriz A'}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        Muestra qué representa cada posición.
                      </p>
                    </div>

                    <ChevronDown
                      size={18}
                      className={`
                      text-slate-400
                      transition-transform
                      ${expandedOperand === 'first'
                          ? 'rotate-180 text-blue-600 dark:text-blue-400'
                          : ''
                        }
                    `}
                    />
                  </button>

                  {expandedOperand === 'first' && (
                    <div>
                      {dataType === 'vector' && firstVector
                        ? renderVectorMeaning(firstVector)
                        : dataType === 'matrix' && firstMatrix
                          ? renderMatrixMeaning(firstMatrix)
                          : null}
                    </div>
                  )}

                  {requiresSecondOperand && (
                    (
                      dataType === 'vector' && secondVector
                    ) ||
                    (
                      dataType === 'matrix' && secondMatrix
                    )
                  ) && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedOperand(
                              expandedOperand === 'second'
                                ? null
                                : 'second',
                            )
                          }
                          className={`
                        flex
                        w-full
                        items-center
                        justify-between
                        rounded-xl
                        border
                        px-4
                        py-3
                        text-left
                        transition-colors

                        ${expandedOperand === 'second'
                              ? 'border-blue-200 bg-blue-50/70 dark:border-blue-900/60 dark:bg-blue-950/30'
                              : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800/60'
                            }
                      `}
                        >
                          <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                              {dataType === 'vector'
                                ? 'Interpretar segundo vector'
                                : 'Interpretar Matriz B'}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                              Muestra qué representa cada posición.
                            </p>
                          </div>

                          <ChevronDown
                            size={18}
                            className={`
                          text-slate-400
                          transition-transform
                          ${expandedOperand === 'second'
                                ? 'rotate-180 text-blue-600 dark:text-blue-400'
                                : ''
                              }
                        `}
                          />
                        </button>

                        {expandedOperand === 'second' && (
                          <div>
                            {dataType === 'vector' && secondVector
                              ? renderVectorMeaning(secondVector)
                              : dataType === 'matrix' && secondMatrix
                                ? renderMatrixMeaning(secondMatrix)
                                : null}
                          </div>
                        )}
                      </>
                    )}
                </div>
              )}

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
              <div className="overflow-x-auto rounded-xl bg-slate-50 p-6 dark:bg-slate-900">
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