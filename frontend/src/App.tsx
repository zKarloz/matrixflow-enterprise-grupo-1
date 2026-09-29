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
// 5. Mantener la configuración del modo oscuro.
// 6. Comprobar la conexión con FastAPI.
// ============================================================

import { useEffect, useState, type ReactNode } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom'

// Función utilizada para comprobar la conexión con FastAPI.
import { checkBackend } from './services/api'

// Componente encargado de proteger las rutas privadas.
import ProtectedRoute from './components/auth/ProtectedRoute'

// Componentes principales del diseño.
import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'

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
// RUTA PROTEGIDA POR ROL
// ============================================================
//
// Este componente complementa a ProtectedRoute.
//
// ProtectedRoute comprueba que exista una sesión.
// RoleProtectedRoute comprueba además que el usuario tenga
// uno de los roles autorizados para la página.
//
// El backend continúa siendo la autoridad definitiva.
// ============================================================

type UserRole = 'Administrador' | 'Analista' | 'Consulta'

interface RoleProtectedRouteProps {
  // Página que queremos proteger.
  children: ReactNode

  // Roles que pueden acceder a la página.
  allowedRoles: UserRole[]
}

function RoleProtectedRoute({
  children,
  allowedRoles,
}: RoleProtectedRouteProps) {

  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      {children}
    </ProtectedRoute>
  )
}

// ============================================================
// PROPIEDADES DEL LAYOUT PRINCIPAL
// ============================================================

interface AppLayoutProps {
  // Indica si el modo oscuro está activado.
  darkMode: boolean

  // Permite cambiar el estado del modo oscuro.
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>
}


// ============================================================
// LAYOUT PRINCIPAL
// ============================================================
//
// Contiene los elementos visuales comunes de las páginas
// internas:
//
// - Sidebar
// - Header
// - Contenido de cada módulo
//
// La autenticación se controla mediante ProtectedRoute.
// ============================================================

