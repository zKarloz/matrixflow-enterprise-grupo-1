import { useEffect, useState } from 'react'

// Importamos la función que obtiene las ventas reales.
import { getSales } from '../../services/api'

// Importamos Sale únicamente como tipo de TypeScript.
import type { Sale } from '../../services/api'

// Representa una actividad generada a partir de una venta real.
interface Activity {
  id: number
  title: string
  description: string
  time: string
}

function getRelativeTime(dateString: string): string {
  // Convertimos la fecha enviada por el backend a Date.
  const date = new Date(dateString)

  // Si la fecha no es válida, mostramos una referencia neutra.
  if (Number.isNaN(date.getTime())) {
    return 'Fecha no disponible'
  }

  // Calculamos cuántos segundos han pasado desde la venta.
  const differenceInSeconds = Math.max(
    0,
    Math.floor((Date.now() - date.getTime()) / 1000),
  )

  // Convertimos el tiempo transcurrido a unidades legibles.
  if (differenceInSeconds < 60) {
    return 'Hace unos segundos'
  }

  const minutes = Math.floor(differenceInSeconds / 60)

  if (minutes < 60) {
    return `Hace ${minutes} minuto${minutes === 1 ? '' : 's'}`
  }

  const hours = Math.floor(minutes / 60)

  if (hours < 24) {
    return `Hace ${hours} hora${hours === 1 ? '' : 's'}`
  }

  const days = Math.floor(hours / 24)

  return `Hace ${days} día${days === 1 ? '' : 's'}`
}

function RecentActivity() {
  // Guardamos las actividades obtenidas desde las ventas reales.
  const [activities, setActivities] = useState<Activity[]>([])

  // Controlamos la carga de información.
  const [loading, setLoading] = useState(true)

  // Guardamos el mensaje de error de la petición.
  const [error, setError] = useState('')

  useEffect(() => {
    // Cargamos las ventas recientes cuando se monta el componente.
    async function loadRecentSales() {
      try {
        setLoading(true)
        setError('')

        // Consultamos las ventas reales del backend.
        const sales: Sale[] = await getSales()

        // Ordenamos las ventas desde la más reciente hasta la más antigua.
        const recentSales = [...sales]
          .sort(
            (firstSale, secondSale) =>
              new Date(secondSale.created_at).getTime() -
              new Date(firstSale.created_at).getTime(),
          )
          .slice(0, 5)

        // Transformamos las ventas al formato utilizado por la interfaz.
        const recentActivities: Activity[] = recentSales.map((sale) => ({
          id: sale.id,
          title: 'Nueva venta registrada',
          description: `Venta #${sale.id} · S/ ${Number(
            sale.total,
          ).toLocaleString('es-PE', {
            minimumFractionDigits: 2,
          })} · Sucursal ${sale.branch_id}`,
          time: getRelativeTime(sale.created_at),
        }))

        setActivities(recentActivities)
      } catch (requestError) {
        // Mostramos el error real en lugar de utilizar actividades ficticias.
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'No se pudieron cargar las actividades recientes.',
        )
      } finally {
        // Finalizamos el estado de carga.
        setLoading(false)
      }
    }

    loadRecentSales()
  }, [])

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900">
          Actividad reciente
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Últimas ventas registradas en MatrixFlow.
        </p>
      </div>

      {/* Mostramos el estado de carga mientras consultamos FastAPI. */}
      {loading && (
        <div className="py-8 text-center text-sm text-slate-500">
          Cargando actividad reciente...
        </div>
      )}

      {/* Mostramos el error si la petición falla. */}
      {!loading && error && (
        <div className="py-8 text-center text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Mostramos un mensaje cuando todavía no existen ventas. */}
      {!loading && !error && activities.length === 0 && (
        <div className="py-8 text-center text-sm text-slate-500">
          No hay ventas registradas.
        </div>
      )}

      {/* Renderizamos únicamente las actividades construidas
          a partir de ventas reales. */}
      {!loading && !error && activities.length > 0 && (
        <div className="space-y-5">

          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-4"
            >
              {/* Indicador visual de una venta. */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">
                S
              </div>

              <div className="min-w-0 flex-1">

                <div className="flex flex-col justify-between gap-1 sm:flex-row">

                  <h3 className="font-medium text-slate-900">
                    {activity.title}
                  </h3>

                  <span className="text-xs text-slate-400">
                    {activity.time}
                  </span>

                </div>

                <p className="mt-1 text-sm text-slate-500">
                  {activity.description}
                </p>

              </div>
            </div>
          ))}

        </div>
      )}

    </div>
  )
}

export default RecentActivity