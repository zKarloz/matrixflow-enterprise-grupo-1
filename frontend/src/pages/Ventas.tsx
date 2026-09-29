import { useEffect, useState } from 'react'

// Importamos la función que consulta las ventas reales.
import { getSales } from '../services/api'

// Importamos Sale solamente como tipo de TypeScript.
import type { Sale } from '../services/api'

function Ventas() {
  // Guardamos las ventas recibidas desde PostgreSQL.
  const [sales, setSales] = useState<Sale[]>([])

  // Indica si todavía estamos esperando la respuesta
  // del backend.
  const [loading, setLoading] = useState(true)

  // Guarda cualquier error producido durante la consulta.
  const [error, setError] = useState<string | null>(null)

  // ============================================================
  // CONSULTAR VENTAS REALES
  // ============================================================
  //
  // React
  //   ↓
  // getSales()
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
    const loadSales = async () => {
      try {
        // Activamos el estado de carga.
        setLoading(true)

        // Limpiamos errores anteriores.
        setError(null)

        // Consultamos las ventas reales del backend.
        const data = await getSales()

        // Guardamos la respuesta en el estado de React.
        setSales(data)
      } catch (err) {
        // Convertimos el error a un mensaje legible.
        const message =
          err instanceof Error
            ? err.message
            : 'No se pudieron cargar las ventas.'

        setError(message)
      } finally {
        // Finalizamos el estado de carga.
        setLoading(false)
      }
    }

    // Ejecutamos la consulta cuando se monta la página.
    loadSales()
  }, [])

  // ============================================================
  // ESTADO DE CARGA
  // ============================================================

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-slate-500">
          Cargando ventas desde el backend...
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
  // MOSTRAR VENTAS REALES
  // ============================================================

  return (
    <div className="p-6">
      <h1 className="mb-2 text-3xl font-bold text-slate-900">
        Ventas
      </h1>

      <p className="mb-6 text-slate-500">
        Ventas obtenidas desde FastAPI y PostgreSQL.
      </p>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold">
                  ID
                </th>

                <th className="px-6 py-4 text-sm font-semibold">
                  Empresa
                </th>

                <th className="px-6 py-4 text-sm font-semibold">
                  Sucursal
                </th>

                <th className="px-6 py-4 text-sm font-semibold">
                  Usuario
                </th>

                <th className="px-6 py-4 text-sm font-semibold">
                  Total
                </th>

                <th className="px-6 py-4 text-sm font-semibold">
                  Fecha
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {sales.map((sale) => (
                <tr
                  key={sale.id}
                  className="hover:bg-slate-50"
                >
                  <td className="px-6 py-4 font-medium">
                    {sale.id}
                  </td>

                  <td className="px-6 py-4">
                    {sale.company_id}
                  </td>

                  <td className="px-6 py-4">
                    {sale.branch_id}
                  </td>

                  <td className="px-6 py-4">
                    {sale.user_id}
                  </td>

                  <td className="px-6 py-4 font-medium">
                    S/ {Number(sale.total).toFixed(2)}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(
                      sale.created_at
                    ).toLocaleString('es-PE')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {sales.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              No se encontraron ventas en el backend.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Ventas