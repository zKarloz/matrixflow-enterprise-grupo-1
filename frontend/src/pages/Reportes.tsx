import { useEffect, useState } from 'react'

// Importamos la función que consulta los reportes reales.
import { getReports } from '../services/api'

// Importamos el tipo únicamente para TypeScript.
import type { ReportsResponse } from '../services/api'

function Reportes() {
  // Guardamos la respuesta real del backend.
  const [reports, setReports] = useState<ReportsResponse | null>(null)

  // Controlamos el estado de carga.
  const [loading, setLoading] = useState(true)

  // Guardamos cualquier error producido durante la consulta.
  const [error, setError] = useState<string | null>(null)

  // Consultamos los reportes cuando se carga la página.
  useEffect(() => {
    async function loadReports() {
      try {
        setLoading(true)
        setError(null)

        // Obtenemos los datos reales desde FastAPI.
        const data = await getReports()

        setReports(data)
      } catch (err) {
        // Mostramos el mensaje recibido desde el backend.
        setError(
          err instanceof Error
            ? err.message
            : 'Ocurrió un error al obtener los reportes.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadReports()
  }, [])

  // Mostramos un mensaje mientras esperamos la respuesta.
  if (loading) {
    return <div className="p-6">Cargando reportes...</div>
  }

  // Mostramos el error si la consulta falla.
  if (error) {
    return (
      <div className="p-6 text-red-600">
        Error: {error}
      </div>
    )
  }

  // Verificamos que exista información antes de mostrarla.
  if (!reports) {
    return <div className="p-6">No hay información disponible.</div>
  }

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold">Reportes</h1>

        <p className="mt-2 text-gray-600">
          Información obtenida desde FastAPI y PostgreSQL.
        </p>
      </div>

      {/* Reporte de ventas */}
      <section>
        <h2 className="mb-4 text-2xl font-semibold">
          Ventas
        </h2>

        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Empresa</th>
                <th className="p-3 text-left">Sucursal</th>
                <th className="p-3 text-left">Usuario</th>
                <th className="p-3 text-left">Total</th>
                <th className="p-3 text-left">Fecha</th>
              </tr>
            </thead>

            <tbody>
              {reports.sales.map((sale) => (
                <tr key={sale.id} className="border-b">
                  <td className="p-3">{sale.id}</td>
                  <td className="p-3">{sale.company_id}</td>
                  <td className="p-3">{sale.branch_id}</td>
                  <td className="p-3">{sale.user_id}</td>
                  <td className="p-3">
                    S/ {sale.total.toFixed(2)}
                  </td>
                  <td className="p-3">
                    {new Date(sale.created_at).toLocaleString('es-PE')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Reporte de inventario */}
      <section>
        <h2 className="mb-4 text-2xl font-semibold">
          Inventario
        </h2>

        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Sucursal</th>
                <th className="p-3 text-left">Producto</th>
                <th className="p-3 text-left">Stock</th>
                <th className="p-3 text-left">Stock mínimo</th>
                <th className="p-3 text-left">Costo unitario</th>
              </tr>
            </thead>

            <tbody>
              {reports.inventory.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="p-3">{item.id}</td>
                  <td className="p-3">{item.branch_id}</td>
                  <td className="p-3">{item.product_id}</td>
                  <td className="p-3">{item.stock}</td>
                  <td className="p-3">{item.minimum_stock}</td>
                  <td className="p-3">
                    {item.unit_cost !== null
                      ? `S/ ${item.unit_cost.toFixed(2)}`
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default Reportes