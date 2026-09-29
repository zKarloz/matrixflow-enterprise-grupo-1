import { useEffect, useState } from 'react'
import { getCompanies, type Company } from '../services/api'
import CompanyInfoCard from '../components/company/CompanyInfoCard'

function Empresa() {
  // Guardamos las empresas obtenidas desde FastAPI.
  const [companies, setCompanies] = useState<Company[]>([])

  // Controlamos el estado de carga.
  const [loading, setLoading] = useState(true)

  // Guardamos cualquier error producido durante la consulta.
  const [error, setError] = useState<string | null>(null)

  // ============================================================
  // CONSULTAR EMPRESA REAL
  // ============================================================
  //
  // React
  //   ↓
  // getCompanies()
  //   ↓
  // authenticatedFetch()
  //   ↓
  // JWT
  //   ↓
  // FastAPI
  //   ↓
  // PostgreSQL / Supabase
  //
  // ============================================================

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        // Activamos el estado de carga.
        setLoading(true)

        // Limpiamos errores anteriores.
        setError(null)

        // Consultamos las empresas reales del backend.
        const data = await getCompanies()

        // Guardamos la respuesta en el estado de React.
        setCompanies(data)
      } catch (err) {
        // Convertimos el error en un mensaje legible.
        const message =
          err instanceof Error
            ? err.message
            : 'No se pudo cargar la información de la empresa.'

        setError(message)
      } finally {
        // Finalizamos el estado de carga.
        setLoading(false)
      }
    }

    // Ejecutamos la consulta cuando se monta la página.
    loadCompanies()
  }, [])

  // ============================================================
  // ESTADO DE CARGA
  // ============================================================

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-slate-500">
          Cargando información de la empresa desde el backend...
        </p>
      </div>
    )
  }

  // ============================================================
  // ESTADO DE ERROR
  // ============================================================

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-600">
          Error: {error}
        </p>
      </div>
    )
  }

  // ============================================================
  // SIN EMPRESAS
  // ============================================================

  if (companies.length === 0) {
    return (
      <div className="p-6">
        <h1 className="mb-2 text-3xl font-bold text-slate-900">
          Empresa
        </h1>

        <p className="mb-6 text-slate-500">
          Información general de MatrixFlow Enterprise.
        </p>

        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-slate-500">
            No se encontró información de la empresa en el backend.
          </p>
        </div>
      </div>
    )
  }

  // ============================================================
  // MOSTRAR EMPRESA REAL
  // ============================================================

  // Actualmente utilizamos la primera empresa devuelta
  // por el backend como empresa principal.
  const company = companies[0]

  return (
    <div>

      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Empresa
        </h1>

        <p className="mt-2 text-slate-500">
          Información general de MatrixFlow Enterprise.
        </p>
      </div>

      {/* Información principal obtenida desde FastAPI */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

        <h2 className="text-xl font-semibold text-slate-900">
          {company.name}
        </h2>

        <p className="mt-2 max-w-3xl text-slate-500">
          Información registrada en el sistema.
        </p>

      </div>

      {/* Datos reales de la empresa */}
      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

        <CompanyInfoCard
          label="RUC"
          value={company.tax_id}
        />

        <CompanyInfoCard
          label="Teléfono"
          value={company.phone ?? 'No registrado'}
        />

        <CompanyInfoCard
          label="Correo electrónico"
          value={company.email ?? 'No registrado'}
        />

        <CompanyInfoCard
          label="Dirección"
          value={company.address ?? 'No registrada'}
        />

      </div>

    </div>
  )
}

export default Empresa