import { useState } from 'react'
import { users as initialUsers } from '../data/users'

interface User {
  id: number
  name: string
  email: string
  role: string
  status: 'Activo' | 'Inactivo'
}

function Usuarios() {
  const [users, setUsers] =
    useState<User[]>(initialUsers)

  const [showForm, setShowForm] = useState(false)

  const [editingId, setEditingId] =
    useState<number | null>(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('Vendedor')

  const [search, setSearch] = useState('')

  const filteredUsers = users.filter((user) =>
    `${user.name} ${user.email} ${user.role}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  )

  const resetForm = () => {
    setName('')
    setEmail('')
    setRole('Vendedor')
    setEditingId(null)
    setShowForm(false)
  }

  const handleSave = () => {
    if (!name.trim() || !email.trim()) {
      alert('Completa el nombre y el correo.')
      return
    }

    const emailIsValid =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email.trim(),
      )

    if (!emailIsValid) {
      alert('Ingresa un correo electrónico válido.')
      return
    }

    if (editingId !== null) {
      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === editingId
            ? {
                ...user,
                name: name.trim(),
                email: email.trim(),
                role,
              }
            : user,
        ),
      )
    } else {
      const newUser: User = {
        id: Date.now(),
        name: name.trim(),
        email: email.trim(),
        role,
        status: 'Activo',
      }

      setUsers((currentUsers) => [
        ...currentUsers,
        newUser,
      ])
    }

    resetForm()
  }

  const handleEdit = (user: User) => {
    setEditingId(user.id)
    setName(user.name)
    setEmail(user.email)
    setRole(user.role)
    setShowForm(true)
  }

  const handleDelete = (id: number) => {
    const user = users.find(
      (item) => item.id === id,
    )

    if (!user) {
      return
    }

    const confirmed = window.confirm(
      `¿Seguro que deseas eliminar al usuario "${user.name}"?`,
    )

    if (!confirmed) {
      return
    }

    setUsers((currentUsers) =>
      currentUsers.filter(
        (item) => item.id !== id,
      ),
    )
  }

  return (
    <div>

      {/* ENCABEZADO */}

      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">

        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Usuarios
          </h1>

          <p className="mt-2 text-slate-500">
            Administración de usuarios del sistema.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            resetForm()
            setShowForm(true)
          }}
          className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Nuevo usuario
        </button>

      </div>

      {/* BUSCADOR */}

      <div className="mb-6">

        <input
          type="text"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Buscar usuario, correo o rol..."
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 md:max-w-md"
        />

      </div>

      {/* TABLA */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead className="border-b bg-slate-50">

              <tr>

                <th className="px-6 py-4 text-sm font-semibold">
                  Usuario
                </th>

                <th className="px-6 py-4 text-sm font-semibold">
                  Correo
                </th>

                <th className="px-6 py-4 text-sm font-semibold">
                  Rol
                </th>

                <th className="px-6 py-4 text-sm font-semibold">
                  Estado
                </th>

                <th className="px-6 py-4 text-sm font-semibold">
                  Acciones
                </th>

              </tr>

            </thead>

            <tbody className="divide-y">

              {filteredUsers.map((user) => (

                <tr
                  key={user.id}
                  className="hover:bg-slate-50"
                >

                  <td className="px-6 py-4 font-medium text-slate-800">
                    {user.name}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {user.email}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {user.role}
                  </td>

                  <td className="px-6 py-4">

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        user.status === 'Activo'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {user.status}
                    </span>

                  </td>

                  <td className="px-6 py-4">

                    <div className="flex gap-2">

                      <button
                        type="button"
                        onClick={() =>
                          handleEdit(user)
                        }
                        className="rounded-lg border border-blue-300 px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(user.id)
                        }
                        className="rounded-lg border border-red-300 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        Eliminar
                      </button>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

          {filteredUsers.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              No se encontraron usuarios.
            </div>
          )}

        </div>

      </div>

      {/* MODAL */}

      {showForm && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">

            <div className="mb-6 flex items-center justify-between">

              <h2 className="text-xl font-bold text-slate-900">
                {editingId !== null
                  ? 'Editar usuario'
                  : 'Nuevo usuario'}
              </h2>

              <button
                type="button"
                onClick={resetForm}
                className="text-xl text-slate-400 hover:text-slate-700"
              >
                ×
              </button>

            </div>

            <div className="space-y-4">

              <div>

                <label className="text-sm font-medium text-slate-700">
                  Nombre
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Nombre completo"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                />

              </div>

              <div>

                <label className="text-sm font-medium text-slate-700">
                  Correo
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="correo@ejemplo.com"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                />

              </div>

              <div>

                <label className="text-sm font-medium text-slate-700">
                  Rol
                </label>

                <select
                  value={role}
                  onChange={(event) =>
                    setRole(event.target.value)
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                >
                  <option>Administrador</option>
                  <option>Supervisor</option>
                  <option>Vendedor</option>
                </select>

              </div>

            </div>

            <div className="mt-6 flex justify-end gap-3">

              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                {editingId !== null
                  ? 'Guardar cambios'
                  : 'Guardar'}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  )
}

export default Usuarios