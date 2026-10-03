import { useEffect, useMemo, useState } from 'react'

// Modal compartido para centrar formularios y cubrir todo el viewport.
import Modal from '../components/ui/Modal'
import {
  Pencil,
  Search,
  UserCheck,
  UserPlus,
  UserX,
  X,
} from 'lucide-react'

import {
  createUser,
  getCurrentUser,
  getUsers,
  updateUser,
  type CreateUserData,
  type UpdateUserData,
  type User,
} from '../services/api'

// Roles reales registrados actualmente en PostgreSQL.
const ROLE_OPTIONS = [
  {
    id: 1,
    name: 'Administrador',
  },
  {
    id: 4,
    name: 'Analista',
  },
  {
    id: 5,
    name: 'Consulta',
  },
]

function Usuarios() {
  // Usuarios obtenidos desde FastAPI.
  const [users, setUsers] = useState<User[]>([])

  // Estados generales.
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  // Control del formulario.
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  // Si contiene un ID, estamos editando una cuenta existente.
  const [editingId, setEditingId] = useState<number | null>(null)

  // Datos del formulario.
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [roleId, setRoleId] = useState(4)
  const [isActive, setIsActive] = useState(true)

  // Sesión actual obtenida del JWT.
  const currentSession = getCurrentUser()

  // Obtiene el nombre visible de un rol.
  const getRoleName = (id: number) => {
    return (
      ROLE_OPTIONS.find((role) => role.id === id)?.name ??
      `Rol ${id}`
    )
  }

  // Consulta nuevamente PostgreSQL.
  const loadUsers = async () => {
    try {
      setLoading(true)
      setError('')

      const data = await getUsers()
      setUsers(data)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No se pudieron obtener los usuarios.',
      )
    } finally {
      setLoading(false)
    }
  }

  // Primera carga de la página.
  useEffect(() => {
    void loadUsers()
  }, [])

  // Filtra los usuarios utilizando los datos reales.
  const filteredUsers = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase()

    if (!normalizedSearch) {
      return users
    }

    return users.filter((user) => {
      const searchableText = [
        user.full_name,
        user.username,
        user.email,
        getRoleName(user.role_id),
      ]
        .join(' ')
        .toLowerCase()

      return searchableText.includes(normalizedSearch)
    })
  }, [search, users])

  // Indicadores calculados desde los usuarios persistidos.
  const activeUsers = users.filter(
    (user) => user.is_active,
  ).length

  const inactiveUsers = users.length - activeUsers

  // Limpia completamente el formulario.
  const resetForm = () => {
    setFullName('')
    setUsername('')
    setEmail('')
    setPassword('')
    setRoleId(4)
    setIsActive(true)
    setEditingId(null)
    setShowForm(false)
  }

  // Abre el formulario para registrar una cuenta nueva.
  const openCreateForm = () => {
    resetForm()
    setShowForm(true)
  }

  // Abre el formulario con los datos del usuario seleccionado.
  const openEditForm = (user: User) => {
    setEditingId(user.id)
    setFullName(user.full_name)
    setUsername(user.username)
    setEmail(user.email)
    setPassword('')
    setRoleId(user.role_id)
    setIsActive(user.is_active)
    setShowForm(true)
  }

  // Crea o actualiza una cuenta según editingId.
  const handleSave = async () => {
    if (
      !fullName.trim() ||
      !username.trim() ||
      !email.trim()
    ) {
      alert('Completa los campos obligatorios.')
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

    try {
      setSaving(true)

      if (editingId === null) {
        // Una contraseña inicial solamente es necesaria
        // cuando se registra una cuenta nueva.
        if (!password.trim()) {
          alert('Ingresa una contraseña inicial.')
          return
        }

        const data: CreateUserData = {
          full_name: fullName.trim(),
          username: username.trim(),
          email: email.trim(),
          password,
          role_id: roleId,
        }

        await createUser(data)
      } else {
        const data: UpdateUserData = {
          full_name: fullName.trim(),
          username: username.trim(),
          email: email.trim(),
          role_id: roleId,
          is_active: isActive,
        }

        await updateUser(
          editingId,
          data,
        )
      }

      resetForm()

      // Consultamos nuevamente la base de datos para
      // mostrar exactamente el estado persistido.
      await loadUsers()
    } catch (requestError) {
      alert(
        requestError instanceof Error
          ? requestError.message
          : 'No se pudo guardar el usuario.',
      )
    } finally {
      setSaving(false)
    }
  }

  // Activa o desactiva una cuenta sin eliminarla.
  const handleToggleStatus = async (user: User) => {
    // Evitamos que el administrador desactive accidentalmente
    // la misma cuenta con la que está trabajando.
    if (user.id === currentSession?.userId) {
      alert(
        'No puedes desactivar la cuenta con la que has iniciado sesión.',
      )
      return
    }

    const action = user.is_active
      ? 'desactivar'
      : 'activar'

    const confirmed = window.confirm(
      `¿Deseas ${action} la cuenta de "${user.full_name}"?`,
    )

    if (!confirmed) {
      return
    }

    const data: UpdateUserData = {
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      role_id: user.role_id,
      is_active: !user.is_active,
    }

    try {
      await updateUser(
        user.id,
        data,
      )

      await loadUsers()
    } catch (requestError) {
      alert(
        requestError instanceof Error
          ? requestError.message
          : 'No se pudo actualizar el estado del usuario.',
      )
    }
  }

  // Inicial utilizada en el avatar.
  const getInitial = (name: string) => {
    return name.trim().charAt(0).toUpperCase()
  }

  return (
    <div className="min-h-full bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Este título se retirará posteriormente cuando
            el Header global muestre el nombre de cada página. */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="mt-2 text-sm text-slate-500">
              Gestiona las cuentas registradas en MatrixFlow.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800"
          >
            <UserPlus size={18} />
            Nuevo usuario
          </button>
        </div>

        {/* Resumen. */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Usuarios registrados
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {users.length}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Usuarios activos
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {activeUsers}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Usuarios inactivos
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {inactiveUsers}
            </p>
          </div>
        </div>

        {/* Tabla. */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Lista de usuarios
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Cuentas registradas en PostgreSQL.
              </p>
            </div>

            <div className="relative w-full md:max-w-sm">
              <Search
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Buscar usuario..."
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>
          </div>

          {loading && (
            <div className="px-6 py-12 text-center text-sm text-slate-500">
              Cargando usuarios...
            </div>
          )}

          {!loading && error && (
            <div className="px-6 py-12 text-center">
              <p className="text-sm font-medium text-red-600">
                {error}
              </p>

              <button
                type="button"
                onClick={() => void loadUsers()}
                className="mt-4 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Reintentar
              </button>
            </div>
          )}

          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Usuario
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Username
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
                      className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                            {getInitial(user.full_name)}
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {user.full_name}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              ID #{user.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {user.username}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {user.email}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                          {getRoleName(user.role_id)}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${user.is_active
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-red-50 text-red-700'
                            }`}
                        >
                          {user.is_active
                            ? 'Activo'
                            : 'Inactivo'}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditForm(user)}
                            className="
                              inline-flex
                              items-center
                              gap-1.5
                              rounded-lg
                              border
                              border-blue-200
                              px-3
                              py-2
                              text-xs
                              font-semibold
                              text-blue-400
                              transition-colors
                              hover:bg-blue-50
                              hover:text-blue-500
                            "
                          >
                            <Pencil size={14} />
                            Editar
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              void handleToggleStatus(user)
                            }
                            disabled={
                              user.id === currentSession?.userId
                            }
                            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${user.is_active
                              ? 'border-red-200 text-red-600 hover:bg-red-50'
                              : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                              }`}
                          >
                            {user.is_active ? (
                              <>
                                <UserX size={14} />
                                Desactivar
                              </>
                            ) : (
                              <>
                                <UserCheck size={14} />
                                Activar
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredUsers.length === 0 && (
                <div className="px-6 py-12 text-center">
                  <Search
                    size={32}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-3 text-sm font-medium text-slate-700">
                    No se encontraron usuarios
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Formulario de creación y edición. */}
      <Modal
        open={showForm}
        onClose={() => {
          // Evitamos cerrar el formulario durante el guardado.
          if (!saving) {
            resetForm()
          }
        }}
        panelClassName="max-w-md"
      >

        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {editingId === null
                ? 'Nuevo usuario'
                : 'Editar usuario'}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {editingId === null
                ? 'Registra una nueva cuenta en MatrixFlow.'
                : 'Actualiza la información de la cuenta.'}
            </p>
          </div>

          <button
            type="button"
            onClick={resetForm}
            aria-label="Cerrar formulario"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 px-6 py-6">
          <div>
            <label
              htmlFor="full-name"
              className="text-sm font-semibold text-slate-700"
            >
              Nombre completo
            </label>

            <input
              id="full-name"
              type="text"
              value={fullName}
              onChange={(event) =>
                setFullName(event.target.value)
              }
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-100"
            />
          </div>

          <div>
            <label
              htmlFor="username"
              className="text-sm font-semibold text-slate-700"
            >
              Nombre de usuario
            </label>

            <input
              id="username"
              type="text"
              value={username}
              onChange={(event) =>
                setUsername(event.target.value)
              }
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-100"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="text-sm font-semibold text-slate-700"
            >
              Correo electrónico
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-100"
            />
          </div>

          {/* La contraseña solo se solicita al crear. */}
          {editingId === null && (
            <div>
              <label
                htmlFor="password"
                className="text-sm font-semibold text-slate-700"
              >
                Contraseña inicial
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-100"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="role"
              className="text-sm font-semibold text-slate-700"
            >
              Rol
            </label>

            <select
              id="role"
              value={roleId}
              onChange={(event) =>
                setRoleId(Number(event.target.value))
              }
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-100"
            >
              {ROLE_OPTIONS.map((role) => (
                <option
                  key={role.id}
                  value={role.id}
                >
                  {role.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={resetForm}
            disabled={saving}
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? 'Guardando...'
              : editingId === null
                ? 'Crear usuario'
                : 'Guardar cambios'}
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default Usuarios