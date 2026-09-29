import { useState } from 'react'

function Configuracion() {
  // Estado local para controlar la preferencia de notificaciones.
  const [notifications, setNotifications] = useState(true)

  return (
    <div>
      {/* Encabezado de la página de configuración. */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Configuración
        </h1>

        <p className="mt-2 text-slate-500">
          Configuración general del sistema.
        </p>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Sección de preferencias generales. */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Preferencias
          </h2>

          <div className="mt-6 space-y-6">
            {/* Preferencia de notificaciones. */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-slate-800">
                  Notificaciones
                </p>

                <p className="text-sm text-slate-500">
                  Recibir avisos importantes del sistema.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setNotifications(!notifications)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${notifications
                    ? 'bg-green-100 text-green-700'
                    : 'bg-slate-100 text-slate-600'
                  }`}
              >
                {notifications ? 'Activadas' : 'Desactivadas'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Configuracion