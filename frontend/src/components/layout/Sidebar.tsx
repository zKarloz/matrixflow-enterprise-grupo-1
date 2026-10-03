import { useState } from 'react'
import type { ReactNode } from 'react'

import {
  Link,
  useLocation,
} from 'react-router-dom'

import {
  BarChart3,
  Boxes,
  Building2,
  Calculator,
  ChevronDown,
  ClipboardList,
  FileText,
  History,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Users,
  Workflow,
} from 'lucide-react'

import { getCurrentUser } from '../../services/api'


// ============================================================
// TIPOS
// ============================================================

// Roles disponibles actualmente en MatrixFlow.
// Deben coincidir con los valores enviados dentro del JWT.
export type UserRole =
  | 'Administrador'
  | 'Analista'
  | 'Consulta'


// Representa un elemento del menú lateral.
export interface MenuItem {
  name: string
  path?: string
  icon: ReactNode
  roles: UserRole[]
  children?: MenuItem[]
}


// ============================================================
// MENÚ PRINCIPAL
// ============================================================

export const menuItems: MenuItem[] = [
  {
    name: 'Dashboard',
    path: '/',
    icon: <LayoutDashboard size={19} />,
    roles: [
      'Administrador',
      'Analista',
      'Consulta',
    ],
  },

  {
    // Empresa funciona como página principal del módulo.
    // Desde allí se accede a Sucursales y Productos.
    name: 'Empresa',
    path: '/empresa',
    icon: <Building2 size={19} />,
    roles: ['Administrador'],
  },

  {
    name: 'Ventas',
    path: '/ventas',
    icon: <ShoppingCart size={19} />,
    roles: [
      'Administrador',
      'Analista',
    ],
  },

  {
    name: 'Inventario',
    path: '/inventario',
    icon: <Boxes size={19} />,
    roles: [
      'Administrador',
      'Analista',
    ],
  },

  {
    name: 'Análisis Matemático',
    icon: <Calculator size={19} />,
    roles: [
      'Administrador',
      'Analista',
    ],
    children: [
      {
        name: 'Vectores',
        path: '/analisis-matematico/vectores',
        icon: <BarChart3 size={16} />,
        roles: [
          'Administrador',
          'Analista',
        ],
      },
      {
        name: 'Matrices',
        path: '/analisis-matematico/matrices',
        icon: <ClipboardList size={16} />,
        roles: [
          'Administrador',
          'Analista',
        ],
      },
      {
        name: 'Operaciones',
        path: '/analisis-matematico/operaciones',
        icon: <Calculator size={16} />,
        roles: [
          'Administrador',
          'Analista',
        ],
      },
      {
        name: 'Combinaciones lineales',
        path:
          '/analisis-matematico/combinaciones-lineales',
        icon: <BarChart3 size={16} />,
        roles: [
          'Administrador',
          'Analista',
        ],
      },
    ],
  },

  {
    name: 'Historial',
    path: '/historial',
    icon: <History size={19} />,
    roles: [
      'Administrador',
      'Analista',
    ],
  },

  {
    name: 'Reportes',
    path: '/reportes',
    icon: <FileText size={19} />,
    roles: [
      'Administrador',
      'Analista',
      'Consulta',
    ],
  },

  {
    name: 'Usuarios',
    path: '/usuarios',
    icon: <Users size={19} />,
    roles: ['Administrador'],
  },

  {
    name: 'Seguridad y accesos',
    path: '/seguridad',
    icon: <ShieldCheck size={19} />,
    roles: ['Administrador'],
  },

  {
    name: 'Configuración',
    path: '/configuracion',
    icon: <Settings size={19} />,
    roles: ['Administrador', 'Analista', 'Consulta'],
  },
]


// ============================================================
// PROPIEDADES DEL SIDEBAR
// ============================================================

interface SidebarProps {
  // Indica que se está ejecutando la transición
  // visual hacia la pantalla de Login.
  isLoggingOut: boolean

  // La lógica real del cierre de sesión vive
  // en AppLayout, no dentro del Sidebar.
  onLogout: () => void
}


