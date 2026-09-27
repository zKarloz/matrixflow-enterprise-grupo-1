import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Función utilizada para comprobar la conexión con FastAPI.
import { checkBackend } from './services/api'

import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'

import Dashboard from './pages/Dashboard'

// Módulo Empresa
import Empresa from './pages/Empresa'
import Sucursales from './pages/Sucursales'
import Productos from './pages/Productos'

// Módulos principales
import Ventas from './pages/Ventas'
import Inventario from './pages/Inventario'

// Módulo Análisis Matemático
import Vectores from './pages/Vectores'
import Matrices from './pages/Matrices'
import Operaciones from './pages/Operaciones'
import CombinacionesLineales from './pages/CombinacionesLineales'

// Otros módulos
import Historial from './pages/Historial'
import Reportes from './pages/Reportes'
import Usuarios from './pages/Usuarios'
import Configuracion from './pages/Configuracion'

function App() {
  // ==========================================================
  // CONEXIÓN CON EL BACKEND
  // ==========================================================
  //
  // Cuando se carga la aplicación React, hacemos una petición
  // al endpoint /health de FastAPI.
  //
  // Si el backend responde correctamente, veremos el resultado
  // en la consola del navegador.
  // ==========================================================

  useEffect(() => {
    checkBackend()
      .then((data) => {
        // Mostramos la respuesta enviada por FastAPI.
        console.log(
          'Backend conectado correctamente:',
          data
        )
      })
      .catch((error) => {
        // Mostramos el error si React no puede comunicarse
        // con el backend.
        console.error(
          'Error conectando con el backend:',
          error
        )
      })
  }, [])

  // ==========================================================
  // MODO OSCURO
  // ==========================================================

  // Recuperamos la preferencia de modo oscuro guardada
  // anteriormente en el navegador.
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('matrixflow-dark-mode') === 'true'
  })

  // Aplicamos el modo oscuro al elemento HTML y guardamos
  // la preferencia para futuras visitas.
  useEffect(() => {
    document.documentElement.classList.toggle(
      'dark',
      darkMode
    )

    localStorage.setItem(
      'matrixflow-dark-mode',
      String(darkMode)
    )
  }, [darkMode])

  // ==========================================================
  // INTERFAZ PRINCIPAL
  // ==========================================================

  return (
    <BrowserRouter>
      <div
        className={`min-h-screen transition-colors ${
          darkMode
            ? 'bg-slate-950 text-slate-100'
            : 'bg-slate-50 text-slate-900'
        }`}
      >
        {/* Menú lateral principal */}
        <Sidebar />

        {/* Barra superior */}
        <Header />

        {/* ==================================================
            CONTENIDO PRINCIPAL
            ==================================================
            
            ml-64 deja espacio para el Sidebar.
        */}
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

              {/* Página principal de Empresa */}
              <Route
                path="/empresa"
                element={<Empresa />}
              />

              {/* Sucursales */}
              <Route
                path="/empresa/sucursales"
                element={<Sucursales />}
              />

              {/* Productos */}
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

              {/* Página principal del módulo */}
              <Route
                path="/analisis-matematico"
                element={<Vectores />}
              />

              {/* Vectores */}
              <Route
                path="/analisis-matematico/vectores"
                element={<Vectores />}
              />

              {/* Matrices */}
              <Route
                path="/analisis-matematico/matrices"
                element={<Matrices />}
              />

              {/* Operaciones */}
              <Route
                path="/analisis-matematico/operaciones"
                element={<Operaciones />}
              />

              {/* Combinaciones lineales */}
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
    </BrowserRouter>
  )
}

export default App