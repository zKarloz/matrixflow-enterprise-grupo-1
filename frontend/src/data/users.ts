export interface User {
  id: number
  name: string
  email: string
  role: string
  status: 'Activo' | 'Inactivo'
}

export const users: User[] = [
  {
    id: 1,
    name: 'Administrador',
    email: 'admin@matrixflow.com',
    role: 'Administrador',
    status: 'Activo',
  },
  {
    id: 2,
    name: 'Carlos Mendoza',
    email: 'carlos@matrixflow.com',
    role: 'Supervisor',
    status: 'Activo',
  },
  {
    id: 3,
    name: 'Ana Torres',
    email: 'ana@matrixflow.com',
    role: 'Vendedor',
    status: 'Activo',
  },
  {
    id: 4,
    name: 'Luis García',
    email: 'luis@matrixflow.com',
    role: 'Vendedor',
    status: 'Inactivo',
  },
]