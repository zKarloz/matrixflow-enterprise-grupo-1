import { useState } from 'react'

function Configuracion() {
  // Estado local para controlar la preferencia de notificaciones.
  const [notifications, setNotifications] = useState(true)

  return (
    <div className="min-h-full bg-slate-50 p-6">
      <div className="mx-auto max-w-5xl">
        {/* Encabezado principal de la página. */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Preferencias
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Configuración
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Personaliza las preferencias generales de tu experiencia
            en MatrixFlow.
          </p>
        </div>

        {/* Contenedor principal de preferencias. */}
        <section className="max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Encabezado de la sección. */}
          <div className="border-b border-slate-200 px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              General
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Preferencias
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Controla cómo deseas recibir determinados avisos.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {/* Preferencia de notificaciones. */}
            <div className="flex items-center justify-between gap-6 px-6 py-6">
              <div className="flex items-start gap-4">
                {/* Indicador visual de la preferencia. */}
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${notifications
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-slate-100 text-slate-500'
                    }`}
                >
                  !
                </div>

                <div>
                  <p className="font-semibold text-slate-800">
                    Notificaciones
                  </p>

                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    Recibir avisos importantes del sistema.
                  </p>
                </div>
              </div>

              {/* Control visual para activar o desactivar las notificaciones. */}
              <button
                type="button"
                role="switch"
                aria-checked={notifications}
                onClick={() => setNotifications(!notifications)}
                className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition ${notifications ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
              >
                <span
                  className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${notifications
                      ? 'translate-x-6'
                      : 'translate-x-1'
                    }`}
                />
              </button>
            </div>

            {/* Estado textual de la preferencia. */}
            <div className="flex items-center justify-between gap-4 bg-slate-50/70 px-6 py-4">
              <p className="text-sm text-slate-500">
                Estado de las notificaciones
              </p>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${notifications
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-slate-100 text-slate-600'
                  }`}
              >
                {notifications ? 'Activadas' : 'Desactivadas'}
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Configuracion