import { useState } from 'react'

interface Branch {
  id: number
  name: string
  city: string
  address: string
  manager: string
  status: 'Activa' | 'Inactiva'
}

const initialBranches: Branch[] = [
  {
    id: 1,
    name: 'Sucursal Lima',
    city: 'Lima',
    address: 'Av. Arequipa 123',
    manager: 'Carlos Mendoza',
    status: 'Activa',
  },
  {
    id: 2,
    name: 'Sucursal Arequipa',
    city: 'Arequipa',
    address: 'Calle Mercaderes 456',
    manager: 'Ana Torres',
    status: 'Activa',
  },
  {
    id: 3,
    name: 'Sucursal Trujillo',
    city: 'Trujillo',
    address: 'Av. España 789',
    manager: 'Luis García',
    status: 'Activa',
  },
]

function Sucursales() {
  const [branches, setBranches] =
    useState<Branch[]>(initialBranches)

  const [showForm, setShowForm] = useState(false)

  const [editingId, setEditingId] =
    useState<number | null>(null)

  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [manager, setManager] = useState('')

  const [search, setSearch] = useState('')

  const filteredBranches = branches.filter((branch) =>
    `${branch.name} ${branch.city} ${branch.address} ${branch.manager}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  )

  const activeBranches = branches.filter(
    (branch) => branch.status === 'Activa',
  ).length

  const resetForm = () => {
    setName('')
    setCity('')
    setAddress('')
    setManager('')
    setEditingId(null)
    setShowForm(false)
  }

  const handleSave = () => {
    if (
      !name.trim() ||
      !city.trim() ||
      !address.trim() ||
      !manager.trim()
    ) {
      alert('Completa todos los campos.')
      return
    }

    if (editingId !== null) {
      setBranches((currentBranches) =>
        currentBranches.map((branch) =>
          branch.id === editingId
            ? {
                ...branch,
                name: name.trim(),
                city: city.trim(),
                address: address.trim(),
                manager: manager.trim(),
              }
            : branch,
        ),
      )
    } else {
      const newBranch: Branch = {
        id: Date.now(),
        name: name.trim(),
        city: city.trim(),
        address: address.trim(),
        manager: manager.trim(),
        status: 'Activa',
      }

      setBranches((currentBranches) => [
        ...currentBranches,
        newBranch,
      ])
    }

    resetForm()
  }

  const handleEdit = (branch: Branch) => {
    setEditingId(branch.id)
    setName(branch.name)
    setCity(branch.city)
    setAddress(branch.address)
    setManager(branch.manager)
    setShowForm(true)
  }

  const handleDelete = (id: number) => {
    const branch = branches.find(
      (item) => item.id === id,
    )

    if (!branch) {
      return
    }

    const confirmed = window.confirm(
      `¿Seguro que deseas eliminar "${branch.name}"?`,
    )

    if (!confirmed) {
      return
    }

    setBranches((currentBranches) =>
      currentBranches.filter(
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
            Sucursales
          </h1>

          <p className="mt-2 text-slate-500">
            Administración de las sucursales de MATRIXFLOW.
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
          + Nueva sucursal
        </button>

      </div>

      {/* RESUMEN */}

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Total de sucursales
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {branches.length}
          </p>

        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Sucursales activas
          </p>

          <p className="mt-2 text-2xl font-bold text-green-600">
            {activeBranches}
          </p>

        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Ciudades
          </p>

          <p className="mt-2 text-2xl font-bold text-blue-600">
            {new Set(
              branches.map((branch) => branch.city),
            ).size}
          </p>

        </div>

      </div>

      {/* BUSCADOR */}

      <div className="mb-6">

        <input
          type="text"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Buscar sucursal, ciudad, dirección..."
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
                  Sucursal
                </th>

                <th className="px-6 py-4 text-sm font-semibold">
                  Ciudad
                </th>

                <th className="px-6 py-4 text-sm font-semibold">
                  Dirección
                </th>

                <th className="px-6 py-4 text-sm font-semibold">
                  Responsable
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

              {filteredBranches.map((branch) => (

                <tr
                  key={branch.id}
                  className="hover:bg-slate-50"
                >

                  <td className="px-6 py-4 font-medium text-slate-800">
                    {branch.name}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {branch.city}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {branch.address}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {branch.manager}
                  </td>

                  <td className="px-6 py-4">

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        branch.status === 'Activa'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {branch.status}
                    </span>

                  </td>

                  <td className="px-6 py-4">

                    <div className="flex gap-2">

                      <button
                        type="button"
                        onClick={() =>
                          handleEdit(branch)
                        }
                        className="rounded-lg border border-blue-300 px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(branch.id)
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

          {filteredBranches.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              No se encontraron sucursales.
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
                  ? 'Editar sucursal'
                  : 'Nueva sucursal'}
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
                  placeholder="Sucursal Cusco"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                />

              </div>

              <div>

                <label className="text-sm font-medium text-slate-700">
                  Ciudad
                </label>

                <input
                  type="text"
                  value={city}
                  onChange={(event) =>
                    setCity(event.target.value)
                  }
                  placeholder="Cusco"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                />

              </div>

              <div>

                <label className="text-sm font-medium text-slate-700">
                  Dirección
                </label>

                <input
                  type="text"
                  value={address}
                  onChange={(event) =>
                    setAddress(event.target.value)
                  }
                  placeholder="Av. Principal 123"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                />

              </div>

              <div>

                <label className="text-sm font-medium text-slate-700">
                  Responsable
                </label>

                <input
                  type="text"
                  value={manager}
                  onChange={(event) =>
                    setManager(event.target.value)
                  }
                  placeholder="Nombre del responsable"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                />

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

export default Sucursales