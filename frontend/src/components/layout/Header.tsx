import { useLocation } from 'react-router-dom'

import { getCurrentUser } from '../../services/api'


// Relaciona cada ruta principal con el título
// mostrado en la barra superior.
const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',

  '/empresa': 'Empresa',
  '/empresa/sucursales': 'Sucursales',
  '/empresa/productos': 'Productos',

  '/ventas': 'Ventas',
  '/inventario': 'Inventario',

  '/analisis-matematico': 'Vectores',
  '/analisis-matematico/vectores': 'Vectores',
  '/analisis-matematico/matrices': 'Matrices',
  '/analisis-matematico/operaciones': 'Operaciones',
  '/analisis-matematico/combinaciones-lineales':
    'Combinaciones lineales',

  '/historial': 'Historial',
  '/reportes': 'Reportes',
  '/usuarios': 'Usuarios',
  '/seguridad': 'Seguridad y accesos',
  '/configuracion': 'Configuración',
}


function Header() {
  const location = useLocation()

  // Obtenemos la sesión actual desde el JWT.
  // Esto se utiliza únicamente con fines visuales.
  const currentUser =
    getCurrentUser()


  const pageTitle =
    PAGE_TITLES[
    location.pathname
    ] ?? 'MatrixFlow'


  const displayRole =
    currentUser?.role ??
    'Usuario'


  // Mientras el JWT no incluya nombre completo,
  // utilizamos las primeras letras del rol.
  const avatarInitials =
    displayRole
      .slice(0, 2)
      .toUpperCase()


  return (
    // El Header solo se muestra desde lg (PC).
    // Su fondo es semitransparente y utiliza backdrop-blur
    // para crear un efecto de vidrio suave sobre el contenido.
    <header
      className="
        matrixflow-glass-header
        fixed
        left-64
        right-0
        top-0
        z-30
        hidden
        h-20

        border-b
        border-[#cbd9e6]/80

        bg-[#E8F2FA]/94
        backdrop-blur-xl
        backdrop-saturate-150

        shadow-sm
        shadow-slate-900/5

        dark:border-slate-700/70
        dark:bg-slate-900/94
        dark:shadow-black/10

        lg:block
      "
    >
      <div className="flex h-full items-center justify-between px-8">

        {/* Título de la página actual. */}
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          {pageTitle}
        </h1>


        {/* Información de la cuenta autenticada. */}
        <div className="flex items-center gap-3">

          <div className="text-right">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              {displayRole}
            </p>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Cuenta activa
            </p>
          </div>


          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white shadow-sm shadow-blue-950/20">
            {avatarInitials}
          </div>

        </div>

      </div>
    </header>
  )
}


export default Header