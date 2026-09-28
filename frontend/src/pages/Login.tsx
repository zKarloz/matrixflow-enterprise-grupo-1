// ============================================================
// MatrixFlow Enterprise
// Página de inicio de sesión
// ============================================================
//
// Esta página permite al usuario autenticarse contra FastAPI.
//
// Flujo:
// Login React
//     ↓
// POST /api/v1/auth/login
//     ↓
// FastAPI
//     ↓
// PostgreSQL / Supabase
//     ↓
// JWT
// ============================================================

import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { login } from '../services/api'

function Login() {
    // ----------------------------------------------------------
    // Estados del formulario
    // ----------------------------------------------------------

    // Correo introducido por el usuario.
    const [email, setEmail] = useState('')

    // Contraseña introducida por el usuario.
    const [password, setPassword] = useState('')

    // Permite mostrar un indicador mientras se procesa
    // la petición de Login.
    const [loading, setLoading] = useState(false)

    // Permite mostrar mensajes de error.
    const [error, setError] = useState('')

    // useNavigate permite cambiar de página después
    // de iniciar sesión correctamente.
    const navigate = useNavigate()


    // ----------------------------------------------------------
    // Procesar Login
    // ----------------------------------------------------------

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        // Evitamos que el navegador recargue toda la página.
        event.preventDefault()

        // Limpiamos cualquier error anterior.
        setError('')

        // Activamos el estado de carga.
        setLoading(true)

        try {
            // Enviamos las credenciales al backend.
            const response = await login({
                email,
                password,
            })

            // Guardamos el JWT recibido por FastAPI.
            localStorage.setItem(
                'matrixflow-access-token',
                response.access_token
            )

            // Guardamos el tipo de token.
            localStorage.setItem(
                'matrixflow-token-type',
                response.token_type
            )

            // Indicamos que el login terminó correctamente.
            console.log('LOGIN CORRECTO - preparando navegación al Dashboard')

            // Intentamos navegar desde /login hacia /.
            navigate('/')

            // Confirmamos que navigate() fue ejecutado.
            console.log('LOGIN - navigate("/") ejecutado')
        } catch (err) {
            // Mostramos el error recibido desde FastAPI.
            if (err instanceof Error) {
                setError(err.message)
            } else {
                setError('No se pudo iniciar sesión.')
            }
        } finally {
            // Finalizamos el estado de carga.
            setLoading(false)
        }
    }


    // ----------------------------------------------------------
    // Interfaz
    // ----------------------------------------------------------

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">

            <div className="w-full max-w-md">

                {/* --------------------------------------------------
            Tarjeta principal
            -------------------------------------------------- */}

                <div className="bg-white rounded-2xl shadow-xl p-8">

                    {/* ------------------------------------------------
              Encabezado
              ------------------------------------------------ */}

                    <div className="text-center mb-8">

                        <h1 className="text-3xl font-bold text-slate-900">
                            MatrixFlow
                        </h1>

                        <p className="text-slate-500 mt-2">
                            Enterprise
                        </p>

                        <p className="text-slate-600 mt-6">
                            Inicia sesión para continuar
                        </p>

                    </div>


                    {/* ------------------------------------------------
              Mensaje de error
              ------------------------------------------------ */}

                    {error && (
                        <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3">

                            <p className="text-sm text-red-700">
                                {error}
                            </p>

                        </div>
                    )}


                    {/* ------------------------------------------------
              Formulario
              ------------------------------------------------ */}

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >

                        {/* Campo de correo */}

                        <div>

                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-slate-700 mb-2"
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
                                placeholder="admin@matrixflow.com"
                                required
                                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />

                        </div>


                        {/* Campo de contraseña */}

                        <div>

                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-slate-700 mb-2"
                            >
                                Contraseña
                            </label>

                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                placeholder="Ingresa tu contraseña"
                                required
                                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />

                        </div>


                        {/* Botón */}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >

                            {loading
                                ? 'Iniciando sesión...'
                                : 'Iniciar sesión'}

                        </button>

                    </form>

                </div>

            </div>

        </div>
    )
}

export default Login