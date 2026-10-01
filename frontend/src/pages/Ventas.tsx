import { useEffect, useState } from 'react'

// Importamos la función que obtiene las ventas.
import { getSales } from '../services/api'

// Importamos Sale únicamente como tipo de TypeScript.
import type { Sale } from '../services/api'

function Ventas() {
  // Guardamos las ventas obtenidas para mostrarlas en la interfaz.
  const [sales, setSales] = useState<Sale[]>([])

  // Controla el estado visual mientras se cargan los datos.
  const [loading, setLoading] = useState(true)

  // Guarda cualquier error producido durante la consulta.
  const [error, setError] = useState<string | null>(null)

  // ============================================================
  // CARGAR VENTAS
  // ============================================================
  //
  // La consulta se ejecuta una sola vez cuando se monta la página.
  // La lógica de obtención de datos se mantiene sin cambios.
  useEffect(() => {
    const loadSales = async () => {
      try {
        // Activamos el estado de carga.
        setLoading(true)

        // Limpiamos cualquier error anterior.
        setError(null)

        // Obtenemos las ventas disponibles.
        const data = await getSales()

        // Guardamos los resultados en el estado.
        setSales(data)
      } catch (err) {
        // Convertimos el error en un mensaje comprensible.
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

    loadSales()
  }, [])

  // ============================================================
  // INDICADORES
  // ============================================================

  // Calculamos el importe total de las ventas disponibles.
  const totalSales = sales.reduce(
    (sum, sale) => sum + Number(sale.total),
    0,
  )

  // ============================================================
  // ESTADO DE CARGA
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-full bg-slate-50 p-6">
        <div className="mx-auto max-w-7xl">
          {/* Encabezado provisional mientras se cargan los datos. */}
          <div className="mb-8">
            <div className="mb-3 h-4 w-32 animate-pulse rounded bg-slate-200" />
            <div className="h-9 w-40 animate-pulse rounded bg-slate-200" />
          </div>

          {/* Tarjetas provisionales para conservar la estructura visual. */}
          <div className="mb-6 grid gap-4 md:grid-cols-2">
            <div className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white" />
            <div className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white" />
          </div>

          {/* Tabla provisional durante la carga. */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="h-14 animate-pulse bg-slate-100" />

            <div className="space-y-4 p-6">
              {[1, 2, 3].map((row) => (
                <div
                  key={row}
                  className="h-10 animate-pulse rounded bg-slate-100"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================
  // ESTADO DE ERROR
  // ============================================================

  if (error) {
    return (
      <div className="min-h-full bg-slate-50 p-6">
        <div className="mx-auto max-w-7xl">
          {/* Encabezado de la página. */}
          <div className="mb-8">
            <p className="mb-1 text-sm font-medium text-slate-500">
              Gestión comercial
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Ventas
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Consulta y seguimiento de las operaciones comerciales.
            </p>
          </div>

          {/* Mensaje de error presentado como una alerta empresarial. */}
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                !
              </div>

              <div>
                <h2 className="font-semibold text-red-800">
                  No fue posible cargar las ventas
                </h2>

                <p className="mt-1 text-sm text-red-700">
                  {error}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================
  // INTERFAZ PRINCIPAL
  // ============================================================

  return (
    <div className="min-h-full bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Encabezado principal de la sección. */}
        <div className="mb-8">
          <p className="mb-1 text-sm font-medium text-slate-500">
            Gestión comercial
          </p>

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Ventas
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                Consulta y seguimiento de las operaciones comerciales
                registradas.
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================
            RESUMEN COMERCIAL
            ======================================================== */}

        <div className="mb-6 grid gap-4 md:grid-cols-2">
          {/* Indicador del importe acumulado de las ventas. */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total de ventas
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  S/ {totalSales.toFixed(2)}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Importe acumulado
                </p>
              </div>

              {/* Acento visual para identificar el indicador financiero. */}
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                S/
              </div>
            </div>
          </div>

          {/* Indicador del número de operaciones registradas. */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Operaciones registradas
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {sales.length}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Transacciones disponibles
                </p>
              </div>

              {/* Acento visual para identificar el indicador operativo. */}
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                #
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            TABLA DE VENTAS
            ======================================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Encabezado de la tabla. */}
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-base font-semibold text-slate-900">
              Registro de ventas
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Detalle de las operaciones comerciales registradas.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    ID
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Empresa
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Sucursal
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Usuario
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Total
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Fecha
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {sales.map((sale) => (
                  <tr
                    key={sale.id}
                    className="transition-colors hover:bg-slate-50"
                  >
                    {/* Identificador de la venta. */}
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-900">
                        #{sale.id}
                      </span>
                    </td>

                    {/* Identificador de la empresa asociada. */}
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {sale.company_id}
                    </td>

                    {/* Identificador de la sucursal asociada. */}
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {sale.branch_id}
                    </td>

                    {/* Identificador del usuario que registró la venta. */}
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {sale.user_id}
                    </td>

                    {/* Importe de la operación con formato monetario. */}
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-900">
                        S/ {Number(sale.total).toFixed(2)}
                      </span>
                    </td>

                    {/* Fecha formateada para la región de Perú. */}
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(sale.created_at).toLocaleString('es-PE')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Estado vacío cuando no existen registros. */}
            {sales.length === 0 && (
              <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  —
                </div>

                <h3 className="font-semibold text-slate-900">
                  No hay ventas registradas
                </h3>

                <p className="mt-1 max-w-sm text-sm text-slate-500">
                  Cuando existan operaciones comerciales, aparecerán en este
                  registro.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Ventas