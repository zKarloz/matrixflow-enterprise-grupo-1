// ============================================================
// MatrixFlow Enterprise
// Página de inicio de sesión
// ============================================================
//
// Esta página permite al usuario acceder a MatrixFlow mediante
// sus credenciales.
//
// La lógica de autenticación existente se mantiene:
// - Envío de correo y contraseña.
// - Recepción y almacenamiento del token.
// - Navegación al Dashboard después del acceso correcto.
//
// El cambio se concentra en la presentación visual y experiencia
// de usuario.
// ============================================================

import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { login } from '../services/api'

function Login() {
    // ----------------------------------------------------------
    // Estados del formulario
    // ----------------------------------------------------------

    // Guarda el correo introducido por el usuario.
    const [email, setEmail] = useState('')

    // Guarda la contraseña introducida por el usuario.
    const [password, setPassword] = useState('')

    // Controla el estado visual mientras se procesa el acceso.
    const [loading, setLoading] = useState(false)

    // Guarda el mensaje que se mostrará cuando ocurra un error.
    const [error, setError] = useState('')

    // Permite redirigir al usuario después de autenticarse.
    const navigate = useNavigate()

    // ----------------------------------------------------------
    // Procesar inicio de sesión
    // ----------------------------------------------------------

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        // Evitamos que el navegador recargue toda la página.
        event.preventDefault()

        // Limpiamos cualquier error anterior.
        setError('')

        // Activamos el estado de procesamiento.
        setLoading(true)

        try {
            // Enviamos las credenciales para validar el acceso.
            const response = await login({
                email,
                password,
            })

            // Guardamos el token de acceso para las siguientes
            // solicitudes autenticadas de la aplicación.
            localStorage.setItem(
                'matrixflow-access-token',
                response.access_token
            )

            // Guardamos el tipo de token recibido.
            localStorage.setItem(
                'matrixflow-token-type',
                response.token_type
            )

            // Redirigimos al Dashboard después del acceso correcto.
            navigate('/')
        } catch (err) {
            // Mostramos un mensaje amigable cuando las credenciales
            // no pueden ser procesadas correctamente.
            if (err instanceof Error) {
                setError(err.message)
            } else {
                setError('No se pudo iniciar sesión.')
            }
        } finally {
            // Finalizamos el estado de carga independientemente
            // del resultado de la operación.
            setLoading(false)
        }
    }

    // ----------------------------------------------------------
    // Interfaz
    // ----------------------------------------------------------

    return (
        <div className="min-h-screen bg-slate-50">

            {/* ==================================================
                CONTENEDOR PRINCIPAL
                ================================================== */}
            <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">

                {/* ==================================================
                    PANEL DE IDENTIDAD
                    ================================================== */}
                <section className="relative hidden overflow-hidden bg-slate-950 lg:flex">
                    {/* Elementos decorativos sutiles para reforzar
                        la identidad visual sin distraer del formulario. */}
                    <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-slate-800/60 blur-3xl" />
                    <div className="absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-cyan-950/40 blur-3xl" />

                    <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">

                        {/* Marca */}
                        <div>
                            <div className="flex items-center gap-3">
                                {/* Marca gráfica simple construida con
                                    elementos Tailwind, sin imágenes externas. */}
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sm font-bold text-slate-950">
                                    MF
                                </div>

                                <div>
                                    <p className="text-lg font-bold tracking-tight text-white">
                                        MatrixFlow
                                    </p>

                                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                                        Enterprise
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Mensaje principal */}
                        <div className="max-w-xl">
                            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
                                Gestión empresarial
                            </p>

                            <h1 className="text-4xl font-bold leading-tight tracking-tight text-white xl:text-5xl">
                                Información clara para
                                <span className="block text-slate-300">
                                    decisiones inteligentes.
                                </span>
                            </h1>

                            <p className="mt-6 max-w-lg text-base leading-7 text-slate-400">
                                Centraliza ventas, inventario, indicadores
                                y análisis en una experiencia empresarial
                                diseñada para trabajar con tus datos.
                            </p>

                            {/* Indicadores conceptuales de las áreas
                                principales de la plataforma. */}
                            <div className="mt-10 grid max-w-lg grid-cols-3 gap-3">
                                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                                    <p className="text-xs font-medium text-slate-400">
                                        Ventas
                                    </p>

                                    <p className="mt-2 text-sm font-semibold text-white">
                                        Análisis
                                    </p>
                                </div>

                                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                                    <p className="text-xs font-medium text-slate-400">
                                        Inventario
                                    </p>

                                    <p className="mt-2 text-sm font-semibold text-white">
                                        Control
                                    </p>
                                </div>

                                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                                    <p className="text-xs font-medium text-slate-400">
                                        Indicadores
                                    </p>

                                    <p className="mt-2 text-sm font-semibold text-white">
                                        Insights
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Pie del panel */}
                        <p className="text-xs text-slate-500">
                            MatrixFlow Enterprise · Plataforma de gestión y análisis
                        </p>
                    </div>
                </section>

                {/* ==================================================
                    PANEL DE ACCESO
                    ================================================== */}
                <main className="flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
                    <div className="w-full max-w-md">

                        {/* Marca visible en dispositivos pequeños */}
                        <div className="mb-10 flex items-center justify-center gap-3 lg:hidden">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white">
                                MF
                            </div>

                            <div>
                                <p className="text-lg font-bold tracking-tight text-slate-900">
                                    MatrixFlow
                                </p>

                                <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                                    Enterprise
                                </p>
                            </div>
                        </div>

                        {/* ==================================================
                            ENCABEZADO DEL FORMULARIO
                            ================================================== */}
                        <div className="mb-8">
                            <p className="text-sm font-medium text-slate-500">
                                Bienvenido de nuevo
                            </p>

                            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                                Inicia sesión
                            </h2>

                            <p className="mt-3 text-sm leading-6 text-slate-500">
                                Accede a tu espacio de trabajo para continuar.
                            </p>
                        </div>

                        {/* ==================================================
                            TARJETA DEL FORMULARIO
                            ================================================== */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

                            {/* Mensaje de error */}
                            {error && (
                                <div
                                    role="alert"
                                    className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3"
                                >
                                    <div className="flex gap-3">
                                        {/* Indicador visual del error */}
                                        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-700">
                                            !
                                        </div>

                                        <div>
                                            <p className="text-sm font-semibold text-red-800">
                                                No se pudo iniciar sesión
                                            </p>

                                            <p className="mt-1 text-sm leading-5 text-red-600">
                                                {error}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Formulario de autenticación */}
                            <form
                                onSubmit={handleSubmit}
                                className="space-y-5"
                            >

                                {/* Campo de correo */}
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="mb-2 block text-sm font-semibold text-slate-700"
                                    >
                                        Correo electrónico
                                    </label>

                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(event) =>
                                            setEmail(event.target.value)
                                        }
                                        placeholder="tu@empresa.com"
                                        autoComplete="email"
                                        required
                                        disabled={loading}
                                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                                    />
                                </div>

                                {/* Campo de contraseña */}
                                <div>
                                    <div className="mb-2 flex items-center justify-between">
                                        <label
                                            htmlFor="password"
                                            className="block text-sm font-semibold text-slate-700"
                                        >
                                            Contraseña
                                        </label>
                                    </div>

                                    <input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(event) =>
                                            setPassword(event.target.value)
                                        }
                                        placeholder="Ingresa tu contraseña"
                                        autoComplete="current-password"
                                        required
                                        disabled={loading}
                                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                                    />
                                </div>

                                {/* Botón principal */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {loading ? (
                                        <>
                                            {/* Spinner visual durante la autenticación */}
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                                            <span>
                                                Iniciando sesión...
                                            </span>
                                        </>
                                    ) : (
                                        'Iniciar sesión'
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Mensaje inferior */}
                        <p className="mt-6 text-center text-xs leading-5 text-slate-400">
                            Acceso protegido para usuarios autorizados de MatrixFlow Enterprise.
                        </p>
                    </div>
                </main>
            </div>
        </div>
    )
}

export default Login