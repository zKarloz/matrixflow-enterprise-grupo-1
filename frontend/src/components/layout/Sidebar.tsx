import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

// Estructura principal del menú de MatrixFlow.
// Los elementos que tienen "children" funcionan como menús padre.
const menuItems = [
  {
    name: 'Dashboard',
    icon: '📊',
    path: '/',
  },

  // Menú Empresa
  {
    name: 'Empresa',
    icon: '🏢',
    children: [
      {
        name: 'Sucursales',
        icon: '🏪',
        path: '/empresa/sucursales',
      },
      {
        name: 'Productos',
        icon: '📦',
        path: '/empresa/productos',
      },
    ],
  },

  // Menú Análisis Matemático
  {
    name: 'Análisis Matemático',
    icon: '🧮',
    children: [
      {
        name: 'Vectores',
        icon: '→',
        path: '/analisis-matematico/vectores',
      },
      {
        name: 'Matrices',
        icon: '▦',
        path: '/analisis-matematico/matrices',
      },
      {
        name: 'Operaciones',
        icon: '±',
        path: '/analisis-matematico/operaciones',
      },
      {
        name: 'Combinaciones lineales',
        icon: '∑',
        path: '/analisis-matematico/combinaciones-lineales',
      },
    ],
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

  // Controla qué menús padre están desplegados.
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    Empresa: true,
    'Análisis Matemático': true,
  })

  // Abre o cierra un menú padre.
  const toggleMenu = (name: string) => {
    setOpenMenus((previous) => ({
      ...previous,
      [name]: !previous[name],
    }))
  }

  // Determina si una ruta está activa.
  const isPathActive = (path: string) => {
    return location.pathname === path
  }

  // Determina si alguno de los hijos del menú está activo.
  const hasActiveChild = (children?: { path: string }[]) => {
    return children?.some((child) => location.pathname === child.path) ?? false
  }

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

      {/* Menú principal */}
      <nav className="p-4">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Menú principal
        </p>

        <div className="space-y-1">
          {menuItems.map((item) => {
            // Si el elemento tiene hijos, mostramos un menú desplegable.
            if (item.children) {
              const isOpen = openMenus[item.name]
              const hasActive = hasActiveChild(item.children)

              return (
                <div key={item.name}>
                  {/* Botón del menú padre */}
                  <button
                    type="button"
                    onClick={() => toggleMenu(item.name)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-3 text-sm transition ${hasActive
                      ? 'bg-slate-800 font-medium text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-base">
                        {item.icon}
                      </span>

                      <span>
                        {item.name}
                      </span>
                    </span>

                    {/* Flecha que indica si el menú está abierto */}
                    <span
                      className={`text-xs transition-transform ${isOpen ? 'rotate-180' : ''
                        }`}
                    >
                      ▼
                    </span>
                  </button>

                  {/* Submenú */}
                  {isOpen && (
                    <div className="ml-4 mt-1 space-y-1 border-l border-slate-700 pl-3">
                      {item.children.map((child) => {
                        const isActive = isPathActive(child.path)

                        return (
                          <Link
                            key={child.path}
                            to={child.path}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${isActive
                              ? 'bg-blue-600 font-medium text-white'
                              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                              }`}
                          >
                            <span className="w-5 text-center text-sm">
                              {child.icon}
                            </span>

                            <span>
                              {child.name}
                            </span>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }

            // Elementos normales del menú.
            const isActive = isPathActive(item.path!)

            return (
              <Link
                key={item.path}
                to={item.path!}
                className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition ${isActive
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