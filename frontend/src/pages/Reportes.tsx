import { useEffect, useState } from 'react'

// Importamos la función que consulta los reportes reales.
import { getReports } from '../services/api'

// Importamos el tipo únicamente para TypeScript.
import type { ReportsResponse } from '../services/api'

function Reportes() {
  // Guardamos la respuesta real de los reportes.
  const [reports, setReports] = useState<ReportsResponse | null>(null)

  // Controlamos el estado de carga de la página.
  const [loading, setLoading] = useState(true)

  // Guardamos cualquier error producido durante la consulta.
  const [error, setError] = useState<string | null>(null)

  // Consultamos los reportes cuando se carga la página.
  useEffect(() => {
    async function loadReports() {
      try {
        setLoading(true)
        setError(null)

        // Obtenemos los datos reales mediante el servicio existente.
        const data = await getReports()

        // Guardamos la información recibida.
        setReports(data)
      } catch (err) {
        // Mostramos un mensaje amigable si ocurre un problema.
        setError(
          err instanceof Error
            ? err.message
            : 'Ocurrió un error al obtener los reportes.'
        )
      } finally {
        // Finalizamos el estado de carga.
        setLoading(false)
      }
    }

    loadReports()
  }, [])

  // Calculamos métricas únicamente a partir de los datos reales.
  const totalSales =
    reports?.sales.reduce((sum, sale) => sum + sale.total, 0) ?? 0

  const totalInventoryUnits =
    reports?.inventory.reduce((sum, item) => sum + item.stock, 0) ?? 0

  // Mostramos un estado visual mientras se cargan los datos.
  if (loading) {
    return (
      <div className="min-h-full bg-slate-50 p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Skeleton del encabezado. */}
          <div className="space-y-2">
            <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
            <div className="h-4 w-72 animate-pulse rounded bg-slate-200" />
          </div>

          {/* Skeleton de las tarjetas principales. */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-28 animate-pulse rounded-xl border border-slate-200 bg-white" />
            <div className="h-28 animate-pulse rounded-xl border border-slate-200 bg-white" />
          </div>

          {/* Skeleton de las tablas. */}
          <div className="h-72 animate-pulse rounded-xl border border-slate-200 bg-white" />
          <div className="h-72 animate-pulse rounded-xl border border-slate-200 bg-white" />
        </div>
      </div>
    )
  }

  // Mostramos el error dentro de una tarjeta empresarial.
  if (error) {
    return (
      <div className="min-h-full bg-slate-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-xl border border-red-200 bg-white p-6 shadow-sm">
            {/* Título del estado de error. */}
            <h1 className="text-lg font-semibold text-slate-900">
              No se pudieron cargar los reportes
            </h1>

            {/* Mensaje descriptivo del error. */}
            <p className="mt-2 text-sm text-red-600">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  // Verificamos que exista información antes de mostrarla.
  if (!reports) {
    return (
      <div className="min-h-full bg-slate-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              No hay información disponible.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Encabezado principal de la sección. */}
        <div>
          <p className="text-sm font-medium text-slate-500">
            Análisis empresarial
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Reportes
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Consulta consolidada de ventas e inventario.
          </p>
        </div>

        {/* Resumen general de los datos disponibles. */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Resumen de ventas. */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total de ventas
            </p>

            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              S/ {totalSales.toFixed(2)}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              {reports.sales.length}{' '}
              {reports.sales.length === 1 ? 'registro' : 'registros'}
            </p>
          </div>

          {/* Resumen de unidades existentes en inventario. */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Unidades en inventario
            </p>

            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              {totalInventoryUnits}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              {reports.inventory.length}{' '}
              {reports.inventory.length === 1 ? 'registro' : 'registros'}
            </p>
          </div>
        </div>

        {/* ============================================================
            REPORTE DE VENTAS
            ============================================================ */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {/* Encabezado de la sección. */}
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Ventas
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Detalle de las operaciones registradas.
            </p>
          </div>

          {/* Contenedor responsive para la tabla. */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    ID
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Empresa
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Sucursal
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Usuario
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Total
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Fecha
                  </th>
                </tr>
              </thead>

              <tbody>
                {reports.sales.map((sale) => (
                  <tr
                    key={sale.id}
                    className="border-b border-slate-100 transition-colors last:border-b-0 hover:bg-slate-50"
                  >
                    <td className="px-5 py-4 text-sm font-medium text-slate-900">
                      #{sale.id}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {sale.company_id}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {sale.branch_id}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {sale.user_id}
                    </td>

                    <td className="px-5 py-4 text-right text-sm font-semibold text-slate-900">
                      S/ {sale.total.toFixed(2)}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-500">
                      {new Date(sale.created_at).toLocaleString('es-PE')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ============================================================
            REPORTE DE INVENTARIO
            ============================================================ */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {/* Encabezado de la sección. */}
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Inventario
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Existencias y costos registrados por producto.
            </p>
          </div>

          {/* Contenedor responsive para la tabla. */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    ID
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Sucursal
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Producto
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Stock
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Stock mínimo
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Costo unitario
                  </th>
                </tr>
              </thead>

              <tbody>
                {reports.inventory.map((item) => {
                  // Identificamos si el producto se encuentra en stock bajo.
                  const lowStock = item.stock <= item.minimum_stock

                  return (
                    <tr
                      key={item.id}
                      className="border-b border-slate-100 transition-colors last:border-b-0 hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 text-sm font-medium text-slate-900">
                        #{item.id}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {item.branch_id}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {item.product_id}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <span
                          className={
                            lowStock
                              ? 'inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700'
                              : 'text-sm font-medium text-slate-700'
                          }
                        >
                          {item.stock}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right text-sm text-slate-600">
                        {item.minimum_stock}
                      </td>

                      <td className="px-5 py-4 text-right text-sm font-medium text-slate-700">
                        {item.unit_cost !== null
                          ? `S/ ${item.unit_cost.toFixed(2)}`
                          : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Reportes