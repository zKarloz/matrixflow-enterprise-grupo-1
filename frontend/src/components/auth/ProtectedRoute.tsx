// ============================================================
// MatrixFlow Enterprise
// Ruta protegida de autenticación
// ============================================================
//
// Este componente comprueba si existe un JWT guardado en
// localStorage.
//
// Si existe:
//     → permite acceder a la página solicitada.
//
// Si no existe:
//     → redirige al usuario hacia /login.
// ============================================================

import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

// Propiedades que recibe el componente.
interface ProtectedRouteProps {
    // Página o componente que queremos proteger.
    children: ReactNode
}

// Componente encargado de proteger las rutas privadas.
function ProtectedRoute({
    children,
}: ProtectedRouteProps) {

    // Buscamos el JWT guardado después del inicio de sesión.
    const token = localStorage.getItem(
        'matrixflow-access-token'
    )

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

    // Si existe el JWT, permitimos mostrar la página.
    return <>{children}</>
}

// Exportamos el componente para utilizarlo desde App.tsx.
export default ProtectedRoute