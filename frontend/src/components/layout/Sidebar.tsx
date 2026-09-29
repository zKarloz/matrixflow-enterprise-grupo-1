import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  BarChart3,
  Building2,
  Calculator,
  ClipboardList,
  FileText,
  History,
  LayoutDashboard,
  Package,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Users,
  Boxes,
  ChevronDown,
} from 'lucide-react'

import { getCurrentUser } from '../../services/api'

// ============================================================
// TIPOS
// ============================================================

// Roles definidos actualmente en MatrixFlow.
// Deben coincidir con los roles enviados por el backend.
type UserRole = 'Administrador' | 'Analista' | 'Consulta'

// Estructura de un elemento del menú.
interface MenuItem {
  name: string
  path?: string
  icon: React.ReactNode
  roles: UserRole[]
  children?: MenuItem[]
}

// ============================================================
// MENÚ PRINCIPAL
// ============================================================

// La estructura sigue la navegación definida en el PDF.
// Los roles determinan qué opciones puede visualizar cada usuario.
const menuItems: MenuItem[] = [
  {
    name: 'Dashboard',
    path: '/',
    icon: <LayoutDashboard size={20} />,
    roles: ['Administrador', 'Analista', 'Consulta'],
  },

  // Empresa: solamente Administrador.
  {
    name: 'Empresa',
    icon: <Building2 size={20} />,
    roles: ['Administrador'],
    children: [
      {
        name: 'Sucursales',
        path: '/empresa/sucursales',
        icon: <Building2 size={18} />,
        roles: ['Administrador'],
      },
      {
        name: 'Productos',
        path: '/empresa/productos',
        icon: <Package size={18} />,
        roles: ['Administrador'],
      },
    ],
  },

  // Ventas: Administrador y Analista.
  {
    name: 'Ventas',
    path: '/ventas',
    icon: <ShoppingCart size={20} />,
    roles: ['Administrador', 'Analista'],
  },

  // Inventario: Administrador y Analista.
  {
    name: 'Inventario',
    path: '/inventario',
    icon: <Boxes size={20} />,
    roles: ['Administrador', 'Analista'],
  },

  // Análisis Matemático: Administrador y Analista.
  {
    name: 'Análisis Matemático',
    icon: <Calculator size={20} />,
    roles: ['Administrador', 'Analista'],
    children: [
      {
        name: 'Vectores',
        path: '/analisis-matematico/vectores',
        icon: <BarChart3 size={18} />,
        roles: ['Administrador', 'Analista'],
      },
      {
        name: 'Matrices',
        path: '/analisis-matematico/matrices',
        icon: <ClipboardList size={18} />,
        roles: ['Administrador', 'Analista'],
      },
      {
        name: 'Operaciones',
        path: '/analisis-matematico/operaciones',
        icon: <Calculator size={18} />,
        roles: ['Administrador', 'Analista'],
      },
      {
        name: 'Combinaciones lineales',
        path: '/analisis-matematico/combinaciones-lineales',
        icon: <BarChart3 size={18} />,
        roles: ['Administrador', 'Analista'],
      },
    ],
  },

  // Historial: contiene la trazabilidad de operaciones y resultados.
  // Se considera útil para Administrador y Analista.
  {
    name: 'Historial',
    path: '/historial',
    icon: <History size={20} />,
    roles: ['Administrador', 'Analista'],
  },

  // Reportes: disponibles para los tres roles.
  // Para Consulta, el backend puede restringir los reportes autorizados.
  {
    name: 'Reportes',
    path: '/reportes',
    icon: <FileText size={20} />,
    roles: ['Administrador', 'Analista', 'Consulta'],
  },

  // Usuarios: solamente Administrador.
  {
    name: 'Usuarios',
    path: '/usuarios',
    icon: <Users size={20} />,
    roles: ['Administrador'],
  },

  // Seguridad: función administrativa.
  // El PDF habla de seguridad y auditoría como parte del sistema,
  // por lo que mantenemos esta sección exclusiva del Administrador.
  {
    name: 'Seguridad y accesos',
    path: '/seguridad',
    icon: <ShieldCheck size={20} />,
    roles: ['Administrador'],
  },

  // Configuración: solamente Administrador.
  {
    name: 'Configuración',
    path: '/configuracion',
    icon: <Settings size={20} />,
    roles: ['Administrador'],
  },
]

// ============================================================
// COMPONENTE SIDEBAR
// ============================================================

function Sidebar() {
  const location = useLocation()

  // Obtenemos la información del usuario a partir del JWT.
  // Esta información solamente controla la interfaz.
  const currentUser = getCurrentUser()

  // Convertimos el rol obtenido del JWT al tipo definido arriba.
  const currentRole = currentUser?.role as UserRole | undefined

  // Estado que controla qué menús con hijos están desplegados.
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

  // Comprueba si una ruta es la ruta actual.
  const isPathActive = (path: string) => {
    return location.pathname === path
  }

  // Comprueba si alguno de los hijos está actualmente activo.
  const hasActiveChild = (children?: MenuItem[]) => {
    return (
      children?.some(
        (child) => child.path && location.pathname === child.path
      ) ?? false
    )
  }

  // Comprueba si el rol actual puede visualizar un elemento.
  const canView = (roles: UserRole[]) => {
    return Boolean(currentRole && roles.includes(currentRole))
  }

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-slate-900 text-white">
      {/* Logo de MatrixFlow */}
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
            // Si el usuario no tiene permiso para el módulo,
            // no lo mostramos en la interfaz.
            if (!canView(item.roles)) {
              return null
            }

            // ==================================================
            // MENÚ CON SUBMENÚ
            // ==================================================

            if (item.children) {
              // Filtramos los hijos según el rol.
              const visibleChildren = item.children.filter((child) =>
                canView(child.roles)
              )

              // Si no tiene ningún hijo disponible,
              // tampoco mostramos el menú padre.
              if (visibleChildren.length === 0) {
                return null
              }

              const isOpen = openMenus[item.name]
              const hasActive = hasActiveChild(visibleChildren)

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

                      <span>{item.name}</span>
                    </span>

                    <ChevronDown
                      size={16}
                      className={`transition-transform ${isOpen ? 'rotate-180' : ''
                        }`}
                    />
                  </button>

                  {/* Submenú */}
                  {isOpen && (
                    <div className="ml-4 mt-1 space-y-1 border-l border-slate-700 pl-3">
                      {visibleChildren.map((child) => {
                        const isActive =
                          child.path &&
                          isPathActive(child.path)

                        return (
                          <Link
                            key={child.path}
                            to={child.path!}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${isActive
                              ? 'bg-blue-600 font-medium text-white'
                              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                              }`}
                          >
                            <span className="w-5 text-center text-sm">
                              {child.icon}
                            </span>

                            <span>{child.name}</span>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }

            // ==================================================
            // ELEMENTO NORMAL
            // ==================================================

            const isActive =
              item.path && isPathActive(item.path)

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

                <span>{item.name}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </aside>
  )
}

export default Sidebar