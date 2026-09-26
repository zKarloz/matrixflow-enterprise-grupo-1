export interface Product {
  id: number
  name: string
  category: string
  price: number
  stock: number
  status: 'Disponible' | 'Agotado'
}

export const products: Product[] = [
  {
    id: 1,
    name: 'Laptop empresarial',
    category: 'Tecnología',
    price: 2500,
    stock: 15,
    status: 'Disponible',
  },
  {
    id: 2,
    name: 'Monitor 24"',
    category: 'Tecnología',
    price: 650,
    stock: 28,
    status: 'Disponible',
  },
  {
    id: 3,
    name: 'Teclado mecánico',
    category: 'Accesorios',
    price: 280,
    stock: 42,
    status: 'Disponible',
  },
  {
    id: 4,
    name: 'Mouse inalámbrico',
    category: 'Accesorios',
    price: 120,
    stock: 0,
    status: 'Agotado',
  },
  {
    id: 5,
    name: 'Impresora multifuncional',
    category: 'Oficina',
    price: 890,
    stock: 8,
    status: 'Disponible',
  },
]