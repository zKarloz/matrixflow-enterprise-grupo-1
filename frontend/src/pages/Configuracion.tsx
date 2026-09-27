import { useState } from 'react'

interface ConfiguracionProps {
  darkMode: boolean
  setDarkMode: (value: boolean) => void
}

function Configuracion({
  darkMode,
  setDarkMode,
}: ConfiguracionProps) {
  const [notifications, setNotifications] = useState(true)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Configuración
        </h1>

        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Configuración general del sistema.
        </p>
      </div>

      <div className="max-w-3xl space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-900">

          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Preferencias
          </h2>

          <div className="mt-6 space-y-6">

            {/* NOTIFICACIONES */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-slate-800 dark:text-slate-200">
                  Notificaciones
                </p>

                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Recibir avisos importantes del sistema.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setNotifications(!notifications)
                }
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${notifications
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                  }`}
              >
                {notifications
                  ? 'Activadas'
                  : 'Desactivadas'}
              </button>
            </div>

            {/* MODO OSCURO */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-slate-800 dark:text-slate-200">
                  Modo oscuro
                </p>

                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Preferencia visual del sistema.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDarkMode(!darkMode)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${darkMode
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                  }`}
              >
                {darkMode
                  ? 'Activado'
                  : 'Desactivado'}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default Configuracion