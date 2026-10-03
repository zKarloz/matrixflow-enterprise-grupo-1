import { useEffect, useMemo, useState } from 'react'

import {
    CheckCircle2,
    ChevronDown,
    Info,
    Sigma,
    VectorSquare,
} from 'lucide-react'

import {
    createOperation,
    getDashboard,
    getProducts,
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

    // Controla qué bloque de interpretación está desplegado.
    const [
        expandedDetail,
        setExpandedDetail,
    ] = useState<'u' | 'v' | 'result' | null>(null)

    // Referencias de productos utilizadas para interpretar
    // los componentes de vectores empresariales.
    const [
        productReferenceLabels,
        setProductReferenceLabels,
    ] = useState<string[]>([])

    const [
        salesReferenceLabels,
        setSalesReferenceLabels,
    ] = useState<string[]>([])

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

                // Las referencias empresariales son opcionales.
                const [
                    productsResult,
                    dashboardResult,
                ] = await Promise.allSettled([
                    getProducts(),
                    getDashboard(),
                ])

                if (
                    productsResult.status ===
                    'fulfilled'
                ) {
                    const orderedProducts =
                        productsResult.value
                            .filter(
                                (product) =>
                                    product.is_active,
                            )
                            .sort(
                                (first, second) =>
                                    first.id - second.id,
                            )

                    setProductReferenceLabels(
                        orderedProducts.map(
                            (product) => product.name,
                        ),
                    )
                }

                if (
                    dashboardResult.status ===
                    'fulfilled'
                ) {
                    const orderedSales =
                        [
                            ...dashboardResult.value
                                .sales_by_product,
                        ].sort(
                            (first, second) =>
                                first.product_id -
                                second.product_id,
                        )

                    setSalesReferenceLabels(
                        orderedSales.map(
                            (item) =>
                                item.product_name,
                        ),
                    )
                }
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
    // INTERPRETAR COMPONENTES
    // ==========================================================

    function getVectorLabels(
        vector: Vector,
    ): string[] | null {
        const normalizedName =
            vector.name.trim().toLowerCase()

        if (
            normalizedName ===
            'stock total por producto' ||
            normalizedName ===
            'precio actual por producto'
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
            normalizedName ===
            'unidades vendidas por producto' ||
            normalizedName ===
            'importe vendido por producto'
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

    function renderVectorDetail(
        vector: Vector,
    ) {
        const labels = getVectorLabels(vector)

        return (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                {labels ? (
                    <div className="overflow-x-auto pb-2">
                        <table className="min-w-max text-left">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/70">
                                    {labels.map(
                                        (label, index) => (
                                            <th
                                                key={`${vector.id}-${index}-${label}`}
                                                className="min-w-[180px] max-w-[240px] px-4 py-3 text-xs font-semibold leading-5 text-slate-600 dark:text-slate-300"
                                            >
                                                {label}
                                            </th>
                                        ),
                                    )}
                                </tr>
                            </thead>

                            <tbody>
                                <tr>
                                    {vector.values.map(
                                        (value, index) => (
                                            <td
                                                key={`${vector.id}-${index}`}
                                                className="px-4 py-4"
                                            >
                                                <span className="inline-flex min-w-10 items-center justify-center rounded-lg bg-slate-900 px-3 py-1.5 font-mono text-sm font-bold text-white dark:bg-slate-950">
                                                    {value}
                                                </span>
                                            </td>
                                        ),
                                    )}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex items-start gap-3 p-5">
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
                            <Info size={17} />
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {vector.values.map(
                                (value, index) => (
                                    <span
                                        key={`${vector.id}-position-${index}`}
                                        className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                    >
                                        Componente {index + 1}:{' '}
                                        <strong className="font-mono text-slate-900 dark:text-white">
                                            {value}
                                        </strong>
                                    </span>
                                ),
                            )}
                        </div>
                    </div>
                )}
            </div>
        )
    }

    // Las etiquetas del resultado solo son seguras cuando
    // ambos vectores representan exactamente las mismas posiciones.
    function getResultLabels(): string[] | null {
        if (!firstVector || !secondVector) {
            return null
        }

        const firstLabels =
            getVectorLabels(firstVector)

        const secondLabels =
            getVectorLabels(secondVector)

        if (
            !firstLabels ||
            !secondLabels ||
            firstLabels.length !== secondLabels.length
        ) {
            return null
        }

        const sameMeaning =
            firstLabels.every(
                (label, index) =>
                    label === secondLabels[index],
            )

        return sameMeaning
            ? firstLabels
            : null
    }

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

                                {/* Vector U desplegable. */}
                                <div>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setExpandedDetail(
                                                expandedDetail === 'u'
                                                    ? null
                                                    : 'u',
                                            )
                                        }
                                        className={`
                                            flex
                                            w-full
                                            items-center
                                            justify-between
                                            rounded-xl
                                            border
                                            p-4
                                            text-left
                                            transition-colors

                                            ${expandedDetail === 'u'
                                                ? 'border-blue-200 bg-blue-50/70 dark:border-blue-900/60 dark:bg-blue-950/30'
                                                : 'border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800/60'
                                            }
                                        `}
                                    >
                                        <div className="flex items-center gap-3">
                                            <VectorSquare className="h-4 w-4 text-slate-500 dark:text-slate-400" />

                                            <div>
                                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                                    Vector U
                                                </p>

                                                <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">
                                                    {firstVector?.name ??
                                                        'No seleccionado'}
                                                </p>
                                            </div>
                                        </div>

                                        <ChevronDown
                                            size={18}
                                            className={`
                                                text-slate-400
                                                transition-transform
                                                ${expandedDetail === 'u'
                                                    ? 'rotate-180 text-blue-600 dark:text-blue-400'
                                                    : ''
                                                }
                                            `}
                                        />
                                    </button>

                                    {expandedDetail === 'u' &&
                                        firstVector && (
                                            <div className="mt-2">
                                                {renderVectorDetail(
                                                    firstVector,
                                                )}
                                            </div>
                                        )}
                                </div>

                                {/* Vector V desplegable. */}
                                <div>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setExpandedDetail(
                                                expandedDetail === 'v'
                                                    ? null
                                                    : 'v',
                                            )
                                        }
                                        className={`
                                            flex
                                            w-full
                                            items-center
                                            justify-between
                                            rounded-xl
                                            border
                                            p-4
                                            text-left
                                            transition-colors

                                            ${expandedDetail === 'v'
                                                ? 'border-blue-200 bg-blue-50/70 dark:border-blue-900/60 dark:bg-blue-950/30'
                                                : 'border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800/60'
                                            }
                                        `}
                                    >
                                        <div className="flex items-center gap-3">
                                            <VectorSquare className="h-4 w-4 text-slate-500 dark:text-slate-400" />

                                            <div>
                                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                                    Vector V
                                                </p>

                                                <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">
                                                    {secondVector?.name ??
                                                        'No seleccionado'}
                                                </p>
                                            </div>
                                        </div>

                                        <ChevronDown
                                            size={18}
                                            className={`
                                                text-slate-400
                                                transition-transform
                                                ${expandedDetail === 'v'
                                                    ? 'rotate-180 text-blue-600 dark:text-blue-400'
                                                    : ''
                                                }
                                            `}
                                        />
                                    </button>

                                    {expandedDetail === 'v' &&
                                        secondVector && (
                                            <div className="mt-2">
                                                {renderVectorDetail(
                                                    secondVector,
                                                )}
                                            </div>
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

                            {/* Interpretación semántica del resultado. */}
                            <div className="mt-5">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setExpandedDetail(
                                            expandedDetail === 'result'
                                                ? null
                                                : 'result',
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

                                        ${expandedDetail === 'result'
                                            ? 'border-blue-200 bg-blue-50/70 dark:border-blue-900/60 dark:bg-blue-950/30'
                                            : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800/60'
                                        }
                                    `}
                                >
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                            Interpretar vector resultante
                                        </p>

                                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                            Relaciona cada componente con su referencia cuando es posible.
                                        </p>
                                    </div>

                                    <ChevronDown
                                        size={18}
                                        className={`
                                            text-slate-400
                                            transition-transform
                                            ${expandedDetail === 'result'
                                                ? 'rotate-180 text-blue-600 dark:text-blue-400'
                                                : ''
                                            }
                                        `}
                                    />
                                </button>

                                {expandedDetail === 'result' && (
                                    <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                                        {getResultLabels() ? (
                                            <div className="overflow-x-auto pb-2">
                                                <table className="min-w-max text-left">
                                                    <thead>
                                                        <tr className="border-b border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/70">
                                                            {getResultLabels()!.map(
                                                                (label, index) => (
                                                                    <th
                                                                        key={`result-${index}-${label}`}
                                                                        className="min-w-[180px] max-w-[240px] px-4 py-3 text-xs font-semibold leading-5 text-slate-600 dark:text-slate-300"
                                                                    >
                                                                        {label}
                                                                    </th>
                                                                ),
                                                            )}
                                                        </tr>
                                                    </thead>

                                                    <tbody>
                                                        <tr>
                                                            {result.map(
                                                                (value, index) => (
                                                                    <td
                                                                        key={`result-value-${index}`}
                                                                        className="px-4 py-4"
                                                                    >
                                                                        <span className="inline-flex min-w-10 items-center justify-center rounded-lg bg-slate-900 px-3 py-1.5 font-mono text-sm font-bold text-white dark:bg-slate-950">
                                                                            {value}
                                                                        </span>
                                                                    </td>
                                                                ),
                                                            )}
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="flex flex-wrap gap-2 p-5">
                                                {result.map(
                                                    (value, index) => (
                                                        <span
                                                            key={`result-position-${index}`}
                                                            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                                        >
                                                            Componente {index + 1}:{' '}
                                                            <strong className="font-mono text-slate-900 dark:text-white">
                                                                {value}
                                                            </strong>
                                                        </span>
                                                    ),
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Componentes individuales. */}
                            <div className="mt-5 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">

                                {result.map((value, index) => (
                                    <div
                                        key={index}
                                        className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800"
                                    >
                                        <p className="text-xs font-medium text-slate-400">
                                            Componente {index + 1}
                                        </p>

                                        <p className="mt-1 font-mono text-lg font-bold text-slate-900 dark:text-white">
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