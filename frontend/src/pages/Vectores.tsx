// ============================================================
// MatrixFlow Enterprise
// Módulo de Vectores
// ============================================================
//
// Los datos y cálculos de esta pantalla utilizan el backend.
//
// Persistencia:
//   GET/POST /api/v1/vectors
//
// Operaciones:
//   POST /api/v1/operations
//
// React solamente controla la interfaz.
// Los cálculos matemáticos se realizan en el backend mediante
// el motor NumPy del proyecto.
// ============================================================

import { useEffect, useMemo, useState } from 'react'

import {
  createOperation,
  createVector,
  getVectors,
  type Vector,
} from '../services/api'

// ============================================================
// CONFIGURACIÓN
// ============================================================

// Empresa utilizada actualmente para los registros matemáticos.
//
// El backend exige company_id.
// Si posteriormente el proyecto obtiene la empresa desde
// el contexto de sesión, este valor podrá sustituirse.
const DEFAULT_COMPANY_ID = 2

// Operaciones vectoriales actualmente implementadas
// por app/algorithms/vector_operations.py.
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
]

// ============================================================
// COMPONENTE
// ============================================================

function Vectores() {
  // ----------------------------------------------------------
  // DATOS
  // ----------------------------------------------------------

  // Vectores reales almacenados en PostgreSQL.
  const [vectors, setVectors] = useState<Vector[]>([])

  // ----------------------------------------------------------
  // ESTADOS GENERALES
  // ----------------------------------------------------------

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [calculating, setCalculating] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // ----------------------------------------------------------
  // FORMULARIO DE VECTOR
  // ----------------------------------------------------------

  const [vectorName, setVectorName] = useState('')
  const [vectorDescription, setVectorDescription] =
    useState('')

  // El usuario escribe los componentes separados por coma.
  //
  // Ejemplo:
  // 1, 2, 3
  //
  // Internamente se transforma a:
  // [1, 2, 3]
  const [vectorValues, setVectorValues] = useState('')

  // ----------------------------------------------------------
  // OPERACIONES
  // ----------------------------------------------------------

  // Vector seleccionado como primera entrada.
  const [firstVectorId, setFirstVectorId] =
    useState('')

  // Vector seleccionado como segunda entrada.
  const [secondVectorId, setSecondVectorId] =
    useState('')

  // Operación seleccionada.
  const [operationType, setOperationType] =
    useState('sum_vector')

  // Resultado proveniente del backend.
  const [operationResult, setOperationResult] =
    useState<unknown>(null)

  // ==========================================================
  // CARGAR VECTORES
  // ==========================================================

  useEffect(() => {
    const loadVectors = async () => {
      try {
        setLoading(true)
        setError('')

        // Consulta real al backend.
        const data = await getVectors()

        setVectors(data)
      } catch (requestError) {
        console.error(
          'Error al cargar vectores:',
          requestError,
        )

        setError(
          requestError instanceof Error
            ? requestError.message
            : 'No se pudieron cargar los vectores.',
        )
      } finally {
        setLoading(false)
      }
    }

    loadVectors()
  }, [])

  // ==========================================================
  // VECTORES SELECCIONABLES
  // ==========================================================

  const selectedFirstVector = useMemo(
    () =>
      vectors.find(
        (vector) =>
          vector.id === Number(firstVectorId),
      ),
    [vectors, firstVectorId],
  )

  const selectedSecondVector = useMemo(
    () =>
      vectors.find(
        (vector) =>
          vector.id === Number(secondVectorId),
      ),
    [vectors, secondVectorId],
  )

  // ==========================================================
  // CONVERTIR TEXTO A VECTOR
  // ==========================================================

  const parseVectorValues = (
    text: string,
  ): number[] | null => {
    // Separamos los valores utilizando comas.
    const parts = text
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)

    // Un vector debe contener al menos un elemento.
    if (parts.length === 0) {
      return null
    }

    const numbers = parts.map(Number)

    // Verificamos que todos sean números válidos.
    if (
      numbers.some(
        (value) => !Number.isFinite(value),
      )
    ) {
      return null
    }

    return numbers
  }

  // ==========================================================
  // REGISTRAR VECTOR
  // ==========================================================

  const handleCreateVector = async () => {
    const values = parseVectorValues(vectorValues)

    // Validaciones básicas antes de llamar al backend.
    if (!vectorName.trim()) {
      setError('Ingresa un nombre para el vector.')
      return
    }

    if (!values) {
      setError(
        'Ingresa valores numéricos separados por comas.',
      )
      return
    }

    try {
      setSaving(true)
      setError('')
      setSuccess('')

      // Enviamos el vector real a FastAPI.
      await createVector({
        company_id: DEFAULT_COMPANY_ID,
        name: vectorName.trim(),
        description:
          vectorDescription.trim() || null,
        values,
      })

      // Volvemos a consultar PostgreSQL para mostrar
      // exactamente los datos almacenados.
      const updatedVectors = await getVectors()

      setVectors(updatedVectors)

      // Limpiamos el formulario.
      setVectorName('')
      setVectorDescription('')
      setVectorValues('')

      setSuccess(
        'Vector registrado correctamente.',
      )
    } catch (requestError) {
      console.error(
        'Error al registrar vector:',
        requestError,
      )

      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No se pudo registrar el vector.',
      )
    } finally {
      setSaving(false)
    }
  }

  // ==========================================================
  // EJECUTAR OPERACIÓN
  // ==========================================================

  const handleOperation = async () => {
    // Las operaciones actuales trabajan con dos vectores.
    if (!selectedFirstVector) {
      setError(
        'Selecciona el primer vector.',
      )
      return
    }

    if (!selectedSecondVector) {
      setError(
        'Selecciona el segundo vector.',
      )
      return
    }

    try {
      setCalculating(true)
      setError('')
      setSuccess('')
      setOperationResult(null)

      // ------------------------------------------------------
      // IMPORTANTE:
      //
      // El backend espera:
      //
      // first_values: [[1, 2, 3]]
      //
      // aunque un vector almacenado sea:
      //
      // values: [1, 2, 3]
      //
      // Por eso envolvemos los valores en otra lista.
      // ------------------------------------------------------

      const operation = await createOperation({
        company_id: DEFAULT_COMPANY_ID,

        // Nombre legible para el registro.
        name: VECTOR_OPERATIONS.find(
          (item) =>
            item.value === operationType,
        )?.label ?? 'Operación vectorial',

        // Tipo exacto que entiende operation_service.py.
        operation_type: operationType,

        // Primer vector convertido al formato esperado.
        first_values: [
          selectedFirstVector.values,
        ],

        // Segundo vector.
        second_values: [
          selectedSecondVector.values,
        ],

        // Referencias a los vectores almacenados.
        first_vector_id:
          selectedFirstVector.id,

        second_vector_id:
          selectedSecondVector.id,
      })

      // El resultado viene calculado por FastAPI/NumPy.
      setOperationResult(operation.result)

      setSuccess(
        'Operación ejecutada correctamente por el backend.',
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
      setCalculating(false)
    }
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div>
      {/* ====================================================
          ENCABEZADO
          ==================================================== */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Vectores
        </h1>

        <p className="mt-2 text-slate-500">
          Gestión y operaciones de vectores mediante el motor
          matemático del backend.
        </p>
      </div>

      {/* ====================================================
          MENSAJES
          ==================================================== */}

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* ====================================================
          REGISTRAR VECTOR
          ==================================================== */}

      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900">
            Registrar vector
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Los datos se almacenarán en PostgreSQL mediante
            FastAPI.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Nombre */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Nombre
            </label>

            <input
              type="text"
              value={vectorName}
              onChange={(event) =>
                setVectorName(event.target.value)
              }
              placeholder="Ej. Vector A"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Descripción
            </label>

            <input
              type="text"
              value={vectorDescription}
              onChange={(event) =>
                setVectorDescription(
                  event.target.value,
                )
              }
              placeholder="Descripción opcional"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          {/* Valores */}
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Valores
            </label>

            <input
              type="text"
              value={vectorValues}
              onChange={(event) =>
                setVectorValues(event.target.value)
              }
              placeholder="Ej. 1, 2, 3, 4"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />

            <p className="mt-2 text-xs text-slate-400">
              Introduce los componentes separados por comas.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleCreateVector}
            disabled={saving}
            className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {saving
              ? 'Guardando...'
              : 'Guardar vector'}
          </button>
        </div>
      </div>

      {/* ====================================================
          LISTA DE VECTORES
          ==================================================== */}

      <div className="mb-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-6">
          <h2 className="text-xl font-semibold text-slate-900">
            Vectores registrados
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Datos obtenidos directamente del backend.
          </p>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Cargando vectores...
          </div>
        ) : vectors.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No existen vectores registrados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    ID
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Nombre
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Dimensión
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Valores
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Descripción
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {vectors.map((vector) => (
                  <tr
                    key={vector.id}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 text-sm text-slate-500">
                      #{vector.id}
                    </td>

                    <td className="px-6 py-4 font-medium text-slate-900">
                      {vector.name}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-700">
                      {vector.dimension}
                    </td>

                    <td className="px-6 py-4">
                      <code className="rounded bg-slate-100 px-3 py-1 text-sm text-slate-700">
                        [{vector.values.join(', ')}]
                      </code>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {vector.description ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ====================================================
          OPERACIONES MATEMÁTICAS
          ==================================================== */}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900">
            Operaciones matemáticas
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            El cálculo se ejecuta en FastAPI utilizando NumPy.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {/* Primer vector */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Primer vector
            </label>

            <select
              value={firstVectorId}
              onChange={(event) =>
                setFirstVectorId(event.target.value)
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="">
                Seleccionar vector
              </option>

              {vectors.map((vector) => (
                <option
                  key={vector.id}
                  value={vector.id}
                >
                  {vector.name} — [
                  {vector.values.join(', ')}]
                </option>
              ))}
            </select>
          </div>

          {/* Operación */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Operación
            </label>

            <select
              value={operationType}
              onChange={(event) =>
                setOperationType(event.target.value)
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
            >
              {VECTOR_OPERATIONS.map(
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

          {/* Segundo vector */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Segundo vector
            </label>

            <select
              value={secondVectorId}
              onChange={(event) =>
                setSecondVectorId(
                  event.target.value,
                )
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="">
                Seleccionar vector
              </option>

              {vectors.map((vector) => (
                <option
                  key={vector.id}
                  value={vector.id}
                >
                  {vector.name} — [
                  {vector.values.join(', ')}]
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Botón de cálculo */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleOperation}
            disabled={calculating}
            className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {calculating
              ? 'Calculando...'
              : 'Ejecutar operación'}
          </button>
        </div>

        {/* Resultado */}
        {operationResult !== null && (
          <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-5">
            <p className="text-sm font-medium text-blue-700">
              Resultado calculado por el backend
            </p>

            <div className="mt-3 overflow-x-auto">
              <code className="text-lg font-semibold text-slate-900">
                {Array.isArray(operationResult)
                  ? `[${operationResult.join(', ')}]`
                  : String(operationResult)}
              </code>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Vectores
