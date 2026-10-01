import { LogOut } from 'lucide-react'
import {
  useLocation,
  useNavigate,
} from 'react-router-dom'

import { getCurrentUser } from '../../services/api'

// Relaciona cada ruta principal con el título que debe
// mostrarse en la barra superior.
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
  const navigate = useNavigate()
  const location = useLocation()

  // La sesión actual se obtiene del JWT almacenado
  // después del inicio de sesión.
  const currentUser = getCurrentUser()

  // Obtiene el título correspondiente a la ruta actual.
  const pageTitle =
    PAGE_TITLES[location.pathname] ?? 'MatrixFlow'

  const displayRole =
    currentUser?.role ?? 'Usuario'

  // Mientras no exista un endpoint de perfil, utilizamos
  // las primeras letras del rol para el avatar.
  const avatarInitials = displayRole
    .slice(0, 2)
    .toUpperCase()

  function handleLogout() {
    // Eliminamos únicamente las credenciales de sesión.
    localStorage.removeItem(
      'matrixflow-access-token',
    )

    localStorage.removeItem(
      'matrixflow-token-type',
    )

    navigate(
      '/login',
      { replace: true },
    )
  }

  return (
    <header className="fixed left-64 right-0 top-0 z-30 h-20 border-b border-slate-200 bg-white">
      <div className="flex h-full items-center justify-between px-8">

        {/* Título único de la página actual. */}
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          {pageTitle}
        </h1>

        {/* Información de la sesión actual. */}
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
            {avatarInitials}
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-800">
              {displayRole}
            </p>

            <p className="text-xs text-slate-500">
              Rol del sistema
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="ml-2 inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>

      </div>
    </header>
  )
}

export default Header