// ============================================================
// COMPONENTE
// ============================================================

function Sidebar({
  isLoggingOut,
  onLogout,
}: SidebarProps) {
  const location = useLocation()

  // Obtenemos el rol almacenado dentro del JWT.
  // El backend sigue siendo la autoridad real
  // sobre autenticación y permisos.
  const currentUser =
    getCurrentUser()

  const currentRole =
    currentUser?.role as
    | UserRole
    | undefined


  // Los grupos aparecen abiertos inicialmente
  // solamente cuando estamos dentro de sus rutas.
  const [
    openMenus,
    setOpenMenus,
  ] = useState<
    Record<string, boolean>
  >({
    'Análisis Matemático':
      location.pathname.startsWith(
        '/analisis-matematico',
      ),
  })


  // ==========================================================
  // FUNCIONES AUXILIARES
  // ==========================================================

  const toggleMenu = (
    name: string,
  ) => {
    setOpenMenus(
      (previous) => ({
        ...previous,
        [name]:
          !previous[name],
      }),
    )
  }


  const isPathActive = (
    path: string,
  ) => {
    return (
      location.pathname === path
    )
  }


  const hasActiveChild = (
    children?: MenuItem[],
  ) => {
    return (
      children?.some(
        (child) =>
          child.path &&
          location.pathname ===
          child.path,
      ) ?? false
    )
  }


  const canView = (
    roles: UserRole[],
  ) => {
    return Boolean(
      currentRole &&
      roles.includes(
        currentRole,
      ),
    )
  }


  return (
    <aside
      className="
    fixed
    left-0
    top-0
    z-40

    hidden
    h-screen
    w-64
    flex-col

    overflow-hidden

    border-r
    border-[#cbd9e6]
    bg-[#E8F2FA]
    text-slate-900

    dark:border-slate-700/80
    dark:bg-slate-900
    dark:text-white

    lg:flex
  "
    >

      {/* ====================================================
          IDENTIDAD MATRIXFLOW
          ==================================================== */}

      <div
        className={`
          flex
          shrink-0
          items-center

          transition-all
          duration-[650ms]
          ease-in-out

          ${isLoggingOut
            ? `
                h-28
                border-transparent
                px-12
              `
            : `
                h-20
                border-b
                border-slate-300/80
                dark:border-white/10
                px-5
              `
          }
        `}
      >
        <div
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center

            rounded-xl

            bg-blue-600
            text-white

            shadow-sm
            shadow-blue-950/40
          "
        >
          <Workflow size={21} />
        </div>


        <div className="ml-3 min-w-0">
          <p
            className="
              truncate
              text-[15px]
              font-bold
              tracking-[0.08em]
              text-slate-900
              dark:text-white
            "
          >
            MATRIXFLOW
          </p>

          <p
            className="
              mt-0.5
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.22em]
              text-slate-500
            dark:text-slate-500
              dark:text-slate-500
            "
          >
            Enterprise
          </p>
        </div>
      </div>


      {/* ====================================================
    NAVEGACIÓN
    ==================================================== */}

      <nav
        className={`
          sidebar-scroll

          min-h-0
          flex-1
          overflow-y-auto

          px-3
          py-5

          transition-all
          duration-200

          ${isLoggingOut
            ? `
                -translate-x-4
                opacity-0
                pointer-events-none
              `
            : `
                translate-x-0
                opacity-100
              `
          }
        `}
      >
        <p
          className="
            mb-2
            px-3

            text-[10px]
            font-semibold
            uppercase
            tracking-[0.18em]
            text-slate-500
          "
        >
          Navegación
        </p>


        <div className="space-y-1">
          {menuItems.map(
            (item) => {
              // No mostramos opciones que el rol
              // actual no puede utilizar.
              if (
                !canView(
                  item.roles,
                )
              ) {
                return null
              }


              // ==============================================
              // MENÚ CON SUBMENÚ
              // ==============================================

              if (item.children) {
                const visibleChildren =
                  item.children.filter(
                    (child) =>
                      canView(
                        child.roles,
                      ),
                  )


                if (
                  visibleChildren.length ===
                  0
                ) {
                  return null
                }


                const isOpen =
                  openMenus[
                  item.name
                  ]

                const hasActive =
                  hasActiveChild(
                    visibleChildren,
                  )


                return (
                  <div
                    key={
                      item.name
                    }
                  >
                    <button
                      type="button"
                      onClick={() =>
                        toggleMenu(
                          item.name,
                        )
                      }
                      className={`
                        group

                        flex
                        w-full
                        items-center
                        justify-between

                        rounded-lg

                        px-3
                        py-2.5

                        text-sm

                        transition-all
                        duration-150

                        ${hasActive
                          ? `
                              bg-blue-100/80
                              font-medium
                              text-blue-800

                              dark:bg-white/[0.06]
                              dark:text-white
                            `
                          : `
                              text-slate-700
                              hover:bg-white/70
                              hover:text-slate-950

                              dark:text-slate-400
                              dark:hover:bg-white/[0.04]
                              dark:hover:text-slate-100
                            `
                        }
                      `}
                    >
                      <span
                        className="
                          flex
                          min-w-0
                          items-center
                          gap-3
                        "
                      >
                        <span
                          className={`
                            flex
                            h-8
                            w-8
                            shrink-0
                            items-center
                            justify-center

                            rounded-lg

                            transition-colors

                            ${hasActive
                              ? `
                                  bg-blue-100
                                  text-blue-700

                                  dark:bg-blue-500/15
                                  dark:text-blue-400
                                `
                              : `
                                  text-slate-500
                          dark:text-slate-600
                                  group-hover:text-slate-900

                                  dark:text-slate-500
                                  dark:group-hover:text-slate-300
                                `
                            }
                          `}
                        >
                          {item.icon}
                        </span>

                        <span className="truncate">
                          {item.name}
                        </span>
                      </span>


                      <ChevronDown
                        size={15}
                        className={`
                          shrink-0
                          text-slate-600

                          transition-transform
                          duration-200

                          ${isOpen
                            ? 'rotate-180'
                            : ''
                          }
                        `}
                      />
                    </button>


                    {/* ========================================
                        SUBMENÚ
                        ======================================== */}

                    <div
                      className={`
                        grid

                        transition-all
                        duration-200
                        ease-out

                        ${isOpen
                          ? `
                              grid-rows-[1fr]
                              opacity-100
                            `
                          : `
                              grid-rows-[0fr]
                              opacity-0
                            `
                        }
                      `}
                    >
                      <div className="overflow-hidden">
                        <div
                          className="
                            relative
                            ml-7
                            mt-1
                            space-y-1

                            border-l
                            border-slate-300
                            dark:border-slate-700

                            pb-1
                            pl-3
                          "
                        >
                          {visibleChildren.map(
                            (
                              child,
                            ) => {
                              const isActive =
                                Boolean(
                                  child.path &&
                                  isPathActive(
                                    child.path,
                                  ),
                                )


                              return (
                                <Link
                                  key={
                                    child.path
                                  }
                                  to={
                                    child.path!
                                  }
                                  className={`
                                    group
                                    relative

                                    flex
                                    items-center
                                    gap-2.5

                                    rounded-lg

                                    px-3
                                    py-2

                                    text-[13px]

                                    transition-all
                                    duration-150

                                    ${isActive
                                      ? `
                                          bg-blue-100/80
                                          font-medium
                                          text-blue-700

                                          dark:bg-blue-500/10
                                          dark:text-blue-300
                                        `
                                      : `
                                          text-slate-600
                                          hover:bg-white/70
                                          hover:text-slate-950

                                          dark:text-slate-500
                                          dark:hover:bg-white/[0.04]
                                          dark:hover:text-slate-200
                                        `
                                    }
                                  `}
                                >
                                  {/* Indicador de la ruta activa. */}
                                  {isActive && (
                                    <span
                                      className="
                                        absolute
                                        -left-[13px]

                                        h-5
                                        w-[2px]

                                        rounded-full
                                        bg-blue-500
                                      "
                                    />
                                  )}


                                  <span
                                    className={`
                                      shrink-0

                                      ${isActive
                                        ? 'text-blue-600 dark:text-blue-400'
                                        : 'text-slate-500 group-hover:text-slate-800 dark:text-slate-600 dark:group-hover:text-slate-400'
                                      }
                                    `}
                                  >
                                    {
                                      child.icon
                                    }
                                  </span>


                                  <span className="truncate">
                                    {
                                      child.name
                                    }
                                  </span>
                                </Link>
                              )
                            },
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }


              // ==============================================
              // ELEMENTO NORMAL
              // ==============================================

              const isActive =
                Boolean(
                  item.path &&
                  isPathActive(
                    item.path,
                  ),
                )


              return (
                <Link
                  key={
                    item.path
                  }
                  to={
                    item.path!
                  }
                  className={`
                    group
                    relative

                    flex
                    items-center
                    gap-3

                    rounded-lg

                    px-3
                    py-2.5

                    text-sm

                    transition-all
                    duration-150

                    ${isActive
                      ? `
                          bg-blue-100/80
                          font-medium
                          text-blue-700

                          dark:bg-blue-500/10
                          dark:text-blue-300
                        `
                      : `
                          text-slate-700
                          hover:bg-white/70
                          hover:text-slate-950

                          dark:text-slate-400
                          dark:hover:bg-white/[0.04]
                          dark:hover:text-slate-100
                        `
                    }
                  `}
                >
                  {/* Barra azul discreta para indicar
                      qué módulo está seleccionado. */}
                  {isActive && (
                    <span
                      className="
                        absolute
                        left-0

                        h-6
                        w-[3px]

                        rounded-full
                        bg-blue-500
                      "
                    />
                  )}


                  <span
                    className={`
                      flex
                      h-8
                      w-8
                      shrink-0
                      items-center
                      justify-center

                      rounded-lg

                      transition-colors

                      ${isActive
                        ? `
                            bg-blue-100
                            text-blue-700

                            dark:bg-blue-500/15
                            dark:text-blue-400
                          `
                        : `
                            text-slate-600
                            group-hover:text-slate-900

                            dark:text-slate-500
                            dark:group-hover:text-slate-300
                          `
                      }
                    `}
                  >
                    {item.icon}
                  </span>


                  <span className="truncate">
                    {item.name}
                  </span>
                </Link>
              )
            },
          )}
        </div>
      </nav>


      {/* ====================================================
          CERRAR SESIÓN
          ====================================================

          La cuenta activa se muestra en el Header.

          El Sidebar mantiene únicamente la acción para
          finalizar la sesión.
          ==================================================== */}

      <div
        className={`
          shrink-0

          border-t
          border-slate-300/80
          dark:border-white/10

          p-3

          transition-all
          duration-200

          ${isLoggingOut
            ? `
                -translate-x-4
                opacity-0
                pointer-events-none
              `
            : `
                translate-x-0
                opacity-100
              `
          }
        `}
      >
        <button
          type="button"
          onClick={onLogout}
          disabled={isLoggingOut}
          className="
            sidebar-logout
            group

            flex
            w-full
            items-center
            gap-3

            rounded-lg

            px-3
            py-2.5

            text-sm
            font-medium
            text-slate-600
            dark:text-slate-400

            transition-all
            duration-150

            hover:bg-red-500/15
            hover:text-red-400

            focus:outline-none
            focus:ring-2
            focus:ring-red-500/30

            disabled:cursor-default
          "
        >
          <span
            className="
              sidebar-logout-icon

              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center

              rounded-lg

              text-slate-500
              dark:text-slate-500

              transition-colors
              duration-150

              group-hover:bg-red-500/15
              group-hover:text-red-400
            "
          >
            <LogOut size={18} />
          </span>

          <span>
            Cerrar sesión
          </span>
        </button>
      </div>

    </aside>
  )
}


export default Sidebar