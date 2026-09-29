// ============================================================
// MatrixFlow Enterprise
// Ruta protegida de autenticación y autorización
// ============================================================
//
// Este componente realiza dos comprobaciones:
//
// 1. Comprueba que exista un JWT válido en localStorage.
// 2. Comprueba que el rol del usuario tenga permiso para
//    acceder a la ruta solicitada.
//
// Importante:
// El frontend solamente controla el acceso visual y de navegación.
// La seguridad real continúa siendo responsabilidad del backend.
// ============================================================

import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

// Función que obtiene el usuario y su rol desde el JWT.
import { getCurrentUser } from '../../services/api'

// ============================================================
// TIPOS
// ============================================================

// Roles disponibles en MatrixFlow Enterprise.
type UserRole = 'Administrador' | 'Analista' | 'Consulta'

// ============================================================
// PROPIEDADES
// ============================================================

interface ProtectedRouteProps {
    // Página o componente que queremos proteger.
    children: ReactNode

    // Roles autorizados para acceder a la ruta.
    //
    // Si no se especifica este valor, solamente se comprueba
    // que el usuario esté autenticado.
    allowedRoles?: UserRole[]
}

// ============================================================
// COMPONENTE
// ============================================================

function ProtectedRoute({
    children,
    allowedRoles,
}: ProtectedRouteProps) {

    // Buscamos el JWT guardado después del inicio de sesión.
    const token = localStorage.getItem(
        'matrixflow-access-token'
    )

    // --------------------------------------------------------
    // COMPROBACIÓN 1: AUTENTICACIÓN
    // --------------------------------------------------------

    // Si no existe el JWT, el usuario no está autenticado.
    if (!token) {
        // Lo enviamos al formulario de Login.
        return (
            <Navigate
                to="/login"
                replace
            />
        )
    }

    // --------------------------------------------------------
    // COMPROBACIÓN 2: AUTORIZACIÓN
    // --------------------------------------------------------

    // Obtenemos la información del usuario desde el JWT.
    const currentUser = getCurrentUser()

    // Si no podemos obtener correctamente el usuario o su rol,
    // eliminamos la sesión y volvemos al Login.
    if (!currentUser) {
        localStorage.removeItem('matrixflow-access-token')
        localStorage.removeItem('matrixflow-token-type')

        return (
            <Navigate
                to="/login"
                replace
            />
        )
    }

    // Si la ruta no define roles específicos,
    // cualquier usuario autenticado puede acceder.
    if (!allowedRoles || allowedRoles.length === 0) {
        return <>{children}</>
    }

    // Comprobamos si el rol actual está autorizado.
    const hasPermission = allowedRoles.includes(
        currentUser.role as UserRole
    )

    // Si el usuario está autenticado pero no tiene permiso,
    // lo enviamos al Dashboard.
    if (!hasPermission) {
        return (
            <Navigate
                to="/"
                replace
            />
        )
    }

    // El usuario está autenticado y autorizado.
    return <>{children}</>
}

// Exportamos el componente para utilizarlo en App.tsx.
export default ProtectedRoute