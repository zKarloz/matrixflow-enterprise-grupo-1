import {
    useEffect,
} from 'react'

import type {
    ReactNode,
} from 'react'

import {
    createPortal,
} from 'react-dom'

// ============================================================
// PROPIEDADES DEL MODAL
// ============================================================

interface ModalProps {
    // Determina si el modal se encuentra visible.
    open: boolean

    // Función utilizada para cerrar el modal.
    onClose: () => void

    // Contenido específico de cada módulo.
    children: ReactNode

    // Permite modificar el ancho máximo según
    // las necesidades de cada formulario.
    panelClassName?: string
}

// ============================================================
// MODAL GLOBAL DE MATRIXFLOW
// ============================================================

function Modal({
    open,
    onClose,
    children,
    panelClassName = 'max-w-2xl',
}: ModalProps) {
    // ==========================================================
    // COMPORTAMIENTO DEL MODAL
    // ==========================================================

    useEffect(() => {
        if (!open) {
            return
        }

        // Guardamos el valor anterior para restaurarlo
        // cuando el modal sea cerrado.
        const previousOverflow =
            document.body.style.overflow

        // Evitamos que la página situada detrás del modal
        // continúe desplazándose.
        document.body.style.overflow = 'hidden'

        function handleKeyDown(
            event: KeyboardEvent,
        ) {
            // Permitimos cerrar el modal utilizando ESC.
            if (event.key === 'Escape') {
                onClose()
            }
        }

        window.addEventListener(
            'keydown',
            handleKeyDown,
        )

        return () => {
            // Restauramos el comportamiento normal
            // de la página al cerrar el modal.
            document.body.style.overflow =
                previousOverflow

            window.removeEventListener(
                'keydown',
                handleKeyDown,
            )
        }
    }, [
        open,
        onClose,
    ])

    // No renderizamos nada cuando está cerrado.
    if (!open) {
        return null
    }

    // ==========================================================
    // PORTAL
    // ==========================================================
    //
    // El modal se monta directamente sobre document.body.
    // De esta forma no puede quedar cortado por el contenido,
    // sidebar, tablas o contenedores con overflow.
    // ==========================================================

    return createPortal(
        <div
            className="
        matrixflow-modal-backdrop

        fixed inset-0 z-[100]
        overflow-y-auto
        bg-slate-950/40
        backdrop-blur-sm
      "
            role="dialog"
            aria-modal="true"
            onMouseDown={onClose}
        >
            {/* Este contenedor ocupa siempre toda la pantalla.
          Si el modal cabe, queda centrado verticalmente.
          Si es muy alto, permite desplazamiento. */}
            <div
                className="
          flex min-h-full
          items-center justify-center
          p-4 sm:p-6
        "
            >
                {/* Contenedor visual del modal. */}
                <div
                    className={`
            matrixflow-modal-panel

            w-full
            ${panelClassName}
            max-h-[calc(100dvh-2rem)]
            overflow-y-auto
            rounded-2xl
            border border-slate-200
            bg-white
            shadow-2xl
          `}
                    onMouseDown={(event) => {
                        // Evitamos cerrar el modal cuando
                        // hacemos clic dentro del formulario.
                        event.stopPropagation()
                    }}
                >
                    {children}
                </div>
            </div>
        </div>,
        document.body,
    )
}

export default Modal