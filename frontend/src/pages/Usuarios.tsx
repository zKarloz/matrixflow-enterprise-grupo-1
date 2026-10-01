import { useState } from 'react'

// Importamos los usuarios iniciales utilizados actualmente por la página.
import { users as initialUsers } from '../data/users'

interface User {
  id: number
  name: string
  email: string
  role: string
  status: 'Activo' | 'Inactivo'
}

function Usuarios() {
  // Conservamos la información de usuarios utilizada actualmente.
  const [users, setUsers] = useState<User[]>(initialUsers)

  // Controlamos la visibilidad del formulario.
  const [showForm, setShowForm] = useState(false)

  // Guardamos el ID del usuario que se está editando.
  const [editingId, setEditingId] = useState<number | null>(null)

  // Estados correspondientes a los campos del formulario.
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('Vendedor')

  // Controlamos el texto utilizado para filtrar usuarios.
  const [search, setSearch] = useState('')

  // Filtramos por nombre, correo o rol.
  const filteredUsers = users.filter((user) =>
    `${user.name} ${user.email} ${user.role}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  )

  // Calculamos únicamente métricas basadas en los usuarios existentes.
  const activeUsers = users.filter(
    (user) => user.status === 'Activo',
  ).length

  const inactiveUsers = users.filter(
    (user) => user.status === 'Inactivo',
  ).length

  // Reiniciamos el formulario y cerramos el modal.
  const resetForm = () => {
    setName('')
    setEmail('')
    setRole('Vendedor')
    setEditingId(null)
    setShowForm(false)
  }

  // Validamos y guardamos un usuario nuevo o editado.
  const handleSave = () => {
    if (!name.trim() || !email.trim()) {
      alert('Completa el nombre y el correo.')
      return
    }

    // Validamos que el correo tenga una estructura válida.
    const emailIsValid =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

    if (!emailIsValid) {
      alert('Ingresa un correo electrónico válido.')
      return
    }

    // Si existe un ID, actualizamos el usuario correspondiente.
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
      // Si no existe un ID, creamos un nuevo usuario.
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

    // Cerramos y limpiamos el formulario después de guardar.
    resetForm()
  }

  // Cargamos la información del usuario seleccionado en el formulario.
  const handleEdit = (user: User) => {
    setEditingId(user.id)
    setName(user.name)
    setEmail(user.email)
    setRole(user.role)
    setShowForm(true)
  }

  // Eliminamos un usuario después de solicitar confirmación.
  const handleDelete = (id: number) => {
    const user = users.find((item) => item.id === id)

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
      currentUsers.filter((item) => item.id !== id),
    )
  }

  // Obtenemos la primera letra del nombre para el avatar visual.
  const getInitial = (name: string) =>
    name.trim().charAt(0).toUpperCase()

  return (
    <div className="min-h-full bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* ============================================================
            ENCABEZADO
            ============================================================ */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Administración
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              Usuarios
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Gestiona los usuarios y sus niveles de acceso.
            </p>
          </div>

          {/* Acción principal de la página. */}
          <button
            type="button"
            onClick={() => {
              resetForm()
              setShowForm(true)
            }}
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800"
          >
            <span className="mr-2 text-lg leading-none">+</span>
            Nuevo usuario
          </button>
        </div>

        {/* ============================================================
            RESUMEN DE USUARIOS
            ============================================================ */}
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Total de usuarios registrados. */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Usuarios registrados
            </p>

            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              {users.length}
            </p>
          </div>

          {/* Usuarios actualmente activos. */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                Usuarios activos
              </p>

              <span className="h-2 w-2 rounded-full bg-emerald-500" />
            </div>

            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              {activeUsers}
            </p>
          </div>

          {/* Usuarios actualmente inactivos. */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                Usuarios inactivos
              </p>

              <span className="h-2 w-2 rounded-full bg-red-500" />
            </div>

            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              {inactiveUsers}
            </p>
          </div>
        </div>

        {/* ============================================================
            CONTENEDOR PRINCIPAL
            ============================================================ */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {/* Barra superior con buscador. */}
          <div className="flex flex-col gap-4 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Lista de usuarios
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Consulta y administra las cuentas registradas.
              </p>
            </div>

            {/* Buscador de usuarios. */}
            <div className="relative w-full md:max-w-sm">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                ⌕
              </span>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Buscar usuario, correo o rol..."
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-900 outline-none transition-shadow placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>
          </div>

          {/* ============================================================
              TABLA DE USUARIOS
              ============================================================ */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Usuario
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Correo
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Rol
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Estado
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-slate-100 transition-colors last:border-b-0 hover:bg-slate-50"
                  >
                    {/* Usuario con avatar visual. */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                          {getInitial(user.name)}
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {user.name}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-400">
                            ID #{user.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Correo electrónico. */}
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {user.email}
                    </td>

                    {/* Rol del usuario. */}
                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        {user.role}
                      </span>
                    </td>

                    {/* Estado actual del usuario. */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${user.status === 'Activo'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-red-50 text-red-700'
                          }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${user.status === 'Activo'
                              ? 'bg-emerald-500'
                              : 'bg-red-500'
                            }`}
                        />

                        {user.status}
                      </span>
                    </td>

                    {/* Acciones disponibles para cada usuario. */}
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(user)}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(user.id)
                          }
                          className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Estado mostrado cuando el filtro no encuentra resultados. */}
            {filteredUsers.length === 0 && (
              <div className="px-6 py-12 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  ⌕
                </div>

                <p className="mt-3 text-sm font-medium text-slate-700">
                  No se encontraron usuarios
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Prueba con otro nombre, correo o rol.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================================================================
          MODAL DE CREACIÓN Y EDICIÓN
          ================================================================ */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            {/* Encabezado del modal. */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingId !== null
                    ? 'Editar usuario'
                    : 'Nuevo usuario'}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Completa la información de la cuenta.
                </p>
              </div>

              {/* Botón para cerrar el formulario. */}
              <button
                type="button"
                onClick={resetForm}
                aria-label="Cerrar formulario"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                ×
              </button>
            </div>

            {/* Campos del formulario. */}
            <div className="space-y-5 px-6 py-6">
              <div>
                <label
                  htmlFor="user-name"
                  className="text-sm font-semibold text-slate-700"
                >
                  Nombre
                </label>

                <input
                  id="user-name"
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Nombre completo"
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-shadow placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
              </div>

              <div>
                <label
                  htmlFor="user-email"
                  className="text-sm font-semibold text-slate-700"
                >
                  Correo electrónico
                </label>

                <input
                  id="user-email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="correo@ejemplo.com"
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-shadow placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
              </div>

              <div>
                <label
                  htmlFor="user-role"
                  className="text-sm font-semibold text-slate-700"
                >
                  Rol
                </label>

                <select
                  id="user-role"
                  value={role}
                  onChange={(event) =>
                    setRole(event.target.value)
                  }
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-shadow focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                >
                  <option>Administrador</option>
                  <option>Supervisor</option>
                  <option>Vendedor</option>
                </select>
              </div>
            </div>

            {/* Acciones del formulario. */}
            <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800"
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