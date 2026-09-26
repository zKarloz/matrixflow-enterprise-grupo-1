import { Link, useLocation } from 'react-router-dom'

const menuItems = [
  {
    name: 'Dashboard',
    icon: '📊',
    path: '/',
  },
  {
    name: 'Empresa',
    icon: '🏢',
    path: '/empresa',
  },
  {
    name: 'Sucursales',
    icon: '🏪',
    path: '/sucursales',
  },
  {
    name: 'Productos',
    icon: '📦',
    path: '/productos',
  },
  {
    name: 'Ventas',
    icon: '🛒',
    path: '/ventas',
  },
  {
    name: 'Inventario',
    icon: '📦',
    path: '/inventario',
  },
  {
    name: 'Vectores',
    icon: '🧮',
    path: '/vectores',
  },
  {
    name: 'Matrices',
    icon: '📊',
    path: '/matrices',
  },
  {
    name: 'Operaciones',
    icon: '🧮',
    path: '/operaciones',
  },
  {
    name: 'Historial',
    icon: '📋',
    path: '/historial',
  },
  {
    name: 'Reportes',
    icon: '📈',
    path: '/reportes',
  },
  {
    name: 'Usuarios',
    icon: '👥',
    path: '/usuarios',
  },
  {
    name: 'Configuración',
    icon: '⚙️',
    path: '/configuracion',
  },
]

function Sidebar() {
  const location = useLocation()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-slate-900 text-white">

      {/* Logo */}
      <div className="flex h-20 items-center border-b border-slate-700 px-6">
        <div>
          <h1 className="text-xl font-bold tracking-wide">
            MATRIXFLOW
          </h1>

          <p className="text-xs text-slate-400">
            ENTERPRISE
          </p>
        </div>
      </div>

      {/* Menú */}
      <nav className="p-4">

        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Menú principal
        </p>

        <div className="space-y-1">

          {menuItems.map((item) => {

            const isActive = location.pathname === item.path

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition ${
                  isActive
                    ? 'bg-blue-600 font-medium text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="text-base">
                  {item.icon}
                </span>

                <span>
                  {item.name}
                </span>
              </Link>
            )
          })}

        </div>

      </nav>

    </aside>
  )
}

export default Sidebar