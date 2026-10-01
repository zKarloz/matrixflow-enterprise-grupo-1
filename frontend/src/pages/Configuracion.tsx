import { useEffect, useState } from 'react'
import {
  CheckCircle2,
  CircleX,
  RefreshCw,
  Server,
  ShieldCheck,
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

function Configuracion() {
  // Información básica obtenida del JWT actual.
  const currentUser = getCurrentUser()

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

  return (
    <div className="mx-auto max-w-7xl space-y-6">

      {/* Descripción de la sección.
          El título principal ya se muestra en el Header global. */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <p className="max-w-2xl text-sm text-slate-500">
          Consulta el estado general de MatrixFlow y la información
          de la sesión administrativa actual.
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
    </div>
  )
}

export default Configuracion