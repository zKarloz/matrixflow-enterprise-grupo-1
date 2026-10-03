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

import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import {
    Workflow,
} from 'lucide-react'

import { login } from '../services/api'

// Clave compartida con Configuración.
// Permite conservar la apariencia seleccionada incluso
// después de cerrar sesión.
const THEME_STORAGE_KEY =
    'matrixflow-theme'

function Login() {
    // ----------------------------------------------------------
    // Estados del formulario
    // ----------------------------------------------------------

    // Conserva el tema seleccionado anteriormente
    // desde la página de Configuración.
    const [
        isDarkTheme,
        setIsDarkTheme,
    ] = useState(
        () =>
            localStorage.getItem(
                THEME_STORAGE_KEY,
            ) === 'dark',
    )

    // Guarda el correo introducido por el usuario.
    const [email, setEmail] = useState('')

    // Guarda la contraseña introducida por el usuario.
    const [password, setPassword] = useState('')

    // Controla si el usuario confirmó el aviso de privacidad
    // relacionado con la IP pública y la ubicación aproximada.
    const [
        privacyAccepted,
        setPrivacyAccepted,
    ] = useState(false)

    // Controla el estado visual mientras se procesa el acceso.
    const [loading, setLoading] = useState(false)

    // Controla la transición visual entre el Login
    // y la aplicación después de autenticarse.
    const [isExiting, setIsExiting] =
        useState(false)

    // Guarda el mensaje que se mostrará cuando ocurra un error.
    const [error, setError] = useState('')

    // Permite redirigir al usuario después de autenticarse.
    const navigate = useNavigate()

    // ----------------------------------------------------------
    // Mantener el tema seleccionado
    // ----------------------------------------------------------

    useEffect(() => {
        // Leemos nuevamente la preferencia al montar Login.
        // Esto cubre accesos directos y recargas en /login.
        const darkThemeEnabled =
            localStorage.getItem(
                THEME_STORAGE_KEY,
            ) === 'dark'

        setIsDarkTheme(
            darkThemeEnabled,
        )

        // Conservamos también la clase global utilizada
        // por el resto de MatrixFlow.
        document.documentElement
            .classList
            .toggle(
                'dark',
                darkThemeEnabled,
            )
    }, [])

    // ----------------------------------------------------------
    // Procesar inicio de sesión
    // ----------------------------------------------------------

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        // Evitamos que el navegador recargue la página.
        event.preventDefault()

        // El acceso requiere que el usuario confirme primero
        // que leyó el aviso de privacidad y seguridad.
        if (!privacyAccepted) {
            setError(
                'Debes aceptar el aviso de privacidad y seguridad para continuar.',
            )
            return
        }

        setError('')
        setLoading(true)

        try {
            // Validamos las credenciales contra FastAPI.
            const response = await login({
                email,
                password,
            })

            // Guardamos el JWT de la sesión.
            localStorage.setItem(
                'matrixflow-access-token',
                response.access_token,
            )

            localStorage.setItem(
                'matrixflow-token-type',
                response.token_type,
            )

            // Iniciamos la transición visual.
            setIsExiting(true)

            // Dejamos que la animación termine antes
            // de mostrar el Dashboard.
            window.setTimeout(() => {
                navigate('/', {
                    replace: true,
                })
            }, 650)
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message)
            } else {
                setError(
                    'No se pudo iniciar sesión.',
                )
            }

            // Solo reactivamos el formulario cuando
            // la autenticación realmente falló.
            setLoading(false)
        }
    }

    // ----------------------------------------------------------
    // Interfaz
    // ----------------------------------------------------------

    return (
        <div
            className={`
                relative
                min-h-screen
                overflow-hidden

                ${isDarkTheme
                    ? 'bg-slate-950'
                    : 'bg-white'
                }
            `}
        >

            {/* ==================================================
                FONDO DECORATIVO PARA MÓVIL
                ==================================================

                Reutiliza la identidad visual del panel izquierdo
                de escritorio sin modificar su diseño.
                ================================================== */}
            <div
                aria-hidden="true"
                className="
                    pointer-events-none
                    absolute
                    inset-0

                    lg:hidden
                "
            >
                <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-slate-800/60 blur-3xl" />
                <div className="absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-cyan-950/50 blur-3xl" />
            </div>

            {/* ==================================================
                CONTENEDOR PRINCIPAL
                ================================================== */}
            <div className="relative z-10 min-h-screen lg:flex">

                {/* ==================================================
                    PANEL DE IDENTIDAD
                    ================================================== */}
                <section
                    className={`
    relative
    hidden
    shrink-0
    overflow-hidden

    ${isDarkTheme
                            ? (
                                isExiting
                                    ? 'bg-slate-950'
                                    : 'bg-slate-900'
                            )
                            : 'bg-[#EEF7FF]'
                        }

    transition-[width,background-color]
    duration-[650ms]
    ease-in-out

    lg:flex

    ${isExiting
                            ? 'w-64'
                            : 'w-[52.5%]'
                        }

    motion-reduce:transition-none
  `}
                >
                    {/* Elementos decorativos sutiles para reforzar
                        la identidad visual sin distraer del formulario. */}
                    <div
                        className={`
                            absolute
                            -left-32
                            -top-32
                            h-96
                            w-96
                            rounded-full
                            blur-3xl

                            ${isDarkTheme
                                ? 'bg-slate-700/40'
                                : 'bg-blue-200/55'
                            }
                        `}
                    />

                    <div
                        className={`
                            absolute
                            -bottom-40
                            -right-20
                            h-96
                            w-96
                            rounded-full
                            blur-3xl

                            ${isDarkTheme
                                ? 'bg-cyan-900/25'
                                : 'bg-cyan-200/45'
                            }
                        `}
                    />

                    <div
                        className={`
    relative
    z-10
    flex
    w-full
    flex-col
    justify-between

    transition-all
    duration-[650ms]

    ${isExiting
                                ? 'p-5'
                                : 'p-12 xl:p-16'
                            }
  `}
                    >

                        {/* Marca */}
                        <div>
                            <div className="flex items-center gap-3">
                                {/* Marca gráfica simple construida con
                                    elementos Tailwind, sin imágenes externas. */}
                                <div
                                    className="
    flex
    h-10
    w-10
    shrink-0
    items-center
    justify-center
    rounded-xl
    bg-blue-600
    text-white
    shadow-sm
    shadow-blue-950/40
  "
                                >
                                    <Workflow size={21} />
                                </div>

                                <div>
                                    <p
                                        className={
                                            isDarkTheme
                                                ? 'text-[15px] font-bold tracking-[0.08em] text-white'
                                                : 'text-[15px] font-bold tracking-[0.08em] text-slate-900'
                                        }
                                    >
                                        MATRIXFLOW
                                    </p>

                                    <p
                                        className={
                                            isDarkTheme
                                                ? 'text-xs font-medium uppercase tracking-[0.2em] text-slate-400'
                                                : 'text-xs font-medium uppercase tracking-[0.2em] text-slate-500'
                                        }
                                    >
                                        Enterprise
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Mensaje principal */}
                        <div
                            className={`
    max-w-xl

    transition-all
    duration-300

    ${isExiting
                                    ? `
          -translate-x-6
          opacity-0
          pointer-events-none
        `
                                    : `
          translate-x-0
          opacity-100
        `
                                }
  `}
                        >
                            <p
                                className={
                                    isDarkTheme
                                        ? 'mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400'
                                        : 'mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-blue-600'
                                }
                            >
                                Gestión empresarial
                            </p>

                            <h1
                                className={
                                    isDarkTheme
                                        ? 'text-4xl font-bold leading-tight tracking-tight text-white xl:text-5xl'
                                        : 'text-4xl font-bold leading-tight tracking-tight text-slate-900 xl:text-5xl'
                                }
                            >
                                Información clara para

                                <span
                                    className={
                                        isDarkTheme
                                            ? 'block text-slate-300'
                                            : 'block text-slate-600'
                                    }
                                >
                                    decisiones inteligentes.
                                </span>
                            </h1>

                            <p
                                className={
                                    isDarkTheme
                                        ? 'mt-6 max-w-lg text-base leading-7 text-slate-400'
                                        : 'mt-6 max-w-lg text-base leading-7 text-slate-600'
                                }
                            >
                                Centraliza ventas, inventario, indicadores
                                y análisis en una experiencia empresarial
                                diseñada para trabajar con tus datos.
                            </p>

                            {/* Indicadores conceptuales de las áreas
                                principales de la plataforma. */}
                            <div className="mt-10 grid max-w-lg grid-cols-3 gap-3">
                                <div
                                    className={
                                        isDarkTheme
                                            ? 'rounded-xl border border-white/10 bg-white/5 p-4'
                                            : 'rounded-xl border border-blue-200/80 bg-white/65 p-4 shadow-sm'
                                    }
                                >
                                    <p
                                        className={
                                            isDarkTheme
                                                ? 'text-xs font-medium text-slate-400'
                                                : 'text-xs font-medium text-slate-500'
                                        }
                                    >
                                        Ventas
                                    </p>

                                    <p
                                        className={
                                            isDarkTheme
                                                ? 'mt-2 text-sm font-semibold text-white'
                                                : 'mt-2 text-sm font-semibold text-slate-800'
                                        }
                                    >
                                        Análisis
                                    </p>
                                </div>

                                <div
                                    className={
                                        isDarkTheme
                                            ? 'rounded-xl border border-white/10 bg-white/5 p-4'
                                            : 'rounded-xl border border-blue-200/80 bg-white/65 p-4 shadow-sm'
                                    }
                                >
                                    <p
                                        className={
                                            isDarkTheme
                                                ? 'text-xs font-medium text-slate-400'
                                                : 'text-xs font-medium text-slate-500'
                                        }
                                    >
                                        Inventario
                                    </p>

                                    <p
                                        className={
                                            isDarkTheme
                                                ? 'mt-2 text-sm font-semibold text-white'
                                                : 'mt-2 text-sm font-semibold text-slate-800'
                                        }
                                    >
                                        Control
                                    </p>
                                </div>

                                <div
                                    className={
                                        isDarkTheme
                                            ? 'rounded-xl border border-white/10 bg-white/5 p-4'
                                            : 'rounded-xl border border-blue-200/80 bg-white/65 p-4 shadow-sm'
                                    }
                                >
                                    <p
                                        className={
                                            isDarkTheme
                                                ? 'text-xs font-medium text-slate-400'
                                                : 'text-xs font-medium text-slate-500'
                                        }
                                    >
                                        Indicadores
                                    </p>

                                    <p
                                        className={
                                            isDarkTheme
                                                ? 'mt-2 text-sm font-semibold text-white'
                                                : 'mt-2 text-sm font-semibold text-slate-800'
                                        }
                                    >
                                        Insights
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Pie del panel */}
                        <p
                            className={`
    text-xs

    ${isDarkTheme
                                    ? 'text-slate-500'
                                    : 'text-slate-500'
                                }

    transition-opacity
    duration-200

    ${isExiting
                                    ? 'opacity-0'
                                    : 'opacity-100'
                                }
  `}
                        >
                            MatrixFlow Enterprise · Plataforma de gestión y análisis
                        </p>
                    </div>
                </section>

                {/* ==================================================
                    PANEL DE ACCESO
                    ================================================== */}
                <main
                    className={`
    flex
    min-w-0
    flex-1
    items-center
    justify-center

    px-4
    py-8

    transition-all
    duration-[650ms]
    ease-in-out

    sm:px-6
    lg:px-12

    ${isDarkTheme
                            ? 'bg-slate-950'
                            : 'bg-white'
                        }

    ${isExiting && !isDarkTheme
                            ? 'bg-white'
                            : ''
                        }
  `}
                >
                    <div
                        className={`
    w-full
    max-w-md

    rounded-3xl
    border
    border-white/10

    ${isDarkTheme
                                ? 'bg-slate-900'
                                : 'bg-white'
                            }

    p-6
    shadow-2xl
    shadow-black/25

    transition-all
    duration-300

    sm:p-8

    lg:rounded-none
    lg:border-0

    ${isDarkTheme
                                ? 'lg:bg-transparent'
                                : 'lg:bg-transparent'
                            }

    lg:p-0
    lg:shadow-none

    ${isExiting
                                ? `
          -translate-x-8
          scale-[0.98]
          opacity-0
        `
                                : `
          translate-x-0
          scale-100
          opacity-100
        `
                            }
  `}
                    >

                        {/* Marca visible en dispositivos pequeños */}
                        <div className="mb-7 flex items-center justify-center gap-3 lg:hidden">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                                <Workflow size={21} />
                            </div>

                            <div>
                                <p
                                    className={
                                        isDarkTheme
                                            ? 'text-lg font-bold tracking-tight text-white'
                                            : 'text-lg font-bold tracking-tight text-slate-900'
                                    }
                                >
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
                        <div className="mb-7 text-center lg:mb-8 lg:text-left">
                            <p className="text-sm font-medium text-slate-500">
                                Bienvenido de nuevo
                            </p>

                            <h2
                                className={
                                    isDarkTheme
                                        ? 'mt-2 text-3xl font-bold tracking-tight text-white'
                                        : 'mt-2 text-3xl font-bold tracking-tight text-slate-900'
                                }
                            >
                                Inicia sesión
                            </h2>

                            <p className="mt-3 text-sm leading-6 text-slate-500">
                                Accede a tu espacio de trabajo para continuar.
                            </p>
                        </div>

                        {/* ==================================================
                            TARJETA DEL FORMULARIO
                            ================================================== */}
                        <div
                            className={`
                                ${isDarkTheme
                                    ? 'bg-slate-900'
                                    : 'bg-white'
                                }

                                lg:rounded-2xl
                                lg:border
                                lg:border-slate-200
                                lg:p-6
                                lg:shadow-sm

                                xl:p-8

                                ${isDarkTheme
                                    ? 'lg:border-slate-700'
                                    : ''
                                }
                            `}
                        >

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
                                        className={
                                            isDarkTheme
                                                ? 'mb-2 block text-sm font-semibold text-slate-200'
                                                : 'mb-2 block text-sm font-semibold text-slate-700'
                                        }
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
                                        className={`
                                            w-full
                                            rounded-xl
                                            border
                                            px-4
                                            py-3
                                            text-sm
                                            outline-none
                                            transition
                                            placeholder:text-slate-500

                                            focus:border-blue-500
                                            focus:ring-4
                                            focus:ring-blue-500/15

                                            disabled:cursor-not-allowed

                                            ${isDarkTheme
                                                ? 'border-slate-700 bg-slate-950 text-slate-100 disabled:bg-slate-800'
                                                : 'border-slate-300 bg-white text-slate-900 disabled:bg-slate-50'
                                            }
                                        `}
                                    />
                                </div>

                                {/* Campo de contraseña */}
                                <div>
                                    <div className="mb-2 flex items-center justify-between">
                                        <label
                                            htmlFor="password"
                                            className={
                                                isDarkTheme
                                                    ? 'block text-sm font-semibold text-slate-200'
                                                    : 'block text-sm font-semibold text-slate-700'
                                            }
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
                                        className={`
                                            w-full
                                            rounded-xl
                                            border
                                            px-4
                                            py-3
                                            text-sm
                                            outline-none
                                            transition
                                            placeholder:text-slate-500

                                            focus:border-blue-500
                                            focus:ring-4
                                            focus:ring-blue-500/15

                                            disabled:cursor-not-allowed

                                            ${isDarkTheme
                                                ? 'border-slate-700 bg-slate-950 text-slate-100 disabled:bg-slate-800'
                                                : 'border-slate-300 bg-white text-slate-900 disabled:bg-slate-50'
                                            }
                                        `}
                                    />
                                </div>

                                {/* ==================================================
                                    AVISO DE PRIVACIDAD Y SEGURIDAD
                                    ================================================== */}
                                <div
                                    className={
                                        isDarkTheme
                                            ? 'rounded-xl border border-slate-700 bg-slate-950/60 p-4'
                                            : 'rounded-xl border border-slate-200 bg-slate-50 p-4'
                                    }
                                >
                                    <div className="mb-3">
                                        <p
                                            className={
                                                isDarkTheme
                                                    ? 'text-sm font-semibold text-slate-100'
                                                    : 'text-sm font-semibold text-slate-800'
                                            }
                                        >
                                            Aviso de privacidad y seguridad
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-slate-500">
                                            Al iniciar sesión, MatrixFlow Enterprise puede
                                            registrar tu dirección IP pública y obtener una
                                            ubicación aproximada asociada a ella con fines
                                            de seguridad, auditoría y control de accesos.
                                            Esta información no corresponde a una ubicación
                                            GPS ni determina con exactitud tu domicilio.
                                        </p>
                                    </div>

                                    <label
                                        htmlFor="privacy-accepted"
                                        className={`
                                            flex
                                            cursor-pointer
                                            items-start
                                            gap-3
                                            rounded-lg
                                            border
                                            p-3
                                            transition-colors

                                            ${isDarkTheme
                                                ? 'border-slate-700 bg-slate-900 hover:border-slate-600 hover:bg-slate-800'
                                                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                                            }
                                        `}
                                    >
                                        <input
                                            id="privacy-accepted"
                                            type="checkbox"
                                            checked={privacyAccepted}
                                            onChange={(event) =>
                                                setPrivacyAccepted(
                                                    event.target.checked,
                                                )
                                            }
                                            disabled={loading}
                                            className="
                                                mt-0.5
                                                h-4
                                                w-4
                                                shrink-0
                                                cursor-pointer
                                                rounded
                                                border-slate-300
                                                accent-blue-600
                                                disabled:cursor-not-allowed
                                            "
                                        />

                                        <span
                                            className={
                                                isDarkTheme
                                                    ? 'text-xs leading-5 text-slate-400'
                                                    : 'text-xs leading-5 text-slate-600'
                                            }
                                        >
                                            He leído y comprendo que MatrixFlow puede
                                            registrar mi dirección IP pública, navegador,
                                            fecha y hora de acceso, y una ubicación
                                            aproximada asociada a la IP.
                                        </span>
                                    </label>
                                </div>

                                {/* Botón principal */}
                                <button
                                    type="submit"
                                    disabled={
                                        loading ||
                                        !privacyAccepted
                                    }
                                    className={`
                                        flex
                                        w-full
                                        items-center
                                        justify-center
                                        gap-2
                                        rounded-xl
                                        px-4
                                        py-3.5
                                        text-sm
                                        font-semibold
                                        text-white
                                        transition

                                        focus:outline-none
                                        focus:ring-4

                                        disabled:cursor-not-allowed
                                        disabled:opacity-60

                                        ${isDarkTheme
                                            ? 'bg-blue-600 hover:bg-blue-500 focus:ring-blue-500/20'
                                            : 'bg-slate-900 hover:bg-slate-800 focus:ring-slate-200'
                                        }
                                    `}
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
                        <p className="mt-5 text-center text-xs leading-5 text-slate-400 lg:mt-6">
                            Acceso protegido para usuarios autorizados de MatrixFlow Enterprise.
                        </p>
                    </div>
                </main>
            </div>
        </div>
    )
}

export default Login