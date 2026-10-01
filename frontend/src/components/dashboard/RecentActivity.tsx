import {
  ShoppingCart,
} from 'lucide-react'

import type {
  DashboardRecentSale,
} from '../../services/api'


interface RecentActivityProps {
  data: DashboardRecentSale[]
}


function getRelativeTime(
  dateString: string,
): string {
  // Convertimos la fecha almacenada por PostgreSQL.
  const date =
    new Date(dateString)

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return 'Fecha no disponible'
  }


  const differenceInSeconds =
    Math.max(
      0,
      Math.floor(
        (
          Date.now() -
          date.getTime()
        ) / 1000,
      ),
    )


  if (
    differenceInSeconds < 60
  ) {
    return 'Hace unos segundos'
  }


  const minutes =
    Math.floor(
      differenceInSeconds / 60,
    )

  if (minutes < 60) {
    return `Hace ${minutes} minuto${minutes === 1
        ? ''
        : 's'
      }`
  }


  const hours =
    Math.floor(
      minutes / 60,
    )

  if (hours < 24) {
    return `Hace ${hours} hora${hours === 1
        ? ''
        : 's'
      }`
  }


  const days =
    Math.floor(
      hours / 24,
    )

  return `Hace ${days} día${days === 1
      ? ''
      : 's'
    }`
}


function RecentActivity({
  data,
}: RecentActivityProps) {
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


      {data.length === 0 ? (
        <div className="py-8 text-center text-sm text-slate-500">
          No hay ventas registradas.
        </div>
      ) : (
        <div className="space-y-5">
          {data.map((sale) => (
            <div
              key={sale.sale_id}
              className="flex items-start gap-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <ShoppingCart
                  size={18}
                />
              </div>


              <div className="min-w-0 flex-1">
                <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-start">
                  <h3 className="font-medium text-slate-900">
                    Nueva venta registrada
                  </h3>

                  <span className="shrink-0 text-xs text-slate-400">
                    {getRelativeTime(
                      sale.created_at,
                    )}
                  </span>
                </div>


                <p className="mt-1 text-sm text-slate-500">
                  Venta #{sale.sale_id}
                  {' · '}

                  {sale.branch_name}
                  {' · '}

                  S/{' '}
                  {Number(
                    sale.total,
                  ).toLocaleString(
                    'es-PE',
                    {
                      minimumFractionDigits: 2,
                    },
                  )}
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