import CompanyInfoCard from '../components/company/CompanyInfoCard'
import { companyData } from '../data/company'

function Empresa() {
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

      {/* Información principal */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

        <h2 className="text-xl font-semibold text-slate-900">
          {companyData.name}
        </h2>

        <p className="mt-2 max-w-3xl text-slate-500">
          {companyData.description}
        </p>

      </div>

      {/* Datos */}
      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

        <CompanyInfoCard
          label="RUC"
          value={companyData.ruc}
        />

        <CompanyInfoCard
          label="Sector"
          value={companyData.sector}
        />

        <CompanyInfoCard
          label="Teléfono"
          value={companyData.phone}
        />

        <CompanyInfoCard
          label="Correo electrónico"
          value={companyData.email}
        />

        <CompanyInfoCard
          label="Dirección"
          value={companyData.address}
        />

      </div>

    </div>
  )
}

export default Empresa