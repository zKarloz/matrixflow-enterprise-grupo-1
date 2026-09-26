interface Activity {
  id: number
  title: string
  description: string
  time: string
  type: 'sale' | 'product' | 'inventory' | 'user'
}

const activities: Activity[] = [
  {
    id: 1,
    title: 'Nueva venta registrada',
    description: 'Se registró una venta de S/ 2,500.00',
    time: 'Hace 10 minutos',
    type: 'sale',
  },
  {
    id: 2,
    title: 'Producto agregado',
    description: 'Se agregó un nuevo producto al catálogo',
    time: 'Hace 25 minutos',
    type: 'product',
  },
  {
    id: 3,
    title: 'Inventario actualizado',
    description: 'Se actualizó el stock de productos',
    time: 'Hace 1 hora',
    type: 'inventory',
  },
  {
    id: 4,
    title: 'Nuevo usuario',
    description: 'Se registró un nuevo usuario en el sistema',
    time: 'Hace 2 horas',
    type: 'user',
  },
]

function RecentActivity() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900">
          Actividad reciente
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Últimos movimientos registrados en MatrixFlow.
        </p>
      </div>

      <div className="space-y-5">

        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-4"
          >

            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                activity.type === 'sale'
                  ? 'bg-green-100 text-green-700'
                  : activity.type === 'product'
                    ? 'bg-blue-100 text-blue-700'
                    : activity.type === 'inventory'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-purple-100 text-purple-700'
              }`}
            >
              {activity.type === 'sale'
                ? 'S'
                : activity.type === 'product'
                  ? 'P'
                  : activity.type === 'inventory'
                    ? 'I'
                    : 'U'}
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

    </div>
  )
}

export default RecentActivity