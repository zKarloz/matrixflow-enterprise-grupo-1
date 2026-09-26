export interface Sale {
  id: number
  date: string
  customer: string
  product: string
  quantity: number
  total: number
  status: 'Completada' | 'Pendiente' | 'Cancelada'
}

export const sales: Sale[] = [
  {
    id: 1,
    date: '24/09/2026',
    customer: 'Empresa Alpha',
    product: 'Laptop empresarial',
    quantity: 2,
    total: 5000,
    status: 'Completada',
  },
  {
    id: 2,
    date: '23/09/2026',
    customer: 'Empresa Beta',
    product: 'Monitor 24"',
    quantity: 3,
    total: 1950,
    status: 'Completada',
  },
  {
    id: 3,
    date: '22/09/2026',
    customer: 'Empresa Gamma',
    product: 'Teclado mecánico',
    quantity: 5,
    total: 1400,
    status: 'Pendiente',
  },
  {
    id: 4,
    date: '21/09/2026',
    customer: 'Empresa Delta',
    product: 'Mouse inalámbrico',
    quantity: 4,
    total: 480,
    status: 'Cancelada',
  },
]