import { useMemo, useState } from 'react'

interface HistoryItem {
  id: number
  action: string
  module: string
  user: string
  description: string
  date: string
  status: 'Exitoso' | 'Pendiente' | 'Cancelado'
}

const initialHistory: HistoryItem[] = [
  {
    id: 1,
    action: 'Venta registrada',
    module: 'Ventas',
    user: 'Administrador',
    description: 'Se registró una nueva venta por S/ 2,500.00',
    date: '24/09/2026 10:30',
    status: 'Exitoso',
  },
  {
    id: 2,
    action: 'Producto creado',
    module: 'Productos',
    user: 'Administrador',
    description: 'Se agregó un nuevo producto al catálogo',
    date: '24/09/2026 09:45',
    status: 'Exitoso',
  },
  {
    id: 3,
    action: 'Inventario actualizado',
    module: 'Inventario',
    user: 'Supervisor',
    description: 'Se actualizó el stock de productos',
    date: '23/09/2026 16:20',
    status: 'Exitoso',
  },
  {
    id: 4,
    action: 'Usuario creado',
    module: 'Usuarios',
    user: 'Administrador',
    description: 'Se registró un nuevo usuario',
    date: '23/09/2026 14:10',
    status: 'Exitoso',
  },
  {
    id: 5,
    action: 'Reporte solicitado',
    module: 'Reportes',
    user: 'Supervisor',
    description: 'Se solicitó un reporte de ventas',
    date: '23/09/2026 11:35',
    status: 'Pendiente',
  },
]

function Historial() {
  const [history, setHistory] =
    useState<HistoryItem[]>(initialHistory)

  const [search, setSearch] = useState('')
  const [moduleFilter, setModuleFilter] = useState('Todos')
  const [statusFilter, setStatusFilter] = useState('Todos')

  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const matchesSearch =
        `${item.action} ${item.module} ${item.user} ${item.description}`
          .toLowerCase()
          .includes(search.toLowerCase())

      const matchesModule =
        moduleFilter === 'Todos' ||
        item.module === moduleFilter

      const matchesStatus =
        statusFilter === 'Todos' ||
        item.status === statusFilter

      return (
        matchesSearch &&
        matchesModule &&
        matchesStatus
      )
    })
  }, [history, search, moduleFilter, statusFilter])

  const successfulActions = history.filter(
    (item) => item.status === 'Exitoso',
  ).length

  const pendingActions = history.filter(
    (item) => item.status === 'Pendiente',
  ).length

  const clearHistory = () => {
    const confirmed = window.confirm(
      '¿Seguro que deseas limpiar el historial?',
    )

    if (confirmed) {
      setHistory([])
    }
  }

  return (
    <div>

      {/* ENCABEZADO */}

      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">

        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Historial
          </h1>

          <p className="mt-2 text-slate-500">
            Registro de actividades realizadas en MatrixFlow.
          </p>
        </div>

        <button
          type="button"
          onClick={clearHistory}
          disabled={history.length === 0}
          className="rounded-lg border border-red-300 px-5 py-3 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Limpiar historial
        </button>

      </div>

      {/* RESUMEN */}

      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-3">

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Total de actividades
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {history.length}
          </p>

        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Actividades exitosas
          </p>

          <p className="mt-2 text-2xl font-bold text-green-600">
            {successfulActions}
          </p>

        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Pendientes
          </p>

          <p className="mt-2 text-2xl font-bold text-yellow-600">
            {pendingActions}
          </p>

        </div>

      </div>

      {/* FILTROS */}

      <div className="mb-6 flex flex-col gap-3 lg:flex-row">

        <input
          type="text"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Buscar actividad..."
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 lg:max-w-md"
        />

        <select
          value={moduleFilter}
          onChange={(event) =>
            setModuleFilter(event.target.value)
          }
          className="rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
        >
          <option>Todos</option>
          <option>Ventas</option>
          <option>Productos</option>
          <option>Inventario</option>
          <option>Usuarios</option>
          <option>Reportes</option>
        </select>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
          className="rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
        >
          <option>Todos</option>
          <option>Exitoso</option>
          <option>Pendiente</option>
          <option>Cancelado</option>
        </select>

      </div>

      {/* TABLA */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead className="border-b bg-slate-50">

              <tr>

                <th className="px-6 py-4 text-sm font-semibold">
                  Acción
                </th>

                <th className="px-6 py-4 text-sm font-semibold">
                  Módulo
                </th>

                <th className="px-6 py-4 text-sm font-semibold">
                  Usuario
                </th>

                <th className="px-6 py-4 text-sm font-semibold">
                  Descripción
                </th>

                <th className="px-6 py-4 text-sm font-semibold">
                  Fecha
                </th>

                <th className="px-6 py-4 text-sm font-semibold">
                  Estado
                </th>

              </tr>

            </thead>

            <tbody className="divide-y">

              {filteredHistory.map((item) => (

                <tr
                  key={item.id}
                  className="hover:bg-slate-50"
                >

                  <td className="px-6 py-4 font-medium text-slate-800">
                    {item.action}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {item.module}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {item.user}
                  </td>

                  <td className="max-w-xs px-6 py-4 text-sm text-slate-600">
                    {item.description}
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                    {item.date}
                  </td>

                  <td className="px-6 py-4">

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        item.status === 'Exitoso'
                          ? 'bg-green-100 text-green-700'
                          : item.status === 'Pendiente'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {item.status}
                    </span>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

          {filteredHistory.length === 0 && (
            <div className="p-10 text-center">

              <p className="font-medium text-slate-700">
                No hay actividades.
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Prueba modificando los filtros de búsqueda.
              </p>

            </div>
          )}

        </div>

      </div>

    </div>
  )
}

export default Historial