function AppLayout({
  darkMode,
  setDarkMode,
}: AppLayoutProps) {

  return (
    <div
      className={`min-h-screen transition-colors ${darkMode
        ? 'bg-slate-950 text-slate-100'
        : 'bg-slate-50 text-slate-900'
        }`}
    >

      {/* Menú lateral principal. */}
      <Sidebar />

      {/* Barra superior. */}
      <Header />

      {/* Contenido principal. */}
      <main className="ml-64 pt-20">

        <div className="p-8">

          <Routes>

            {/* ==================================================
                DASHBOARD
                ==================================================
      
            Los tres roles pueden visualizar el Dashboard.
            */}
            <Route
              path="/"
              element={<Dashboard />}
            />


            {/* ==================================================
                EMPRESA
                ==================================================
      
                Estas funciones corresponden exclusivamente
                al Administrador.
            */}

            <Route
              path="/empresa"
              element={
                <RoleProtectedRoute
                  allowedRoles={['Administrador']}
                >
                  <Empresa />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/empresa/sucursales"
              element={
                <RoleProtectedRoute
                  allowedRoles={['Administrador']}
                >
                  <Sucursales />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/empresa/productos"
              element={
                <RoleProtectedRoute
                  allowedRoles={['Administrador']}
                >
                  <Productos />
                </RoleProtectedRoute>
              }
            />


            {/* ==================================================
                VENTAS
                ==================================================
                
                Administrador y Analista pueden trabajar con ventas.
            */}

            <Route
              path="/ventas"
              element={
                <RoleProtectedRoute
                  allowedRoles={['Administrador', 'Analista']}
                >
                  <Ventas />
                </RoleProtectedRoute>
              }
            />


            {/* ==================================================
                INVENTARIO
                ==================================================
                
                Administrador y Analista pueden trabajar con inventario.
            */}

            <Route
              path="/inventario"
              element={
                <RoleProtectedRoute
                  allowedRoles={['Administrador', 'Analista']}
                >
                  <Inventario />
                </RoleProtectedRoute>
              }
            />


            {/* ==================================================
                ANÁLISIS MATEMÁTICO
                ==================================================
                
                Administrador y Analista pueden utilizar las
                herramientas matemáticas.
            */}

            <Route
              path="/analisis-matematico"
              element={
                <RoleProtectedRoute
                  allowedRoles={['Administrador', 'Analista']}
                >
                  <Vectores />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/analisis-matematico/vectores"
              element={
                <RoleProtectedRoute
                  allowedRoles={['Administrador', 'Analista']}
                >
                  <Vectores />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/analisis-matematico/matrices"
              element={
                <RoleProtectedRoute
                  allowedRoles={['Administrador', 'Analista']}
                >
                  <Matrices />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/analisis-matematico/operaciones"
              element={
                <RoleProtectedRoute
                  allowedRoles={['Administrador', 'Analista']}
                >
                  <Operaciones />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/analisis-matematico/combinaciones-lineales"
              element={
                <RoleProtectedRoute
                  allowedRoles={['Administrador', 'Analista']}
                >
                  <CombinacionesLineales />
                </RoleProtectedRoute>
              }
            />


            {/* ==================================================
                HISTORIAL
                ==================================================
                
                El historial corresponde a la trazabilidad de las
                operaciones realizadas por los usuarios autorizados.
            */}

            <Route
              path="/historial"
              element={
                <RoleProtectedRoute
                  allowedRoles={['Administrador', 'Analista']}
                >
                  <Historial />
                </RoleProtectedRoute>
              }
            />


            {/* ==================================================
                REPORTES
                ==================================================
                
                Los tres roles pueden consultar los reportes
                autorizados.
            */}

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
                ==================================================
                
                Exclusivo del Administrador.
            */}

            <Route
              path="/usuarios"
              element={
                <RoleProtectedRoute
                  allowedRoles={['Administrador']}
                >
                  <Usuarios />
                </RoleProtectedRoute>
              }
            />


            {/* ==================================================
                SEGURIDAD Y ACCESOS
                ==================================================
                
                Exclusivo del Administrador.
            */}

            <Route
              path="/seguridad"
              element={
                <RoleProtectedRoute
                  allowedRoles={['Administrador']}
                >
                  <Seguridad />
                </RoleProtectedRoute>
              }
            />


            {/* ==================================================
                CONFIGURACIÓN
                ==================================================
                
                Exclusivo del Administrador.
            */}

            <Route
              path="/configuracion"
              element={
                <RoleProtectedRoute
                  allowedRoles={['Administrador']}
                >
                  <Configuracion
                    darkMode={darkMode}
                    setDarkMode={setDarkMode}
                  />
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
  // CONEXIÓN CON EL BACKEND
  // ==========================================================

  useEffect(() => {

    // Comprobamos que FastAPI esté funcionando.
    checkBackend()

      .then((data) => {

        // Mostramos la respuesta del backend en consola.
        console.log(
          'Backend conectado correctamente:',
          data
        )
      })

      .catch((error) => {

        // Mostramos el error si FastAPI no responde.
        console.error(
          'Error conectando con el backend:',
          error
        )
      })

  }, [])


  // ==========================================================
  // MODO OSCURO
  // ==========================================================

  // Recuperamos la preferencia guardada anteriormente.
  const [darkMode, setDarkMode] = useState(() => {

    return (
      localStorage.getItem(
        'matrixflow-dark-mode'
      ) === 'true'
    )
  })


  // Aplicamos el modo oscuro al documento.
  useEffect(() => {

    document.documentElement.classList.toggle(
      'dark',
      darkMode
    )

    // Guardamos la preferencia para futuras visitas.
    localStorage.setItem(
      'matrixflow-dark-mode',
      String(darkMode)
    )

  }, [darkMode])


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

            El usuario puede entrar al Login aunque no tenga
            un JWT guardado.
        */}

        <Route
          path="/login"
          element={<Login />}
        />


        {/* ====================================================
            APLICACIÓN PROTEGIDA
            ====================================================

            Todas las demás rutas pasan por ProtectedRoute.

            Si existe JWT:
                → se muestra la aplicación.

            Si no existe JWT:
                → se redirige automáticamente a /login.
        */}

        <Route
          path="*"
          element={
            <ProtectedRoute>

              <AppLayout
                darkMode={darkMode}
                setDarkMode={setDarkMode}
              />

            </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>
  )
}


// Exportamos el componente principal.
export default App
