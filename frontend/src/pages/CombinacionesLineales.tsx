import { useState } from 'react'

import {
    createOperation,
    type Operation,
} from '../services/api'

// Empresa utilizada actualmente por MatrixFlow.
const DEFAULT_COMPANY_ID = 2

function CombinacionesLineales() {
    // Valores introducidos por el usuario para el primer vector.
    const [vectorU, setVectorU] = useState('1, 2, 3')

    // Valores introducidos por el usuario para el segundo vector.
    const [vectorV, setVectorV] = useState('4, 5, 6')

    // Coeficiente asociado al primer vector.
    const [coefficientA, setCoefficientA] = useState('2')

    // Coeficiente asociado al segundo vector.
    const [coefficientB, setCoefficientB] = useState('3')

    // Resultado de la combinación lineal.
    const [result, setResult] = useState<number[] | null>(null)

    // Información de la operación registrada.
    const [operation, setOperation] = useState<Operation | null>(null)

    // Estado utilizado durante el cálculo.
    const [loading, setLoading] = useState(false)

    // Mensaje de validación o error.
    const [error, setError] = useState('')

    // Convierte una cadena como "1, 2, 3" en un arreglo numérico.
    const parseVector = (value: string): number[] => {
        return value
            .split(',')
            .map((item) => Number(item.trim()))
    }

    // Ejecuta la combinación lineal con los datos introducidos.
    const handleCalculate = async () => {
        // Limpiamos resultados y mensajes anteriores.
        setError('')
        setResult(null)
        setOperation(null)

        try {
            // Convertimos los vectores de texto a arreglos numéricos.
            const parsedU = parseVector(vectorU)
            const parsedV = parseVector(vectorV)

            // Convertimos los coeficientes a números.
            const parsedA = Number(coefficientA)
            const parsedB = Number(coefficientB)

            // Validamos que ambos vectores tengan componentes.
            if (parsedU.length === 0 || parsedV.length === 0) {
                throw new Error('Debes ingresar ambos vectores.')
            }

            // Validamos que todos los componentes sean números válidos.
            if (
                parsedU.some((value) => !Number.isFinite(value)) ||
                parsedV.some((value) => !Number.isFinite(value))
            ) {
                throw new Error(
                    'Los vectores solamente pueden contener números.',
                )
            }

            // Una combinación lineal requiere vectores de igual dimensión.
            if (parsedU.length !== parsedV.length) {
                throw new Error(
                    'Los vectores U y V deben tener la misma dimensión.',
                )
            }

            // Validamos los coeficientes.
            if (
                !Number.isFinite(parsedA) ||
                !Number.isFinite(parsedB)
            ) {
                throw new Error(
                    'Los coeficientes deben ser números válidos.',
                )
            }

            // Activamos el estado de procesamiento.
            setLoading(true)

            // Registramos la operación con sus parámetros.
            const response = await createOperation({
                company_id: DEFAULT_COMPANY_ID,
                name: 'Combinación lineal',
                operation_type: 'linear_combination',
                first_values: [parsedU],
                second_values: [parsedV],
                scalar: parsedA,
                second_scalar: parsedB,
            })

            // Guardamos la operación registrada.
            setOperation(response)

            // Verificamos que el resultado sea un vector.
            if (Array.isArray(response.result)) {
                setResult(response.result as number[])
            } else {
                throw new Error(
                    'No se pudo obtener un vector como resultado.',
                )
            }
        } catch (err) {
            // Mostramos el mensaje generado por la validación o el cálculo.
            setError(
                err instanceof Error
                    ? err.message
                    : 'No se pudo calcular la combinación lineal.',
            )
        } finally {
            // Finalizamos el estado de carga.
            setLoading(false)
        }
    }

    return (
        <div className="min-h-full bg-slate-50 p-6">
            <div className="mx-auto max-w-7xl">
                {/* Encabezado principal del módulo. */}
                <div className="mb-8">
                    <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                        Análisis matemático
                    </p>

                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                        Combinaciones lineales
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm text-slate-500">
                        Combina dos vectores mediante coeficientes para obtener
                        un nuevo vector.
                    </p>
                </div>

                {/* Mensaje de error o validación. */}
                {error && (
                    <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        <span className="font-semibold">Revisa los datos</span>
                        <span>{error}</span>
                    </div>
                )}

                {/* Panel principal para configurar la combinación. */}
                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-6 py-5">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Configuración
                        </p>

                        <h2 className="mt-1 text-xl font-bold text-slate-900">
                            Define los vectores
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Introduce los componentes y coeficientes que formarán
                            la combinación.
                        </p>
                    </div>

                    <div className="p-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Primer vector. */}
                            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5">
                                <div className="mb-5 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                            Vector
                                        </p>

                                        <h3 className="mt-1 text-lg font-bold text-slate-900">
                                            U
                                        </h3>
                                    </div>

                                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
                                        U
                                    </span>
                                </div>

                                <label
                                    htmlFor="vector-u"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Componentes
                                </label>

                                <input
                                    id="vector-u"
                                    type="text"
                                    value={vectorU}
                                    onChange={(event) => setVectorU(event.target.value)}
                                    placeholder="Ejemplo: 1, 2, 3"
                                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                                />

                                <label
                                    htmlFor="coefficient-a"
                                    className="mt-5 mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Coeficiente a
                                </label>

                                <input
                                    id="coefficient-a"
                                    type="number"
                                    value={coefficientA}
                                    onChange={(event) =>
                                        setCoefficientA(event.target.value)
                                    }
                                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                                />
                            </div>

                            {/* Segundo vector. */}
                            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5">
                                <div className="mb-5 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                            Vector
                                        </p>

                                        <h3 className="mt-1 text-lg font-bold text-slate-900">
                                            V
                                        </h3>
                                    </div>

                                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
                                        V
                                    </span>
                                </div>

                                <label
                                    htmlFor="vector-v"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Componentes
                                </label>

                                <input
                                    id="vector-v"
                                    type="text"
                                    value={vectorV}
                                    onChange={(event) => setVectorV(event.target.value)}
                                    placeholder="Ejemplo: 4, 5, 6"
                                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                                />

                                <label
                                    htmlFor="coefficient-b"
                                    className="mt-5 mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Coeficiente b
                                </label>

                                <input
                                    id="coefficient-b"
                                    type="number"
                                    value={coefficientB}
                                    onChange={(event) =>
                                        setCoefficientB(event.target.value)
                                    }
                                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                                />
                            </div>
                        </div>

                        {/* Vista previa de la expresión matemática. */}
                        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Expresión
                            </p>

                            <p className="mt-3 text-2xl font-bold text-slate-900">
                                {coefficientA || 'a'}U + {coefficientB || 'b'}V
                            </p>

                            <p className="mt-2 text-sm text-slate-500">
                                {coefficientA || 'a'}({vectorU || 'U'}) +{' '}
                                {coefficientB || 'b'}({vectorV || 'V'})
                            </p>
                        </div>

                        {/* Ejecuta el cálculo configurado. */}
                        <button
                            type="button"
                            onClick={handleCalculate}
                            disabled={loading}
                            className="mt-6 w-full rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading
                                ? 'Calculando...'
                                : 'Calcular combinación lineal'}
                        </button>
                    </div>
                </section>

                {/* Resultado del cálculo. */}
                {result && (
                    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    Resultado
                                </p>

                                <h2 className="mt-1 text-xl font-bold text-slate-900">
                                    Vector resultante
                                </h2>
                            </div>

                            <span className="inline-flex w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                Calculado
                            </span>
                        </div>

                        {/* Mostramos cada componente del vector resultado. */}
                        <div className="mt-6 flex flex-wrap gap-3">
                            {result.map((value, index) => (
                                <div
                                    key={index}
                                    className="flex min-w-20 flex-col items-center rounded-xl border border-slate-200 bg-slate-50 px-5 py-4"
                                >
                                    <span className="text-xs font-medium text-slate-400">
                                        Componente {index + 1}
                                    </span>

                                    <span className="mt-1 text-2xl font-bold text-slate-900">
                                        {value}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Identificador de la operación registrada. */}
                        {operation && (
                            <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4">
                                <span className="text-sm text-slate-500">
                                    Operación registrada
                                </span>

                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                    #{operation.id}
                                </span>
                            </div>
                        )}
                    </section>
                )}

                {/* Estado inicial cuando todavía no existe un resultado. */}
                {!result && !loading && !error && (
                    <section className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-xl font-bold text-slate-600">
                            aU
                        </div>

                        <h2 className="mt-4 font-semibold text-slate-700">
                            Resultado pendiente
                        </h2>

                        <p className="mx-auto mt-1 max-w-md text-sm text-slate-400">
                            Configura los vectores y sus coeficientes para
                            visualizar el vector resultante.
                        </p>
                    </section>
                )}
            </div>
        </div>
    )
}

export default CombinacionesLineales