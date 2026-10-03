import { useEffect, useMemo, useState } from 'react'

import {
    CheckCircle2,
    Sigma,
    VectorSquare,
} from 'lucide-react'

import {
    createOperation,
    getVectors,
    type Operation,
    type Vector,
} from '../services/api'

// ============================================================
// CONFIGURACIÓN
// ============================================================

// Empresa utilizada actualmente por los módulos matemáticos.
const DEFAULT_COMPANY_ID = 2

// ============================================================
// COMPONENTE
// ============================================================

function CombinacionesLineales() {
    // ==========================================================
    // VECTORES REGISTRADOS
    // ==========================================================

    // Vectores recuperados desde PostgreSQL.
    const [vectors, setVectors] = useState<Vector[]>([])

    // Identificadores de los vectores seleccionados.
    const [firstVectorId, setFirstVectorId] = useState('')
    const [secondVectorId, setSecondVectorId] = useState('')

    // ==========================================================
    // COEFICIENTES
    // ==========================================================

    // Coeficiente aplicado al primer vector.
    const [coefficientA, setCoefficientA] = useState('1')

    // Coeficiente aplicado al segundo vector.
    const [coefficientB, setCoefficientB] = useState('1')

    // ==========================================================
    // RESULTADO
    // ==========================================================

    // Vector resultante de aU + bV.
    const [result, setResult] =
        useState<number[] | null>(null)

    // Operación registrada en PostgreSQL.
    const [operation, setOperation] =
        useState<Operation | null>(null)

    // ==========================================================
    // INTERFAZ
    // ==========================================================

    const [loadingVectors, setLoadingVectors] =
        useState(true)

    const [calculating, setCalculating] =
        useState(false)

    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    // ==========================================================
    // CARGAR VECTORES
    // ==========================================================

    useEffect(() => {
        async function loadVectors() {
            try {
                setLoadingVectors(true)
                setError('')

                // Consultamos los vectores ya registrados.
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
                setLoadingVectors(false)
            }
        }

        loadVectors()
    }, [])

    // ==========================================================
    // VECTORES SELECCIONADOS
    // ==========================================================

    const firstVector = useMemo(
        () =>
            vectors.find(
                (vector) =>
                    vector.id === Number(firstVectorId),
            ),
        [vectors, firstVectorId],
    )

    const secondVector = useMemo(
        () =>
            vectors.find(
                (vector) =>
                    vector.id === Number(secondVectorId),
            ),
        [vectors, secondVectorId],
    )

    // ==========================================================
    // CALCULAR COMBINACIÓN LINEAL
    // ==========================================================

    async function handleCalculate() {
        try {
            setCalculating(true)
            setError('')
            setSuccess('')
            setResult(null)
            setOperation(null)

            // ------------------------------------------------------
            // VALIDAR VECTORES
            // ------------------------------------------------------

            if (!firstVector) {
                throw new Error(
                    'Selecciona el primer vector.',
                )
            }

            if (!secondVector) {
                throw new Error(
                    'Selecciona el segundo vector.',
                )
            }

            // Una combinación lineal requiere vectores
            // pertenecientes al mismo espacio vectorial.
            if (
                firstVector.dimension !==
                secondVector.dimension
            ) {
                throw new Error(
                    `Los vectores deben tener la misma dimensión. ` +
                    `El vector U tiene dimensión ${firstVector.dimension} ` +
                    `y el vector V tiene dimensión ${secondVector.dimension}.`,
                )
            }

            // ------------------------------------------------------
            // VALIDAR COEFICIENTES
            // ------------------------------------------------------

            const parsedA = Number(coefficientA)
            const parsedB = Number(coefficientB)

            if (
                !Number.isFinite(parsedA) ||
                !Number.isFinite(parsedB)
            ) {
                throw new Error(
                    'Los coeficientes deben ser números válidos.',
                )
            }

            // ------------------------------------------------------
            // EJECUTAR OPERACIÓN
            // ------------------------------------------------------

            const response = await createOperation({
                company_id: DEFAULT_COMPANY_ID,

                // Guardamos un nombre descriptivo para que
                // posteriormente el Historial sea comprensible.
                name:
                    `Combinación lineal: ` +
                    `${parsedA}(${firstVector.name}) + ` +
                    `${parsedB}(${secondVector.name})`,

                operation_type: 'linear_combination',

                // El backend espera cada vector dentro
                // de una matriz de una sola fila.
                first_values: [
                    firstVector.values,
                ],

                second_values: [
                    secondVector.values,
                ],

                // Coeficientes de aU + bV.
                scalar: parsedA,
                second_scalar: parsedB,

                // Conservamos las relaciones con los vectores
                // originales almacenados en PostgreSQL.
                first_vector_id: firstVector.id,
                second_vector_id: secondVector.id,
            })

            // Validamos que FastAPI haya devuelto un vector.
            if (!Array.isArray(response.result)) {
                throw new Error(
                    'El backend no devolvió un vector como resultado.',
                )
            }

            setOperation(response)
            setResult(response.result as number[])

            setSuccess(
                'Combinación lineal calculada correctamente.',
            )
        } catch (requestError) {
            console.error(
                'Error al calcular combinación lineal:',
                requestError,
            )

            setError(
                requestError instanceof Error
                    ? requestError.message
                    : 'No se pudo calcular la combinación lineal.',
            )
        } finally {
            setCalculating(false)
        }
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
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
                        <p className="text-sm font-semibold text-red-800">
                            No fue posible completar el cálculo
                        </p>

                        <p className="mt-1 text-sm text-red-700">
                            {error}
                        </p>
                    </div>
                )}

                {success && (
                    <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />

                        <p className="text-sm font-medium text-emerald-700">
                            {success}
                        </p>
                    </div>
                )}

                {/* ===================================================
            CONFIGURAR COMBINACIÓN LINEAL
            =================================================== */}

                <section className="overflow-hidden rounded-2xl border border-cyan-200 bg-white shadow-sm">

                    {/* Encabezado de la tarjeta. */}
                    <div className="border-b border-cyan-100 px-6 py-5">
                        <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50">
                                <Sigma className="h-5 w-5 text-cyan-600" />
                            </div>

                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    Construir combinación lineal
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Combina dos vectores registrados mediante
                                    coeficientes definidos por el usuario.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">

                        {/* ===============================================
                VECTORES
                =============================================== */}

                        <div className="grid gap-5 md:grid-cols-2">

                            {/* Primer vector. */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Vector U
                                </label>

                                <select
                                    value={firstVectorId}
                                    disabled={loadingVectors}
                                    onChange={(event) => {
                                        setFirstVectorId(
                                            event.target.value,
                                        )

                                        // Eliminamos cualquier resultado anterior.
                                        setResult(null)
                                        setSuccess('')
                                    }}
                                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                                >
                                    <option value="">
                                        Seleccionar vector U
                                    </option>

                                    {vectors.map((vector) => (
                                        <option
                                            key={vector.id}
                                            value={vector.id}
                                        >
                                            {vector.name} — dimensión{' '}
                                            {vector.dimension}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Segundo vector. */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Vector V
                                </label>

                                <select
                                    value={secondVectorId}
                                    disabled={loadingVectors}
                                    onChange={(event) => {
                                        setSecondVectorId(
                                            event.target.value,
                                        )

                                        setResult(null)
                                        setSuccess('')
                                    }}
                                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                                >
                                    <option value="">
                                        Seleccionar vector V
                                    </option>

                                    {vectors.map((vector) => (
                                        <option
                                            key={vector.id}
                                            value={vector.id}
                                        >
                                            {vector.name} — dimensión{' '}
                                            {vector.dimension}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* ===============================================
                VISTA PREVIA DE LOS VECTORES
                =============================================== */}

                        {(firstVector || secondVector) && (
                            <div className="mt-6 grid gap-4 md:grid-cols-2">

                                {/* Vector U. */}
                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <div className="flex items-center gap-2">
                                        <VectorSquare className="h-4 w-4 text-slate-500" />

                                        <p className="text-sm font-semibold text-slate-700">
                                            U
                                        </p>
                                    </div>

                                    {firstVector ? (
                                        <>
                                            <p className="mt-2 text-sm font-medium text-slate-900">
                                                {firstVector.name}
                                            </p>

                                            <code className="mt-3 block overflow-x-auto rounded-lg bg-slate-900 px-4 py-3 text-sm text-white">
                                                [{firstVector.values.join(', ')}]
                                            </code>
                                        </>
                                    ) : (
                                        <p className="mt-2 text-sm text-slate-400">
                                            No seleccionado
                                        </p>
                                    )}
                                </div>

                                {/* Vector V. */}
                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <div className="flex items-center gap-2">
                                        <VectorSquare className="h-4 w-4 text-slate-500" />

                                        <p className="text-sm font-semibold text-slate-700">
                                            V
                                        </p>
                                    </div>

                                    {secondVector ? (
                                        <>
                                            <p className="mt-2 text-sm font-medium text-slate-900">
                                                {secondVector.name}
                                            </p>

                                            <code className="mt-3 block overflow-x-auto rounded-lg bg-slate-900 px-4 py-3 text-sm text-white">
                                                [{secondVector.values.join(', ')}]
                                            </code>
                                        </>
                                    ) : (
                                        <p className="mt-2 text-sm text-slate-400">
                                            No seleccionado
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ===============================================
                COEFICIENTES
                =============================================== */}

                        <div className="mt-6 grid gap-5 md:grid-cols-2">

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Coeficiente a
                                </label>

                                <input
                                    type="number"
                                    value={coefficientA}
                                    onChange={(event) =>
                                        setCoefficientA(
                                            event.target.value,
                                        )
                                    }
                                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Coeficiente b
                                </label>

                                <input
                                    type="number"
                                    value={coefficientB}
                                    onChange={(event) =>
                                        setCoefficientB(
                                            event.target.value,
                                        )
                                    }
                                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                                />
                            </div>
                        </div>

                        {/* ===============================================
                EXPRESIÓN MATEMÁTICA
                =============================================== */}

                        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5 text-center">

                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Expresión
                            </p>

                            <p className="mt-2 text-2xl font-bold text-slate-900">
                                {coefficientA || 'a'}U +{' '}
                                {coefficientB || 'b'}V
                            </p>

                            {firstVector && secondVector && (
                                <p className="mt-2 text-sm text-slate-500">
                                    {coefficientA || 'a'}(
                                    {firstVector.name}) +{' '}
                                    {coefficientB || 'b'}(
                                    {secondVector.name})
                                </p>
                            )}
                        </div>

                        {/* Ejecutar cálculo. */}
                        <div className="mt-6 flex justify-end">
                            <button
                                type="button"
                                onClick={handleCalculate}
                                disabled={
                                    calculating ||
                                    loadingVectors
                                }
                                className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                            >
                                {calculating
                                    ? 'Calculando...'
                                    : 'Calcular combinación lineal'}
                            </button>
                        </div>
                    </div>
                </section>

                {/* ===================================================
            RESULTADO
            =================================================== */}

                {result && (
                    <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                        <div className="border-b border-slate-100 px-6 py-5">
                            <div className="flex items-center justify-between gap-4">

                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Vector resultante
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Resultado de aplicar los coeficientes
                                        a los vectores seleccionados.
                                    </p>
                                </div>

                                <span className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                                    Calculado
                                </span>
                            </div>
                        </div>

                        <div className="p-6">

                            {/* Representación matemática del resultado. */}
                            <div className="overflow-x-auto rounded-xl bg-slate-900 p-5">
                                <p className="font-mono text-lg font-bold text-white">
                                    [{result.join(', ')}]
                                </p>
                            </div>

                            {/* Componentes individuales. */}
                            <div className="mt-5 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">

                                {result.map((value, index) => (
                                    <div
                                        key={index}
                                        className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                                    >
                                        <p className="text-xs font-medium text-slate-400">
                                            Componente {index + 1}
                                        </p>

                                        <p className="mt-1 font-mono text-lg font-bold text-slate-900">
                                            {value}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* La operación queda registrada para Historial. */}
                            {operation && (
                                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                                    <p className="text-sm text-slate-500">
                                        Operación registrada en el sistema
                                    </p>

                                    <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                                        #{operation.id}
                                    </span>
                                </div>
                            )}
                        </div>
                    </section>
                )}
            </div>
        </div>
    )
}

export default CombinacionesLineales