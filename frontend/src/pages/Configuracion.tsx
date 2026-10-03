import { useEffect, useState } from 'react'
import {
  CheckCircle2,
  CircleX,
  RefreshCw,
  Server,
  ShieldCheck,
  Sun,
  Moon,
  UserRound,
} from 'lucide-react'

import {
  checkBackend,
  getCurrentUser,
} from '../services/api'

interface BackendStatus {
  status: string
  service: string
}

// Temas visuales disponibles en MatrixFlow.
type ThemeMode =
  | 'light'
  | 'dark'

const THEME_STORAGE_KEY =
  'matrixflow-theme'

function Configuracion() {
  // Información básica obtenida del JWT actual.
  const currentUser = getCurrentUser()

  // Tema visual seleccionado por el usuario.
  //
  // La preferencia se guarda únicamente en este navegador
  // y no necesita persistirse en PostgreSQL.
  const [
    theme,
    setTheme,
  ] = useState<ThemeMode>(() =>
    localStorage.getItem(
      THEME_STORAGE_KEY,
    ) === 'dark'
      ? 'dark'
      : 'light',
  )

  // Estado real del backend.
  const [backendStatus, setBackendStatus] =
    useState<BackendStatus | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Comprueba que FastAPI esté disponible.
  const loadBackendStatus = async () => {
    try {
      setLoading(true)
      setError('')

      const data = await checkBackend()

      setBackendStatus(data)
    } catch {
      setBackendStatus(null)
      setError('No se pudo establecer conexión con el backend.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadBackendStatus()
  }, [])

  // Aplicamos el tema inmediatamente cada vez que cambia
  // la preferencia seleccionada en esta página.
  useEffect(() => {
    const root =
      document.documentElement

    root.classList.toggle(
      'dark',
      theme === 'dark',
    )

    localStorage.setItem(
      THEME_STORAGE_KEY,
      theme,
    )
  }, [theme])

  return (
    <div className="mx-auto max-w-7xl space-y-6">

      {/* Descripción de la sección.
          El título principal ya se muestra en el Header global. */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <p className="max-w-2xl text-sm text-slate-500">
          Consulta el estado general de MatrixFlow, la información
          de tu sesión y personaliza la apariencia de la interfaz.
        </p>

        <button
          type="button"
          onClick={() => void loadBackendStatus()}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={16}
            className={loading ? 'animate-spin' : ''}
          />

          Actualizar estado
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">

        {/* Estado de conexión con FastAPI. */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Server size={21} />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold text-slate-900">
                Estado del backend
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Comprueba la disponibilidad de la API de MatrixFlow.
              </p>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-5">
            {loading && (
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <RefreshCw
                  size={18}
                  className="animate-spin"
                />

                Comprobando conexión...
              </div>
            )}

            {!loading && backendStatus && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                  <CheckCircle2 size={18} />
                  Backend conectado
                </div>

                <dl className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Servicio
                    </dt>

                    <dd className="mt-1 text-sm font-medium text-slate-800">
                      {backendStatus.service}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Estado
                    </dt>

                    <dd className="mt-1 text-sm font-medium text-slate-800">
                      {backendStatus.status}
                    </dd>
                  </div>
                </dl>
              </div>
            )}

            {!loading && error && (
              <div className="flex items-center gap-2 text-sm font-semibold text-red-600">
                <CircleX size={18} />
                {error}
              </div>
            )}
          </div>
        </section>

        {/* Información disponible de la sesión actual. */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <UserRound size={21} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Sesión actual
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Información obtenida del token de autenticación.
              </p>
            </div>
          </div>

          <dl className="mt-6 grid gap-5 border-t border-slate-100 pt-5 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                ID de usuario
              </dt>

              <dd className="mt-1 text-sm font-medium text-slate-800">
                {currentUser?.userId ?? 'No disponible'}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Rol
              </dt>

              <dd className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-800">
                <ShieldCheck
                  size={16}
                  className="text-blue-600"
                />

                {currentUser?.role ?? 'No disponible'}
              </dd>
            </div>
          </dl>
        </section>

      </div>

      {/* ======================================================
          APARIENCIA
          ======================================================

          Esta preferencia es local al navegador y está
          disponible para los tres roles.
          ====================================================== */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            {theme === 'dark' ? (
              <Moon size={21} />
            ) : (
              <Sun size={21} />
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Apariencia
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Selecciona el tema visual que deseas utilizar en MatrixFlow.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-2">
          {/* Tema claro. */}
          <button
            type="button"
            onClick={() =>
              setTheme('light')
            }
            aria-pressed={
              theme === 'light'
            }
            className={`
              flex
              items-center
              gap-3

              rounded-xl
              border
              p-4
              text-left

              transition-all
              duration-150

              ${theme === 'light'
                ? `
                    border-blue-500
                    bg-blue-50
                    ring-2
                    ring-blue-100
                  `
                : `
                    border-slate-200
                    bg-white
                    hover:border-slate-300
                    hover:bg-slate-50
                  `
              }
            `}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-amber-500 shadow-sm">
              <Sun size={19} />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Claro
              </p>

              <p className="mt-0.5 text-xs text-slate-500">
                Interfaz clara predeterminada.
              </p>
            </div>
          </button>

          {/* Tema oscuro. */}
          <button
            type="button"
            onClick={() =>
              setTheme('dark')
            }
            aria-pressed={
              theme === 'dark'
            }
            className={`
              flex
              items-center
              gap-3

              rounded-xl
              border
              p-4
              text-left

              transition-all
              duration-150

              ${theme === 'dark'
                ? `
                    border-blue-500
                    bg-slate-900
                    ring-2
                    ring-blue-500/20
                  `
                : `
                    border-slate-200
                    bg-white
                    hover:border-slate-300
                    hover:bg-slate-50
                  `
              }
            `}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-blue-300 shadow-sm">
              <Moon size={19} />
            </div>

            <div>
              <p
                className={
                  theme === 'dark'
                    ? 'text-sm font-semibold text-white'
                    : 'text-sm font-semibold text-slate-900'
                }
              >
                Oscuro
              </p>

              <p
                className={
                  theme === 'dark'
                    ? 'mt-0.5 text-xs text-slate-400'
                    : 'mt-0.5 text-xs text-slate-500'
                }
              >
                Reduce el brillo de la interfaz.
              </p>
            </div>
          </button>
        </div>

        <p className="mt-4 text-xs leading-5 text-slate-400">
          La preferencia queda guardada en este navegador y se mantiene
          al volver a iniciar sesión.
        </p>
      </section>
    </div>
  )
}

export default Configuracion