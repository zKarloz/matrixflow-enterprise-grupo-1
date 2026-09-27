import { useMemo, useState } from 'react'

interface Report {
  id: number
  name: string
  type: string
  period: string
  records: number
  status: 'Generado' | 'Pendiente'
}

const initialReports: Report[] = [
  {
    id: 1,
    name: 'Reporte de ventas',
    type: 'Ventas',
    period: 'Septiembre 2026',
    records: 125,
    status: 'Generado',
  },
  {
    id: 2,
    name: 'Reporte de inventario',
    type: 'Inventario',
    period: 'Septiembre 2026',
    records: 86,
    status: 'Generado',
  },
  {
    id: 3,
    name: 'Reporte de productos',
    type: 'Productos',
    period: 'Septiembre 2026',
    records: 64,
    status: 'Generado',
  },
  {
    id: 4,
    name: 'Reporte de sucursales',
    type: 'Sucursales',
    period: 'Septiembre 2026',
    records: 12,
    status: 'Pendiente',
  },
]

function Reportes() {
  const [reports, setReports] = useState<Report[]>(initialReports)

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('Todos')

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesSearch =
        `${report.name} ${report.type} ${report.period}`
          .toLowerCase()
          .includes(search.toLowerCase())

      const matchesType =
        typeFilter === 'Todos' ||
        report.type === typeFilter

      return matchesSearch && matchesType
    })
  }, [reports, search, typeFilter])

  const generatedReports = reports.filter(
    (report) => report.status === 'Generado',
  ).length

  const totalRecords = reports.reduce(
    (total, report) => total + report.records,
    0,
  )

  const generateReport = (id: number) => {
    setReports((currentReports) =>
      currentReports.map((report) =>
        report.id === id
          ? {
              ...report,
              status: 'Generado',
            }
          : report,
      ),
    )
  }

  return (
    <div>

      {/* Encabezado */}

      <div className="mb-8">

        <h1 className="text-3xl font-bold text-slate-900">
          Reportes
        </h1>

        <p className="mt-2 text-slate-500">
          Consulta y gestión de reportes de MatrixFlow.
        </p>

      </div>

      {/* Resumen */}

      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-3">

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Reportes disponibles
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {reports.length}
          </p>

        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Reportes generados
          </p>

          <p className="mt-2 text-2xl font-bold text-green-600">
            {generatedReports}
          </p>

        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Registros procesados
          </p>

          <p className="mt-2 text-2xl font-bold text-blue-600">
            {totalRecords}
          </p>

        </div>

      </div>

      {/* Filtros */}

      <div className="mb-6 flex flex-col gap-3 md:flex-row">

        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar reporte..."
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 md:max-w-md"
        />

        <select
          value={typeFilter}
          onChange={(event) =>
            setTypeFilter(event.target.value)
          }
          className="rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
        >
          <option>Todos</option>
          <option>Ventas</option>
          <option>Inventario</option>
          <option>Productos</option>
          <option>Sucursales</option>
        </select>

      </div>

      {/* Tabla */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead className="border-b bg-slate-50">

              <tr>

                <th className="px-6 py-4 text-sm font-semibold">
                  Reporte
                </th>

                <th className="px-6 py-4 text-sm font-semibold">
                  Tipo
                </th>

                <th className="px-6 py-4 text-sm font-semibold">
                  Período
                </th>

                <th className="px-6 py-4 text-sm font-semibold">
                  Registros
                </th>

                <th className="px-6 py-4 text-sm font-semibold">
                  Estado
                </th>

                <th className="px-6 py-4 text-sm font-semibold">
                  Acción
                </th>

              </tr>

            </thead>

            <tbody className="divide-y">

              {filteredReports.map((report) => (

                <tr
                  key={report.id}
                  className="hover:bg-slate-50"
                >

                  <td className="px-6 py-4 font-medium text-slate-800">
                    {report.name}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {report.type}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {report.period}
                  </td>

                  <td className="px-6 py-4 text-sm">
                    {report.records}
                  </td>

                  <td className="px-6 py-4">

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        report.status === 'Generado'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {report.status}
                    </span>

                  </td>

                  <td className="px-6 py-4">

                    <button
                      type="button"
                      onClick={() =>
                        generateReport(report.id)
                      }
                      className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700"
                    >
                      Generar
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

          {filteredReports.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              No se encontraron reportes.
            </div>
          )}

        </div>

      </div>

    </div>
  )
}

export default Reportes