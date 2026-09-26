import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'

import Dashboard from './pages/Dashboard'
import Empresa from './pages/Empresa'
import Sucursales from './pages/Sucursales'
import Productos from './pages/Productos'
import Ventas from './pages/Ventas'
import Inventario from './pages/Inventario'
import Vectores from './pages/Vectores'
import Matrices from './pages/Matrices'
import Operaciones from './pages/Operaciones'
import Historial from './pages/Historial'
import Reportes from './pages/Reportes'
import Usuarios from './pages/Usuarios'
import Configuracion from './pages/Configuracion'

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('matrixflow-dark-mode') === 'true'
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)

    localStorage.setItem(
      'matrixflow-dark-mode',
      String(darkMode)
    )
  }, [darkMode])

  return (
    <BrowserRouter>
      <div
        className={`min-h-screen transition-colors ${darkMode
            ? 'bg-slate-950 text-slate-100'
            : 'bg-slate-50 text-slate-900'
          }`}
      >
        <Sidebar />

        <Header />

        <main className="ml-64 pt-20">
          <div className="p-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />

              <Route
                path="/empresa"
                element={<Empresa />}
              />

              <Route
                path="/sucursales"
                element={<Sucursales />}
              />

              <Route
                path="/productos"
                element={<Productos />}
              />

              <Route
                path="/ventas"
                element={<Ventas />}
              />

              <Route
                path="/inventario"
                element={<Inventario />}
              />

              <Route
                path="/vectores"
                element={<Vectores />}
              />

              <Route
                path="/matrices"
                element={<Matrices />}
              />

              <Route
                path="/operaciones"
                element={<Operaciones />}
              />

              <Route
                path="/historial"
                element={<Historial />}
              />

              <Route
                path="/reportes"
                element={<Reportes />}
              />

              <Route
                path="/usuarios"
                element={<Usuarios />}
              />

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