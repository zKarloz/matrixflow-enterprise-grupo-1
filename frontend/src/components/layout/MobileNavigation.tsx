import {
    useState,
} from 'react'

import {
    Link,
    useLocation,
} from 'react-router-dom'

import {
    ChevronDown,
    LogOut,
    Menu,
    X,
    Workflow,
} from 'lucide-react'

import {
    menuItems,
    type UserRole,
} from './Sidebar'

import {
    getCurrentUser,
} from '../../services/api'


interface MobileNavigationProps {
    // Controla si el menú móvil está desplegado.
    open: boolean

    // Abre o cierra el menú.
    onToggle: () => void

    // Cierra el menú al navegar o tocar el fondo.
    onClose: () => void

    // Reutiliza la misma lógica de cierre de sesión del layout.
    onLogout: () => void

    // Evita acciones repetidas durante la transición de logout.
    isLoggingOut: boolean
}


function MobileNavigation({
    open,
    onToggle,
    onClose,
    onLogout,
    isLoggingOut,
}: MobileNavigationProps) {
    const location = useLocation()

    // Obtenemos el rol almacenado dentro del JWT para mostrar
    // únicamente las opciones permitidas visualmente.
    const currentUser = getCurrentUser()

    const currentRole =
        currentUser?.role as
        | UserRole
        | undefined

    // Los grupos relevantes se abren inicialmente cuando
    // la ruta actual pertenece a ellos.
    const [
        openMenus,
        setOpenMenus,
    ] = useState<Record<string, boolean>>({
        Empresa:
            location.pathname.startsWith(
                '/empresa',
            ),

        'Análisis Matemático':
            location.pathname.startsWith(
                '/analisis-matematico',
            ),
    })


    const canView = (
        roles: UserRole[],
    ) => {
        return Boolean(
            currentRole &&
            roles.includes(currentRole),
        )
    }


    const toggleMenu = (
        name: string,
    ) => {
        setOpenMenus(
            (previous) => ({
                ...previous,
                [name]: !previous[name],
            }),
        )
    }


    const isPathActive = (
        path: string,
    ) => {
        return location.pathname === path
    }


    return (
        <>
            {/* =====================================================
          BARRA SUPERIOR MÓVIL
          ===================================================== */}
            <header
                className="
          fixed
          left-0
          right-0
          top-0
          z-50

          flex
          h-16
          items-center
          justify-between

          border-b
          border-slate-800

          bg-slate-950
          px-4
          text-white

          lg:hidden
        "
            >
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600">
                        <Workflow size={19} />
                    </div>

                    <div className="min-w-0">
                        <p className="truncate text-sm font-bold tracking-wider">
                            MATRIXFLOW
                        </p>

                        <p className="text-[9px] uppercase tracking-[0.2em] text-slate-500">
                            Enterprise
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onToggle}
                    className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center

            rounded-lg
            text-slate-300

            transition-colors
            hover:bg-white/10
            hover:text-white
          "
                    aria-expanded={open}
                    aria-label={
                        open
                            ? 'Cerrar navegación'
                            : 'Abrir navegación'
                    }
                >
                    {open ? (
                        <X size={22} />
                    ) : (
                        <Menu size={22} />
                    )}
                </button>
            </header>


            {/* =====================================================
          MENÚ DESPLEGABLE
          =====================================================

          El menú permanece montado para poder animar
          correctamente tanto la apertura como el cierre.
          ===================================================== */}

            {/* Fondo suave detrás del menú móvil. */}
            <div
                aria-hidden="true"
                onClick={onClose}
                className={`
          fixed
          inset-x-0
          bottom-0
          top-16
          z-30

          bg-slate-950/20
          backdrop-blur-[1px]

          transition-opacity
          duration-300
          ease-out

          lg:hidden

          ${open
                        ? `
                opacity-100
                pointer-events-auto
              `
                        : `
                opacity-0
                pointer-events-none
              `
                    }
        `}
            />

            <div
                className={`
          fixed
          inset-x-0
          bottom-0
          top-16
          z-40

          flex
          flex-col

          bg-slate-950
          text-white

          transition-all
          duration-300
          ease-out

          lg:hidden

          ${open
                        ? `
                translate-y-0
                opacity-100
                pointer-events-auto
              `
                        : `
                -translate-y-4
                opacity-0
                pointer-events-none
              `
                    }
        `}
            >
                {/* La navegación puede desplazarse si todas las
              secciones están expandidas. */}
                <nav className="sidebar-scroll min-h-0 flex-1 overflow-y-auto px-3 py-4">
                    <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                        Navegación
                    </p>

                    <div className="space-y-1">
                        {menuItems.map((item) => {
                            if (!canView(item.roles)) {
                                return null
                            }

                            // =================================================
                            // OPCIÓN CON SUBMENÚ
                            // =================================================
                            if (item.children) {
                                const visibleChildren =
                                    item.children.filter(
                                        (child) =>
                                            canView(child.roles),
                                    )

                                if (
                                    visibleChildren.length === 0
                                ) {
                                    return null
                                }

                                const isOpen =
                                    Boolean(
                                        openMenus[item.name],
                                    )

                                const hasActiveChild =
                                    visibleChildren.some(
                                        (child) =>
                                            Boolean(
                                                child.path &&
                                                isPathActive(
                                                    child.path,
                                                ),
                                            ),
                                    )

                                return (
                                    <div key={item.name}>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                toggleMenu(item.name)
                                            }
                                            className={`
                          flex
                          w-full
                          items-center
                          justify-between

                          rounded-lg
                          px-3
                          py-3

                          text-sm

                          transition-all
                          duration-150

                          active:scale-[0.99]

                          ${hasActiveChild
                                                    ? 'bg-white/[0.06] text-white'
                                                    : 'text-slate-300 hover:bg-white/[0.05]'
                                                }
                        `}
                                        >
                                            <span className="flex min-w-0 items-center gap-3">
                                                <span className="flex h-8 w-8 shrink-0 items-center justify-center text-slate-400">
                                                    {item.icon}
                                                </span>

                                                <span className="truncate">
                                                    {item.name}
                                                </span>
                                            </span>

                                            <ChevronDown
                                                size={16}
                                                className={`
                            shrink-0
                            text-slate-500

                            transition-transform
                            duration-200
                            ease-out

                            ${isOpen
                                                        ? 'rotate-180'
                                                        : 'rotate-0'
                                                    }
                          `}
                                            />
                                        </button>

                                        {/* ==========================================
                          SUBMENÚ ANIMADO
                          ==========================================

                          grid-rows permite animar la altura sin
                          conocerla previamente.
                          ========================================== */}
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
                                                <div className="ml-7 mt-1 space-y-1 border-l border-slate-800 pb-1 pl-3">
                                                    {visibleChildren.map(
                                                        (child) => {
                                                            const isActive =
                                                                Boolean(
                                                                    child.path &&
                                                                    isPathActive(
                                                                        child.path,
                                                                    ),
                                                                )

                                                            return (
                                                                <Link
                                                                    key={child.path}
                                                                    to={child.path!}
                                                                    onClick={onClose}
                                                                    className={`
                                      flex
                                      items-center
                                      gap-2.5

                                      rounded-lg
                                      px-3
                                      py-2.5

                                      text-[13px]

                                      transition-all
                                      duration-150

                                      active:scale-[0.98]

                                      ${isActive
                                                                            ? `
                                            translate-x-1
                                            bg-blue-500/10
                                            font-medium
                                            text-blue-300
                                          `
                                                                            : `
                                            translate-x-0
                                            text-slate-400
                                            hover:translate-x-1
                                            hover:bg-white/[0.04]
                                            hover:text-slate-200
                                          `
                                                                        }
                                    `}
                                                                >
                                                                    <span className="shrink-0">
                                                                        {child.icon}
                                                                    </span>

                                                                    <span className="truncate">
                                                                        {child.name}
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

                            // =================================================
                            // OPCIÓN SIMPLE
                            // =================================================
                            const isActive =
                                Boolean(
                                    item.path &&
                                    isPathActive(item.path),
                                )

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path!}
                                    onClick={onClose}
                                    className={`
                      flex
                      items-center
                      gap-3

                      rounded-lg
                      px-3
                      py-3

                      text-sm

                      transition-all
                      duration-150

                      active:scale-[0.98]

                      ${isActive
                                            ? 'bg-blue-500/10 font-medium text-blue-300'
                                            : 'text-slate-300 hover:bg-white/[0.05] hover:text-white'
                                        }
                    `}
                                >
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center">
                                        {item.icon}
                                    </span>

                                    <span className="truncate">
                                        {item.name}
                                    </span>
                                </Link>
                            )
                        })}
                    </div>
                </nav>


                {/* Cerrar sesión permanece accesible en la parte inferior. */}
                <div className="shrink-0 border-t border-white/5 p-3">
                    <button
                        type="button"
                        onClick={() => {
                            onClose()
                            onLogout()
                        }}
                        disabled={isLoggingOut}
                        className="
                flex
                w-full
                items-center
                gap-3

                rounded-lg
                px-3
                py-3

                text-sm
                font-medium
                text-slate-400

                transition-all
                duration-150

                active:scale-[0.98]

                hover:bg-red-500/10
                hover:text-red-300

                disabled:cursor-default
                disabled:opacity-50
              "
                    >
                        <span className="flex h-8 w-8 items-center justify-center">
                            <LogOut size={18} />
                        </span>

                        <span>
                            Cerrar sesión
                        </span>
                    </button>
                </div>
            </div>
        </>
    )
}


export default MobileNavigation
