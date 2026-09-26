export interface Branch {
  id: number
  name: string
  city: string
  address: string
  phone: string
  status: 'Activa' | 'Inactiva'
}

export const branches: Branch[] = [
  {
    id: 1,
    name: 'Sucursal Lima',
    city: 'Lima',
    address: 'Av. Arequipa 1250',
    phone: '+51 999 111 111',
    status: 'Activa',
  },
  {
    id: 2,
    name: 'Sucursal Arequipa',
    city: 'Arequipa',
    address: 'Av. Ejército 450',
    phone: '+51 999 222 222',
    status: 'Activa',
  },
  {
    id: 3,
    name: 'Sucursal Trujillo',
    city: 'Trujillo',
    address: 'Av. España 780',
    phone: '+51 999 333 333',
    status: 'Activa',
  },
  {
    id: 4,
    name: 'Sucursal Cusco',
    city: 'Cusco',
    address: 'Av. El Sol 620',
    phone: '+51 999 444 444',
    status: 'Inactiva',
  },
]