// ============================================================
// MatrixFlow Enterprise
// Barra superior de la aplicación
// ============================================================
//
// Este componente muestra:
//
// - Información general del sistema.
// - Usuario actualmente conectado.
// - Botón para cerrar sesión.
//
// Al cerrar sesión se eliminan las credenciales almacenadas
// en localStorage y se redirige al usuario hacia /login.
// ============================================================

import { useNavigate } from 'react-router-dom'


function Header() {

  // ==========================================================
  // NAVEGACIÓN
  // ==========================================================

  // Permite cambiar de ruta después de cerrar sesión.
  const navigate = useNavigate()


  // ==========================================================
  // CERRAR SESIÓN
  // ==========================================================

  function handleLogout() {

    // Eliminamos el JWT almacenado después del Login.
    localStorage.removeItem(
      'matrixflow-access-token'
    )

    // Eliminamos también el tipo de token.
    localStorage.removeItem(
      'matrixflow-token-type'
    )

    // Enviamos al usuario nuevamente al Login.
    //
    // replace evita que el usuario pueda volver fácilmente
    // a la página protegida mediante el historial del navegador.
    navigate(
      '/login',
      { replace: true }
    )
  }


  // ==========================================================
  // INTERFAZ
  // ==========================================================

  return (
    <header className="fixed left-64 right-0 top-0 z-30 h-20 border-b border-slate-200 bg-white">

      <div className="flex h-full items-center justify-between px-8">

        {/* ==================================================
            INFORMACIÓN DEL SISTEMA
            ================================================== */}

        <div>

          <h2 className="text-lg font-semibold text-slate-800">
            Panel empresarial
          </h2>

          <p className="text-sm text-slate-500">
            Análisis de ventas e indicadores
          </p>

        </div>


        {/* ==================================================
            INFORMACIÓN DEL USUARIO
            ================================================== */}

        <div className="flex items-center gap-4">

          {/* Icono de búsqueda. */}
          <span className="text-lg">
            🔍
          </span>

          {/* Icono de notificaciones. */}
          <span className="text-lg">
            🔔
          </span>


          {/* Separador e información del usuario. */}
          <div className="flex items-center gap-3 border-l border-slate-200 pl-5">

            {/* Avatar. */}
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
              JD
            </div>


            {/* Nombre y rol. */}
            <div>

              <p className="text-sm font-semibold text-slate-800">
                Usuario
              </p>

              <p className="text-xs text-slate-500">
                Administrador
              </p>

            </div>


            {/* ==================================================
                BOTÓN CERRAR SESIÓN
                ================================================== */}

            <button
              type="button"
              onClick={handleLogout}
              className="ml-3 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-red-500 hover:bg-red-500 hover:text-white"
            >
              Cerrar sesión
            </button>

          </div>

        </div>

      </div>

    </header>
  )
}


// Exportamos el Header.
export default Header