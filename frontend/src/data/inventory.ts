export interface InventoryItem {
  id: number
  product: string
  category: string
  branch: string
  stock: number
  minimumStock: number
  status: 'Normal' | 'Bajo' | 'Agotado'
}

export const inventory: InventoryItem[] = [
  {
    id: 1,
    product: 'Laptop empresarial',
    category: 'Tecnología',
    branch: 'Lima',
    stock: 15,
    minimumStock: 5,
    status: 'Normal',
  },
  {
    id: 2,
    product: 'Monitor 24"',
    category: 'Tecnología',
    branch: 'Lima',
    stock: 4,
    minimumStock: 10,
    status: 'Bajo',
  },
  {
    id: 3,
    product: 'Teclado mecánico',
    category: 'Accesorios',
    branch: 'Arequipa',
    stock: 42,
    minimumStock: 10,
    status: 'Normal',
  },
  {
    id: 4,
    product: 'Mouse inalámbrico',
    category: 'Accesorios',
    branch: 'Trujillo',
    stock: 0,
    minimumStock: 8,
    status: 'Agotado',
  },
  {
    id: 5,
    product: 'Impresora multifuncional',
    category: 'Oficina',
    branch: 'Cusco',
    stock: 8,
    minimumStock: 5,
    status: 'Normal',
  },
]