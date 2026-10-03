import { useEffect, useState } from 'react'

// Modal compartido para centrar formularios y cubrir todo el viewport.
import Modal from '../components/ui/Modal'
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Filter,
  MapPin,
  Pencil,
  Plus,
  Search,
  Store,
  UserCheck,
  UserX,
  X,
} from 'lucide-react'

import {
  createBranch,
  getBranches,
  getCompanies,
  updateBranch,
  type Branch,
  type Company,
  type UpdateBranchData,
} from '../services/api'

function Sucursales() {
  // Datos obtenidos desde FastAPI.
  const [branches, setBranches] = useState<Branch[]>([])
  const [companies, setCompanies] = useState<Company[]>([])

  // Estados generales de la página.
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  // Empresa utilizada para filtrar las sucursales.
  // Una cadena vacía representa "Todas las empresas".
  const [companyFilter, setCompanyFilter] =
    useState('')

  // Control del formulario.
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  // Campos del formulario.
  const [companyId, setCompanyId] = useState('')
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [isActive, setIsActive] = useState(true)

  // Consulta empresas y sucursales reales.
  const loadData = async () => {
    try {
      setLoading(true)
      setError('')

      const [companiesData, branchesData] = await Promise.all([
        getCompanies(),
        getBranches(),
      ])

      setCompanies(companiesData)
      setBranches(branchesData)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No se pudieron cargar las sucursales.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  // Permite buscar por sucursal, empresa, dirección o teléfono.
  const filteredBranches = branches.filter((branch) => {
    const company = companies.find(
      (item) => item.id === branch.company_id,
    )

    const searchableText = [
      branch.name,
      branch.address ?? '',
      branch.phone ?? '',
      company?.name ?? '',
    ]
      .join(' ')
      .toLowerCase()

    const matchesSearch =
      searchableText.includes(
        search.trim().toLowerCase(),
      )

    const matchesCompany =
      !companyFilter ||
      branch.company_id ===
      Number(companyFilter)

    return (
      matchesSearch &&
      matchesCompany
    )
  })

  const activeBranches = branches.filter(
    (branch) => branch.is_active,
  ).length

  const companiesWithBranches = new Set(
    branches.map((branch) => branch.company_id),
  ).size

  // Limpia el formulario y sale del modo edición.
  const resetForm = () => {
    setCompanyId('')
    setName('')
    setAddress('')
    setPhone('')
    setIsActive(true)
    setEditingId(null)
    setShowForm(false)
    setError('')
  }

  // Abre el formulario para registrar una sucursal.
  const openCreateForm = () => {
    resetForm()
    setShowForm(true)
  }

  // Carga una sucursal existente en el formulario.
  const openEditForm = (branch: Branch) => {
    setEditingId(branch.id)
    setCompanyId(String(branch.company_id))
    setName(branch.name)
    setAddress(branch.address ?? '')
    setPhone(branch.phone ?? '')
    setIsActive(branch.is_active)
    setError('')
    setShowForm(true)
  }

  // Registra o actualiza una sucursal.
  const handleSave = async () => {
    if (editingId === null && !companyId) {
      setError(
        'Selecciona la empresa a la que pertenece la sucursal.',
      )
      return
    }

    if (!name.trim()) {
      setError(
        'El nombre de la sucursal es obligatorio.',
      )
      return
    }

    try {
      setSaving(true)
      setError('')

      if (editingId === null) {
        await createBranch({
          name: name.trim(),
          company_id: Number(companyId),
          address: address.trim() || null,
          phone: phone.trim() || null,
        })
      } else {
        const data: UpdateBranchData = {
          name: name.trim(),
          address: address.trim() || null,
          phone: phone.trim() || null,
          is_active: isActive,
        }

        await updateBranch(
          editingId,
          data,
        )
      }

      resetForm()
      await loadData()
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No se pudo guardar la sucursal.',
      )
    } finally {
      setSaving(false)
    }
  }

  // Cambia el estado sin borrar registros históricos.
  const handleToggleStatus = async (branch: Branch) => {
    const action = branch.is_active
      ? 'desactivar'
      : 'activar'

    const confirmed = window.confirm(
      `¿Deseas ${action} la sucursal "${branch.name}"?`,
    )

    if (!confirmed) {
      return
    }

    const data: UpdateBranchData = {
      name: branch.name,
      address: branch.address,
      phone: branch.phone,
      is_active: !branch.is_active,
    }

    try {
      setError('')

      await updateBranch(
        branch.id,
        data,
      )

      await loadData()
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No se pudo actualizar el estado de la sucursal.',
      )
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">

      {/* El título principal ya se muestra en el Header global. */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <p className="max-w-2xl text-sm text-slate-500">
          Administra las sedes y puntos de operación registrados
          en MatrixFlow.
        </p>

        <button
          type="button"
          onClick={openCreateForm}
          disabled={companies.length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <Plus size={18} />
          Nueva sucursal
        </button>
      </div>

      {/* Indicadores de sucursales. */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Sucursales registradas
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {branches.length}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <Store size={20} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Sucursales activas
              </p>

              <p className="mt-2 text-2xl font-bold text-emerald-600">
                {activeBranches}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={20} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Empresas con sucursales
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {companiesWithBranches}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <Building2 size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Mensaje de error general. */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0 text-red-600"
            />

            <div>
              <p className="font-semibold text-red-800">
                No fue posible completar la operación
              </p>

              <p className="mt-1 text-sm text-red-700">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de sucursales. */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Registro de sucursales
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Consulta y administra las sedes registradas.
            </p>
          </div>

          {/* Búsqueda y filtro por empresa.
              Se reutiliza el mismo patrón visual del Historial. */}
          <div className="grid w-full gap-3 sm:grid-cols-2 md:w-auto">
            <div className="relative md:w-72">
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
                placeholder="Buscar sucursal o dirección..."
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            <div className="relative md:w-60">
              <Filter
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={companyFilter}
                onChange={(event) =>
                  setCompanyFilter(
                    event.target.value,
                  )
                }
                className="w-full appearance-none rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-8 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              >
                <option value="">
                  Todas las empresas
                </option>

                {companies.map(
                  (company) => (
                    <option
                      key={company.id}
                      value={company.id}
                    >
                      {company.name}
                    </option>
                  ),
                )}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Sucursal
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Empresa
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Dirección
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Teléfono
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Estado
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [1, 2, 3, 4].map((row) => (
                  <tr key={row}>
                    {Array.from({ length: 6 }).map((_, index) => (
                      <td
                        key={index}
                        className="px-5 py-5"
                      >
                        <div className="h-4 animate-pulse rounded bg-slate-100" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                filteredBranches.map((branch) => {
                  const company = companies.find(
                    (item) =>
                      item.id === branch.company_id,
                  )

                  return (
                    <tr
                      key={branch.id}
                      className="transition-colors hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900">
                          {branch.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          ID #{branch.id}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {company?.name ??
                          `Empresa #${branch.company_id}`}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {branch.address || (
                          <span className="text-slate-400">
                            Sin dirección
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {branch.phone || (
                          <span className="text-slate-400">
                            Sin teléfono
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${branch.is_active
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'
                            }`}
                        >
                          {branch.is_active
                            ? 'Activa'
                            : 'Inactiva'}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              openEditForm(branch)
                            }
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
                              void handleToggleStatus(branch)
                            }
                            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${branch.is_active
                              ? 'border-red-200 text-red-600 hover:bg-red-50'
                              : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                              }`}
                          >
                            {branch.is_active ? (
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
                  )
                })
              )}
            </tbody>
          </table>

          {!loading && filteredBranches.length === 0 && (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <MapPin
                size={34}
                className="text-slate-300"
              />

              <h3 className="mt-3 font-semibold text-slate-900">
                No se encontraron sucursales
              </h3>

              <p className="mt-1 max-w-sm text-sm text-slate-500">
                Prueba con otro nombre, empresa, dirección o teléfono.
              </p>
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
        panelClassName="max-w-lg"
      >

        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {editingId === null
                ? 'Nueva sucursal'
                : 'Editar sucursal'}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {editingId === null
                ? 'Registra una nueva sede en MatrixFlow.'
                : 'Actualiza los datos de la sucursal.'}
            </p>
          </div>

          <button
            type="button"
            onClick={resetForm}
            disabled={saving}
            aria-label="Cerrar formulario"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div>
            <label
              htmlFor="branch-company"
              className="text-sm font-semibold text-slate-700"
            >
              Empresa
            </label>

            {editingId === null ? (
              <select
                id="branch-company"
                value={companyId}
                onChange={(event) =>
                  setCompanyId(event.target.value)
                }
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-slate-100"
              >
                <option value="">
                  Selecciona una empresa
                </option>

                {companies.map((company) => (
                  <option
                    key={company.id}
                    value={company.id}
                  >
                    {company.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-600">
                {companies.find(
                  (company) =>
                    company.id === Number(companyId),
                )?.name ?? `Empresa #${companyId}`}
              </div>
            )}

            {editingId !== null && (
              <p className="mt-2 text-xs text-slate-400">
                La empresa asociada no puede modificarse.
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="branch-name"
              className="text-sm font-semibold text-slate-700"
            >
              Nombre de la sucursal
            </label>

            <input
              id="branch-name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Ej. Sucursal Cusco"
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-slate-100"
            />
          </div>

          <div>
            <label
              htmlFor="branch-address"
              className="text-sm font-semibold text-slate-700"
            >
              Dirección
            </label>

            <input
              id="branch-address"
              type="text"
              value={address}
              onChange={(event) =>
                setAddress(event.target.value)
              }
              placeholder="Av. Principal 123"
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-slate-100"
            />
          </div>

          <div>
            <label
              htmlFor="branch-phone"
              className="text-sm font-semibold text-slate-700"
            >
              Teléfono
            </label>

            <input
              id="branch-phone"
              type="tel"
              value={phone}
              onChange={(event) =>
                setPhone(event.target.value)
              }
              placeholder="999 999 999"
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-slate-100"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={resetForm}
            disabled={saving}
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={
              saving ||
              (
                editingId === null &&
                companies.length === 0
              )
            }
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? 'Guardando...'
              : editingId === null
                ? 'Crear sucursal'
                : 'Guardar cambios'}
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default Sucursales