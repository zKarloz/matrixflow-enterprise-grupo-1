// ============================================================
// MatrixFlow Enterprise
// Configuración principal de la aplicación
// ============================================================
//
// Este archivo se encarga de:
//
// 1. Configurar React Router.
// 2. Mostrar el Login como ruta pública.
// 3. Proteger las rutas internas mediante ProtectedRoute.
// 4. Mostrar Sidebar y Header en la aplicación principal.
// 5. Coordinar las transiciones de sesión.
// 6. Comprobar la conexión con FastAPI.
// ============================================================

import {
  useEffect,
  useState,
  type ReactNode,
} from 'react'

import {
  BrowserRouter,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom'

// Función utilizada para comprobar la conexión con FastAPI.
import { checkBackend } from './services/api'

// Componente encargado de proteger las rutas privadas.
import ProtectedRoute from './components/auth/ProtectedRoute'

// Componentes principales del diseño.
import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import MobileNavigation from './components/layout/MobileNavigation'

// Página pública de inicio de sesión.
import Login from './pages/Login'

// Dashboard.
import Dashboard from './pages/Dashboard'

// Módulo Empresa.
import Empresa from './pages/Empresa'
import Sucursales from './pages/Sucursales'
import Productos from './pages/Productos'

// Módulos principales.
import Ventas from './pages/Ventas'
import Inventario from './pages/Inventario'

// Módulo Análisis Matemático.
import Vectores from './pages/Vectores'
import Matrices from './pages/Matrices'
import Operaciones from './pages/Operaciones'
import CombinacionesLineales from './pages/CombinacionesLineales'

// Otros módulos.
import Historial from './pages/Historial'
import Reportes from './pages/Reportes'
import Usuarios from './pages/Usuarios'
import Configuracion from './pages/Configuracion'

// Página de seguridad y consulta de accesos.
import Seguridad from './pages/Seguridad'


// ============================================================
// CONFIGURACIÓN DE TRANSICIONES
// ============================================================

// Debe coincidir con la duración utilizada en Login.tsx.
// De esta manera ambas animaciones se sienten simétricas.
const LOGOUT_ANIMATION_MS = 650

// Clave utilizada para conservar el tema seleccionado
// entre recargas y nuevas sesiones.
const THEME_STORAGE_KEY =
  'matrixflow-theme'


// ============================================================
// RUTA PROTEGIDA POR ROL
// ============================================================
//
// ProtectedRoute comprueba que exista una sesión.
//
// RoleProtectedRoute añade además la comprobación visual
// del rol autorizado.
//
// El backend continúa siendo la autoridad definitiva.
// ============================================================

type UserRole =
  | 'Administrador'
  | 'Analista'
  | 'Consulta'


interface RoleProtectedRouteProps {
  // Página que queremos proteger.
  children: ReactNode

  // Roles autorizados para acceder.
  allowedRoles: UserRole[]
}


function RoleProtectedRoute({
  children,
  allowedRoles,
}: RoleProtectedRouteProps) {
  return (
    <ProtectedRoute
      allowedRoles={allowedRoles}
    >
      {children}
    </ProtectedRoute>
  )
}


// ============================================================
// LAYOUT PRINCIPAL
// ============================================================
//
// Contiene:
//
// - Sidebar.
// - Header.
// - Contenido de cada módulo.
// - Transición visual de cierre de sesión.
//
// Para mejorar la fluidez evitamos animar propiedades que
// obliguen al navegador a recalcular continuamente el layout.
// ============================================================

function AppLayout() {
  // Permite navegar al Login después de finalizar
  // la transición visual.
  const navigate =
    useNavigate()

  // Controla la animación Dashboard -> Login.
  const [
    isLoggingOut,
    setIsLoggingOut,
  ] = useState(false)

  // Controla la navegación desplegable en celulares y tablets.
  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] = useState(false)


  // ==========================================================
  // CERRAR SESIÓN
  // ==========================================================

  function handleLogout() {
    // Evitamos ejecutar dos veces el cierre de sesión
    // si el usuario pulsa repetidamente el botón.
    if (isLoggingOut) {
      return
    }

    // Cerramos la navegación móvil antes de iniciar
    // la transición hacia Login.
    setMobileMenuOpen(false)

    // Primero iniciamos únicamente la transición visual.
    setIsLoggingOut(true)

    // El JWT permanece disponible mientras se ejecuta
    // la animación para que ProtectedRoute no desmonte
    // prematuramente la aplicación.
    window.setTimeout(() => {
      // Eliminamos las credenciales de la sesión.
      localStorage.removeItem(
        'matrixflow-access-token',
      )

      localStorage.removeItem(
        'matrixflow-token-type',
      )

      // Cuando termina la transición mostramos Login.
      navigate('/login', {
        replace: true,
      })
    }, LOGOUT_ANIMATION_MS)
  }


  return (
    <div
      className="
        matrixflow-app
        min-h-screen
        overflow-x-hidden
        bg-slate-50
        text-slate-900
      "
    >

      {/* ====================================================
          PANEL VISUAL DE TRANSICIÓN
          ====================================================

          Este panel se encuentra detrás del Sidebar.

          Normalmente solo son visibles 16rem, exactamente
          el ancho del Sidebar.

          Durante el logout utilizamos clip-path para revelar
          progresivamente el resto del panel oscuro.

          De esta forma evitamos animar width y no forzamos
          un recálculo completo del layout en cada frame.
          ==================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none

          fixed
          inset-y-0
          left-0

          z-35

          hidden
          lg:block

          w-[52.5vw]

          bg-slate-950

          transition-[clip-path]
          duration-[650ms]
          ease-in-out

          motion-reduce:transition-none
        "
        style={{
          clipPath: isLoggingOut
            ? 'inset(0 0 0 0)'
            : 'inset(0 calc(100% - 16rem) 0 0)',

          // Indicamos al navegador que esta propiedad
          // cambiará durante la animación.
          willChange: 'clip-path',
        }}
      />


      {/* ====================================================
          SIDEBAR
          ====================================================

          El Sidebar real conserva su ancho de 256px.

          Su menú desaparece durante el logout mientras
          el panel visual situado detrás se expande.
          ==================================================== */}

      <Sidebar
        isLoggingOut={isLoggingOut}
        onLogout={handleLogout}
      />


      {/* ====================================================
          NAVEGACIÓN MÓVIL
          ==================================================== */}

      <MobileNavigation
        open={mobileMenuOpen}
        onToggle={() =>
          setMobileMenuOpen(
            (previous) => !previous,
          )
        }
        onClose={() =>
          setMobileMenuOpen(false)
        }
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
      />


      {/* ====================================================
          HEADER
          ====================================================

          El Header ya utiliza position: fixed.

          Evitamos aplicar transform a su contenedor porque
          podría alterar el comportamiento de posicionamiento.

          Solamente lo hacemos desaparecer.
          ==================================================== */}

      <div
        className={`
          transition-opacity
          duration-300
          ease-out

          ${isLoggingOut
            ? `
                opacity-0
                pointer-events-none
              `
            : `
                opacity-100
              `
          }
        `}
      >
        <Header />
      </div>


      {/* ====================================================
          CONTENIDO PRINCIPAL
          ====================================================

          El margen izquierdo permanece siempre en 16rem.

          Solamente animamos transform y opacity para evitar
          recalcular todo el layout del Dashboard.
          ==================================================== */}

      <main
        className={`
          pt-16

          lg:ml-64
          lg:pt-20

          transition-[opacity,transform]
          duration-300
          ease-out

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

          motion-reduce:transition-none
        `}
      >
        <div className="p-4 sm:p-6 lg:p-8">

          <Routes>

            {/* ==================================================
                DASHBOARD
                ==================================================

                Los tres roles pueden visualizar el Dashboard.
                ================================================== */}

            <Route
              path="/"
              element={<Dashboard />}
            />


            {/* ==================================================
                EMPRESA
                ==================================================

                Funciones administrativas.
                ================================================== */}

            <Route
              path="/empresa"
              element={
                <RoleProtectedRoute
                  allowedRoles={[
                    'Administrador',
                  ]}
                >
                  <Empresa />
                </RoleProtectedRoute>
              }
            />


            <Route
              path="/empresa/sucursales"
              element={
                <RoleProtectedRoute
                  allowedRoles={[
                    'Administrador',
                  ]}
                >
                  <Sucursales />
                </RoleProtectedRoute>
              }
            />


            <Route
              path="/empresa/productos"
              element={
                <RoleProtectedRoute
                  allowedRoles={[
                    'Administrador',
                  ]}
                >
                  <Productos />
                </RoleProtectedRoute>
              }
            />


            {/* ==================================================
                VENTAS
                ================================================== */}

            <Route
              path="/ventas"
              element={
                <RoleProtectedRoute
                  allowedRoles={[
                    'Administrador',
                    'Analista',
                  ]}
                >
                  <Ventas />
                </RoleProtectedRoute>
              }
            />


            {/* ==================================================
                INVENTARIO
                ================================================== */}

            <Route
              path="/inventario"
              element={
                <RoleProtectedRoute
                  allowedRoles={[
                    'Administrador',
                    'Analista',
                  ]}
                >
                  <Inventario />
                </RoleProtectedRoute>
              }
            />


            {/* ==================================================
                ANÁLISIS MATEMÁTICO
                ================================================== */}

            <Route
              path="/analisis-matematico"
              element={
                <RoleProtectedRoute
                  allowedRoles={[
                    'Administrador',
                    'Analista',
                  ]}
                >
                  <Vectores />
                </RoleProtectedRoute>
              }
            />


            <Route
              path="/analisis-matematico/vectores"
              element={
                <RoleProtectedRoute
                  allowedRoles={[
                    'Administrador',
                    'Analista',
                  ]}
                >
                  <Vectores />
                </RoleProtectedRoute>
              }
            />


            <Route
              path="/analisis-matematico/matrices"
              element={
                <RoleProtectedRoute
                  allowedRoles={[
                    'Administrador',
                    'Analista',
                  ]}
                >
                  <Matrices />
                </RoleProtectedRoute>
              }
            />


            <Route
              path="/analisis-matematico/operaciones"
              element={
                <RoleProtectedRoute
                  allowedRoles={[
                    'Administrador',
                    'Analista',
                  ]}
                >
                  <Operaciones />
                </RoleProtectedRoute>
              }
            />


            <Route
              path="/analisis-matematico/combinaciones-lineales"
              element={
                <RoleProtectedRoute
                  allowedRoles={[
                    'Administrador',
                    'Analista',
                  ]}
                >
                  <CombinacionesLineales />
                </RoleProtectedRoute>
              }
            />


            {/* ==================================================
                HISTORIAL
                ================================================== */}

            <Route
              path="/historial"
              element={
                <RoleProtectedRoute
                  allowedRoles={[
                    'Administrador',
                    'Analista',
                  ]}
                >
                  <Historial />
                </RoleProtectedRoute>
              }
            />


            {/* ==================================================
                REPORTES
                ================================================== */}

            <Route
              path="/reportes"
              element={
                <RoleProtectedRoute
                  allowedRoles={[
                    'Administrador',
                    'Analista',
                    'Consulta',
                  ]}
                >
                  <Reportes />
                </RoleProtectedRoute>
              }
            />


            {/* ==================================================
                USUARIOS
                ================================================== */}

            <Route
              path="/usuarios"
              element={
                <RoleProtectedRoute
                  allowedRoles={[
                    'Administrador',
                  ]}
                >
                  <Usuarios />
                </RoleProtectedRoute>
              }
            />


            {/* ==================================================
                SEGURIDAD Y ACCESOS
                ================================================== */}

            <Route
              path="/seguridad"
              element={
                <RoleProtectedRoute
                  allowedRoles={[
                    'Administrador',
                  ]}
                >
                  <Seguridad />
                </RoleProtectedRoute>
              }
            />


            {/* ==================================================
                CONFIGURACIÓN
                ================================================== */}

            <Route
              path="/configuracion"
              element={
                <RoleProtectedRoute
                  allowedRoles={[
                    'Administrador', 'Analista', 'Consulta',
                  ]}
                >
                  <Configuracion />
                </RoleProtectedRoute>
              }
            />

          </Routes>

        </div>
      </main>

    </div>
  )
}


// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

function App() {

  // ==========================================================
  // TEMA VISUAL
  // ==========================================================

  useEffect(() => {
    // Recuperamos la preferencia local antes de navegar
    // por los módulos autenticados.
    const savedTheme =
      localStorage.getItem(
        THEME_STORAGE_KEY,
      )

    document.documentElement
      .classList
      .toggle(
        'dark',
        savedTheme === 'dark',
      )
  }, [])


  // ==========================================================
  // CONEXIÓN CON EL BACKEND
  // ==========================================================

  useEffect(() => {
    // Comprobamos que FastAPI esté funcionando.
    checkBackend()

      .then((data) => {
        console.log(
          'Backend conectado correctamente:',
          data,
        )
      })

      .catch((error) => {
        console.error(
          'Error conectando con el backend:',
          error,
        )
      })
  }, [])


  // ==========================================================
  // SISTEMA DE RUTAS
  // ==========================================================

  return (
    <BrowserRouter>

      <Routes>

        {/* ====================================================
            LOGIN
            ====================================================

            Esta es la única ruta pública.
            ==================================================== */}

        <Route
          path="/login"
          element={<Login />}
        />


        {/* ====================================================
            APLICACIÓN PROTEGIDA
            ====================================================

            Todas las demás rutas pasan por ProtectedRoute.

            Si existe JWT:
                -> se muestra la aplicación.

            Si no existe JWT:
                -> se redirige automáticamente a /login.
            ==================================================== */}

        <Route
          path="*"
          element={
            <ProtectedRoute>

              <AppLayout />

            </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>
  )
}


// Exportamos el componente principal.
export default App