import { useState } from 'react'
import {
    createOperation,
    type Operation,
} from '../services/api'

// Empresa utilizada durante el desarrollo actual de MatrixFlow.
const DEFAULT_COMPANY_ID = 2

function CombinacionesLineales() {
    // Valores escritos por el usuario para el primer vector.
    const [vectorU, setVectorU] = useState('1, 2, 3')

    // Valores escritos por el usuario para el segundo vector.
    const [vectorV, setVectorV] = useState('4, 5, 6')

    // Coeficiente del primer vector.
    const [coefficientA, setCoefficientA] = useState('2')

    // Coeficiente del segundo vector.
    const [coefficientB, setCoefficientB] = useState('3')

    // Resultado devuelto por el backend.
    const [result, setResult] = useState<number[] | null>(null)

    // Operación registrada por FastAPI.
    const [operation, setOperation] = useState<Operation | null>(null)

    // Controla el estado visual mientras se procesa la operación.
    const [loading, setLoading] = useState(false)

    // Guarda mensajes de error para mostrarlos en la interfaz.
    const [error, setError] = useState('')

    // Convierte una cadena como "1, 2, 3" en un arreglo numérico.
    const parseVector = (value: string): number[] => {
        return value.split(',').map((item) => Number(item.trim()))
    }

    // Ejecuta la combinación lineal utilizando el backend.
    const handleCalculate = async () => {
        // Limpiamos los mensajes y resultados anteriores.
        setError('')
        setResult(null)
        setOperation(null)

        try {
            // Convertimos los textos introducidos en vectores numéricos.
            const parsedU = parseVector(vectorU)
            const parsedV = parseVector(vectorV)

            // Convertimos los coeficientes a números.
            const parsedA = Number(coefficientA)
            const parsedB = Number(coefficientB)

            // Validamos que ambos vectores tengan valores.
            if (
                parsedU.length === 0 ||
                parsedV.length === 0
            ) {
                throw new Error(
                    'Debes ingresar ambos vectores.'
                )
            }

            // Validamos que todos los componentes sean números válidos.
            if (
                parsedU.some((value) => !Number.isFinite(value)) ||
                parsedV.some((value) => !Number.isFinite(value))
            ) {
                throw new Error(
                    'Los vectores solamente pueden contener números.'
                )
            }

            // Una combinación lineal requiere vectores
            // con la misma cantidad de componentes.
            if (parsedU.length !== parsedV.length) {
                throw new Error(
                    'Los vectores U y V deben tener la misma dimensión.'
                )
            }

            // Validamos que los coeficientes sean números válidos.
            if (
                !Number.isFinite(parsedA) ||
                !Number.isFinite(parsedB)
            ) {
                throw new Error(
                    'Los coeficientes deben ser números válidos.'
                )
            }

            // Indicamos que inicia el procesamiento.
            setLoading(true)

            // Enviamos la operación al backend.
            // El cálculo matemático será realizado por FastAPI.
            const response = await createOperation({
                company_id: DEFAULT_COMPANY_ID,
                name: 'Combinación lineal',
                operation_type: 'linear_combination',
                first_values: [parsedU],
                second_values: [parsedV],
                scalar: parsedA,
                second_scalar: parsedB,
            })

            // Guardamos la operación recibida desde FastAPI.
            setOperation(response)

            // El backend devuelve el resultado como un arreglo.
            if (Array.isArray(response.result)) {
                setResult(response.result as number[])
            } else {
                throw new Error(
                    'El backend no devolvió un vector como resultado.'
                )
            }
        } catch (err) {
            // Mostramos el mensaje generado por la validación
            // o por el backend.
            setError(
                err instanceof Error
                    ? err.message
                    : 'No se pudo calcular la combinación lineal.'
            )
        } finally {
            // Terminamos el estado de carga.
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Encabezado principal del módulo. */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900">
                    Combinaciones lineales
                </h1>

                <p className="mt-2 text-slate-600">
                    Calcula combinaciones lineales de dos vectores mediante la
                    expresión aU + bV.
                </p>
            </div>

            {/* Tarjeta principal del formulario. */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Primer vector y su coeficiente. */}
                    <div className="space-y-4">
                        <div>
                            <label
                                htmlFor="vector-u"
                                className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                                Vector U
                            </label>

                            <input
                                id="vector-u"
                                type="text"
                                value={vectorU}
                                onChange={(event) =>
                                    setVectorU(event.target.value)
                                }
                                placeholder="Ejemplo: 1, 2, 3"
                                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="coefficient-a"
                                className="mb-2 block text-sm font-semibold text-slate-700"
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
                                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                    </div>

                    {/* Segundo vector y su coeficiente. */}
                    <div className="space-y-4">
                        <div>
                            <label
                                htmlFor="vector-v"
                                className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                                Vector V
                            </label>

                            <input
                                id="vector-v"
                                type="text"
                                value={vectorV}
                                onChange={(event) =>
                                    setVectorV(event.target.value)
                                }
                                placeholder="Ejemplo: 4, 5, 6"
                                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="coefficient-b"
                                className="mb-2 block text-sm font-semibold text-slate-700"
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
                                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                    </div>
                </div>

                {/* Vista previa de la expresión matemática. */}
                <div className="mt-6 rounded-lg bg-slate-50 p-4 text-center">
                    <p className="text-sm font-medium text-slate-500">
                        Expresión
                    </p>

                    <p className="mt-2 text-xl font-semibold text-slate-900">
                        {coefficientA || 'a'}U + {coefficientB || 'b'}V
                    </p>
                </div>

                {/* Botón para ejecutar la operación en FastAPI. */}
                <button
                    type="button"
                    onClick={handleCalculate}
                    disabled={loading}
                    className="mt-6 w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading
                        ? 'Calculando...'
                        : 'Calcular combinación lineal'}
                </button>
            </div>

            {/* Mensaje de error cuando la operación no puede ejecutarse. */}
            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* Resultado devuelto por el backend. */}
            {result && (
                <div className="rounded-xl border border-green-200 bg-white p-6 shadow-sm">
                    <div className="mb-4">
                        <h2 className="text-xl font-bold text-slate-900">
                            Resultado
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Resultado calculado por FastAPI.
                        </p>
                    </div>

                    {/* Mostramos cada componente del vector resultado. */}
                    <div className="flex flex-wrap gap-3">
                        {result.map((value, index) => (
                            <div
                                key={index}
                                className="rounded-lg bg-slate-100 px-5 py-3 text-lg font-semibold text-slate-900"
                            >
                                {value}
                            </div>
                        ))}
                    </div>

                    {/* Mostramos información básica de la operación registrada. */}
                    {operation && (
                        <div className="mt-5 border-t border-slate-200 pt-4 text-sm text-slate-500">
                            Operación registrada #{operation.id}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default CombinacionesLineales