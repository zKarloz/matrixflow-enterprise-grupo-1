import { useEffect, useState } from 'react'

import {
  createBranch,
  getBranches,
  getCompanies,
  type Branch,
  type Company,
} from '../services/api'

function Sucursales() {
  // ============================================================
  // ESTADO PRINCIPAL
  // ============================================================

  // Lista de sucursales disponibles.
  const [branches, setBranches] = useState<Branch[]>([])

  // Lista de empresas disponibles para asociar una sucursal.
  const [companies, setCompanies] = useState<Company[]>([])

  // Controla el estado de carga inicial.
  const [loading, setLoading] = useState(true)

  // Guarda los mensajes de error que deben mostrarse al usuario.
  const [error, setError] = useState('')

  // Controla la apertura del formulario.
  const [showForm, setShowForm] = useState(false)

  // Indica si el formulario está procesando el registro.
  const [saving, setSaving] = useState(false)

  // Texto utilizado para filtrar las sucursales.
  const [search, setSearch] = useState('')

  // ============================================================
  // CAMPOS DEL FORMULARIO
  // ============================================================

  // Empresa seleccionada.
  const [companyId, setCompanyId] = useState('')

  // Nombre de la sucursal.
  const [name, setName] = useState('')

  // Dirección física.
  const [address, setAddress] = useState('')

  // Teléfono de contacto.
  const [phone, setPhone] = useState('')

  // ============================================================
  // CARGA INICIAL
  // ============================================================

  useEffect(() => {
    const loadData = async () => {
      try {
        // Activamos el estado de carga.
        setLoading(true)

        // Limpiamos errores anteriores.
        setError('')

        // Empresas y sucursales pueden consultarse en paralelo.
        const [companiesData, branchesData] = await Promise.all([
          getCompanies(),
          getBranches(),
        ])

        // Guardamos los resultados.
        setCompanies(companiesData)
        setBranches(branchesData)
      } catch (err) {
        // Convertimos el error en un mensaje comprensible.
        setError(
          err instanceof Error
            ? err.message
            : 'No se pudieron cargar las sucursales.',
        )
      } finally {
        // Finalizamos el estado de carga.
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // ============================================================
  // SUCURSALES FILTRADAS
  // ============================================================

  const filteredBranches = branches.filter((branch) => {
    // Buscamos la empresa asociada a la sucursal.
    const company = companies.find(
      (item) => item.id === branch.company_id,
    )

    // Obtenemos el nombre de la empresa para permitir
    // búsquedas también por este dato.
    const companyName = company?.name ?? ''

    // Construimos un único texto de búsqueda.
    const searchableText = [
      branch.name,
      branch.address ?? '',
      branch.phone ?? '',
      companyName,
    ]
      .join(' ')
      .toLowerCase()

    return searchableText.includes(search.toLowerCase())
  })

  // ============================================================
  // INDICADORES
  // ============================================================

  // Cantidad total de sucursales registradas.
  const activeBranches = branches.filter(
    (branch) => branch.is_active,
  ).length

  // Cantidad de empresas que tienen al menos una sucursal.
  const companiesWithBranches = new Set(
    branches.map((branch) => branch.company_id),
  ).size

  // ============================================================
  // LIMPIAR FORMULARIO
  // ============================================================

  const resetForm = () => {
    // Restablecemos todos los campos.
    setCompanyId('')
    setName('')
    setAddress('')
    setPhone('')

    // Cerramos el formulario.
    setShowForm(false)

    // Limpiamos mensajes anteriores.
    setError('')
  }

  // ============================================================
  // REGISTRAR SUCURSAL
  // ============================================================

  const handleSave = async () => {
    // Validamos que exista una empresa seleccionada.
    if (!companyId) {
      setError(
        'Selecciona la empresa a la que pertenece la sucursal.',
      )
      return
    }

    // Validamos que exista un nombre.
    if (!name.trim()) {
      setError('El nombre de la sucursal es obligatorio.')
      return
    }

    try {
      // Activamos el estado de guardado.
      setSaving(true)

      // Limpiamos errores anteriores.
      setError('')

      // Registramos la nueva sucursal.
      await createBranch({
        name: name.trim(),
        company_id: Number(companyId),
        address: address.trim() || null,
        phone: phone.trim() || null,
      })

      // Volvemos a consultar las sucursales para mostrar
      // inmediatamente el registro actualizado.
      const updatedBranches = await getBranches()
      setBranches(updatedBranches)

      // Limpiamos y cerramos el formulario.
      resetForm()
    } catch (err) {
      // Mostramos el mensaje correspondiente.
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo registrar la sucursal.',
      )
    } finally {
      // Finalizamos el estado de guardado.
      setSaving(false)
    }
  }

  // ============================================================
  // RENDERIZADO
  // ============================================================

  return (
    <div className="min-h-full bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">

        {/* ========================================================
            ENCABEZADO
            ======================================================== */}

        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="mb-1 text-sm font-medium text-slate-500">
              Gestión empresarial
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Sucursales
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Administra las sedes y puntos de operación de las empresas.
            </p>
          </div>

          {/* Botón principal para registrar una nueva sucursal. */}
          <button
            type="button"
            onClick={() => {
              // Limpiamos cualquier error antes de abrir el formulario.
              setError('')

              // Abrimos el formulario.
              setShowForm(true)
            }}
            disabled={companies.length === 0}
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            + Nueva sucursal
          </button>
        </div>

        {/* ========================================================
            INDICADORES
            ======================================================== */}

        <div className="mb-6 grid gap-4 md:grid-cols-3">

          {/* Total de sucursales. */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Sucursales registradas
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {branches.length}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 font-bold text-slate-600">
                S
              </div>
            </div>
          </div>

          {/* Sucursales activas. */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
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
                ✓
              </div>
            </div>
          </div>

          {/* Empresas con al menos una sucursal. */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Empresas con sucursales
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {companiesWithBranches}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 font-bold text-slate-600">
                E
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            ERROR GENERAL
            ======================================================== */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 font-semibold text-red-600">
                !
              </div>

              <div>
                <h2 className="font-semibold text-red-800">
                  No fue posible completar la operación
                </h2>

                <p className="mt-1 text-sm text-red-700">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TABLA Y BUSCADOR
            ======================================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Cabecera de la tabla. */}
          <div className="flex flex-col gap-4 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Registro de sucursales
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Consulta las sedes, empresas y datos de contacto.
              </p>
            </div>

            {/* Buscador integrado en la tabla. */}
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
                placeholder="Buscar sucursal, empresa o dirección..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
              />
            </div>
          </div>

          {/* ======================================================
              TABLA
              ====================================================== */}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Sucursal
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Empresa
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Dirección
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Teléfono
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Estado
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {/* Estado de carga con filas provisionales. */}
                {loading ? (
                  [1, 2, 3, 4].map((row) => (
                    <tr key={row}>
                      {Array.from({ length: 5 }).map((_, index) => (
                        <td key={index} className="px-6 py-5">
                          <div className="h-4 animate-pulse rounded bg-slate-100" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  filteredBranches.map((branch) => {
                    // Buscamos la empresa relacionada con la sucursal.
                    const company = companies.find(
                      (item) => item.id === branch.company_id,
                    )

                    return (
                      <tr
                        key={branch.id}
                        className="transition-colors hover:bg-slate-50"
                      >
                        {/* Nombre de la sucursal. */}
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-900">
                            {branch.name}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            ID #{branch.id}
                          </p>
                        </td>

                        {/* Empresa relacionada. */}
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {company?.name ??
                            `Empresa #${branch.company_id}`}
                        </td>

                        {/* Dirección de la sucursal. */}
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {branch.address || (
                            <span className="text-slate-400">
                              Sin dirección
                            </span>
                          )}
                        </td>

                        {/* Teléfono de contacto. */}
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {branch.phone || (
                            <span className="text-slate-400">
                              Sin teléfono
                            </span>
                          )}
                        </td>

                        {/* Estado actual de la sucursal. */}
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${branch.is_active
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-slate-100 text-slate-500'
                              }`}
                          >
                            {branch.is_active
                              ? 'Activa'
                              : 'Inactiva'}
                          </span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>

            {/* Estado vacío cuando no existen coincidencias. */}
            {!loading && filteredBranches.length === 0 && (
              <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  —
                </div>

                <h3 className="font-semibold text-slate-900">
                  No se encontraron sucursales
                </h3>

                <p className="mt-1 max-w-sm text-sm text-slate-500">
                  Prueba con otro nombre, empresa, dirección o teléfono.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================
            MODAL DE NUEVA SUCURSAL
            ======================================================== */}

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">

              {/* Encabezado del formulario. */}
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Red empresarial
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-slate-900">
                    Nueva sucursal
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  aria-label="Cerrar formulario"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed"
                >
                  ×
                </button>
              </div>

              {/* Campos del formulario. */}
              <div className="space-y-5 p-6">

                {/* Empresa. */}
                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Empresa
                  </label>

                  <select
                    value={companyId}
                    onChange={(event) =>
                      setCompanyId(event.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
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
                </div>

                {/* Nombre. */}
                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Nombre de la sucursal
                  </label>

                  <input
                    type="text"
                    value={name}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                    placeholder="Ej. Sucursal Cusco"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                {/* Dirección. */}
                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Dirección
                  </label>

                  <input
                    type="text"
                    value={address}
                    onChange={(event) =>
                      setAddress(event.target.value)
                    }
                    placeholder="Av. Principal 123"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                {/* Teléfono. */}
                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Teléfono
                  </label>

                  <input
                    type="tel"
                    value={phone}
                    onChange={(event) =>
                      setPhone(event.target.value)
                    }
                    placeholder="999 999 999"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                {/* Acciones del formulario. */}
                <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={saving}
                    className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={
                      saving || companies.length === 0
                    }
                    className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {saving ? 'Guardando...' : 'Guardar sucursal'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Sucursales