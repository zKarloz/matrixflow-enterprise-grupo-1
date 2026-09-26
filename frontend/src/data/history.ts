export interface HistoryItem {
  id: number
  date: string
  user: string
  action: string
  module: string
  status: 'Completado' | 'Pendiente'
}

export const history: HistoryItem[] = [
  {
    id: 1,
    date: '24/09/2026 10:30',
    user: 'Administrador',
    action: 'Registro de venta',
    module: 'Ventas',
    status: 'Completado',
  },
  {
    id: 2,
    date: '24/09/2026 09:45',
    user: 'Administrador',
    action: 'Actualización de inventario',
    module: 'Inventario',
    status: 'Completado',
  },
  {
    id: 3,
    date: '23/09/2026 16:20',
    user: 'Supervisor',
    action: 'Actualización de producto',
    module: 'Productos',
    status: 'Completado',
  },
  {
    id: 4,
    date: '23/09/2026 14:10',
    user: 'Administrador',
    action: 'Operación matricial',
    module: 'Matrices',
    status: 'Completado',
  },
]