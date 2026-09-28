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

import { useEffect, useState } from 'react'
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
                ================================================== */}

            <Route
              path="/"
              element={<Dashboard />}
            />


            {/* ==================================================
                EMPRESA
                ================================================== */}

            {/* Página principal de Empresa. */}
            <Route
              path="/empresa"
              element={<Empresa />}
            />

            {/* Gestión de sucursales. */}
            <Route
              path="/empresa/sucursales"
              element={<Sucursales />}
            />

            {/* Gestión de productos. */}
            <Route
              path="/empresa/productos"
              element={<Productos />}
            />


            {/* ==================================================
                VENTAS
                ================================================== */}

            <Route
              path="/ventas"
              element={<Ventas />}
            />


            {/* ==================================================
                INVENTARIO
                ================================================== */}

            <Route
              path="/inventario"
              element={<Inventario />}
            />


            {/* ==================================================
                ANÁLISIS MATEMÁTICO
                ================================================== */}

            {/* Página principal del módulo. */}
            <Route
              path="/analisis-matematico"
              element={<Vectores />}
            />

            {/* Vectores. */}
            <Route
              path="/analisis-matematico/vectores"
              element={<Vectores />}
            />

            {/* Matrices. */}
            <Route
              path="/analisis-matematico/matrices"
              element={<Matrices />}
            />

            {/* Operaciones. */}
            <Route
              path="/analisis-matematico/operaciones"
              element={<Operaciones />}
            />

            {/* Combinaciones lineales. */}
            <Route
              path="/analisis-matematico/combinaciones-lineales"
              element={<CombinacionesLineales />}
            />


            {/* ==================================================
                HISTORIAL
                ================================================== */}

            <Route
              path="/historial"
              element={<Historial />}
            />


            {/* ==================================================
                REPORTES
                ================================================== */}

            <Route
              path="/reportes"
              element={<Reportes />}
            />


            {/* ==================================================
                USUARIOS
                ================================================== */}

            <Route
              path="/usuarios"
              element={<Usuarios />}
            />

            {/* ==================================================
                SEGURIDAD Y ACCESOS
                ================================================== */}

            {/* Página de auditoría y seguridad del sistema. */}
            <Route
              path="/seguridad"
              element={<Seguridad />}
            />

            {/* ==================================================
                CONFIGURACIÓN
                ================================================== */}

            <Route
              path="/configuracion"
              element={
                <Configuracion
                  darkMode={darkMode}
                  setDarkMode={setDarkMode}
                />
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
