// ============================================================
// MatrixFlow Enterprise
// Página de administración de sucursales
// ============================================================
//
// Esta página trabaja con datos reales del backend.
//
// Flujo:
//
// React
//   ↓
// getCompanies() / getBranches()
//   ↓
// authenticatedFetch()
//   ↓
// JWT
//   ↓
// FastAPI
//   ↓
// PostgreSQL
//
// IMPORTANTE:
// La autorización real continúa en FastAPI.
// Esta pantalla está destinada al Administrador.
// ============================================================

import { useEffect, useState } from 'react'

import {
  createBranch,
  getBranches,
  getCompanies,
  type Branch,
  type Company,
} from '../services/api'

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

function Sucursales() {
  // ----------------------------------------------------------
  // DATOS OBTENIDOS DEL BACKEND
  // ----------------------------------------------------------

  // Lista real de sucursales almacenadas en PostgreSQL.
  const [branches, setBranches] = useState<Branch[]>([])

  // Lista real de empresas almacenadas en PostgreSQL.
  // Se utiliza para seleccionar company_id al crear
  // una sucursal.
  const [companies, setCompanies] = useState<Company[]>([])

  // ----------------------------------------------------------
  // ESTADOS DE INTERFAZ
  // ----------------------------------------------------------

  // Indica si estamos cargando los datos iniciales.
  const [loading, setLoading] = useState(true)

  // Contiene errores producidos al consultar o registrar datos.
  const [error, setError] = useState('')

  // Controla la visibilidad del formulario.
  const [showForm, setShowForm] = useState(false)

  // Indica si se está enviando el formulario.
  const [saving, setSaving] = useState(false)

  // Texto utilizado para filtrar la tabla.
  const [search, setSearch] = useState('')

  // ----------------------------------------------------------
  // CAMPOS DEL FORMULARIO
  // ----------------------------------------------------------

  // Empresa seleccionada.
  const [companyId, setCompanyId] = useState('')

  // Nombre de la sucursal.
  const [name, setName] = useState('')

  // Dirección física.
  const [address, setAddress] = useState('')

  // Teléfono.
  const [phone, setPhone] = useState('')

  // ==========================================================
  // CARGAR DATOS DESDE EL BACKEND
  // ==========================================================

  useEffect(() => {
    // Esta función obtiene empresas y sucursales reales.
    const loadData = async () => {
      try {
        // Mostramos estado de carga.
        setLoading(true)

        // Limpiamos errores anteriores.
        setError('')

        // Consultamos ambos recursos en paralelo.
        const [
          companiesData,
          branchesData,
        ] = await Promise.all([
          getCompanies(),
          getBranches(),
        ])

        // Guardamos los resultados en el estado de React.
        setCompanies(companiesData)
        setBranches(branchesData)
      } catch (err) {
        // Convertimos el error a un mensaje visible.
        setError(
          err instanceof Error
            ? err.message
            : 'No se pudieron cargar los datos.'
        )
      } finally {
        // Finalizamos el estado de carga.
        setLoading(false)
      }
    }

    // Ejecutamos la carga inicial.
    loadData()
  }, [])

  // ==========================================================
  // SUCURSALES FILTRADAS
  // ==========================================================

  const filteredBranches = branches.filter(
    (branch) => {
      // Buscamos también por nombre de la empresa.
      const company = companies.find(
        (item) => item.id === branch.company_id
      )

      const companyName =
        company?.name ?? ''

      // Construimos el texto que será utilizado
      // por el buscador.
      const searchableText = [
        branch.name,
        branch.address ?? '',
        branch.phone ?? '',
        companyName,
      ]
        .join(' ')
        .toLowerCase()

      return searchableText.includes(
        search.toLowerCase()
      )
    }
  )

  // ==========================================================
  // INDICADORES
  // ==========================================================

  // Número de sucursales activas.
  const activeBranches = branches.filter(
    (branch) => branch.is_active
  ).length

  // Número de empresas que tienen sucursales registradas.
  const companiesWithBranches = new Set(
    branches.map((branch) => branch.company_id)
  ).size

  // ==========================================================
  // LIMPIAR FORMULARIO
  // ==========================================================

  const resetForm = () => {
    // Limpiamos todos los campos.
    setCompanyId('')
    setName('')
    setAddress('')
    setPhone('')

    // Cerramos el formulario.
    setShowForm(false)

    // Limpiamos errores anteriores.
    setError('')
  }

  // ==========================================================
  // REGISTRAR SUCURSAL
  // ==========================================================

  const handleSave = async () => {
    // Validamos la empresa.
    if (!companyId) {
      setError(
        'Selecciona la empresa a la que pertenece la sucursal.'
      )
      return
    }

    // Validamos el nombre.
    if (!name.trim()) {
      setError(
        'El nombre de la sucursal es obligatorio.'
      )
      return
    }

    try {
      // Indicamos que estamos guardando.
      setSaving(true)

      // Limpiamos errores anteriores.
      setError('')

      // Enviamos los datos al backend.
      await createBranch({
        name: name.trim(),
        company_id: Number(companyId),
        address: address.trim() || null,
        phone: phone.trim() || null,
      })

      // Después de crear la sucursal,
      // volvemos a consultar PostgreSQL.
      //
      // Esto evita depender de una simulación local.
      const updatedBranches = await getBranches()

      // Actualizamos la tabla con los datos reales.
      setBranches(updatedBranches)

      // Limpiamos y cerramos el formulario.
      resetForm()
    } catch (err) {
      // Mostramos el mensaje proporcionado por FastAPI.
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo registrar la sucursal.'
      )
    } finally {
      // Terminamos el estado de guardado.
      setSaving(false)
    }
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div>

      {/* ====================================================
          ENCABEZADO
          ==================================================== */}

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
            setError('')
            setShowForm(true)
          }}
          className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Nueva sucursal
        </button>

      </div>

      {/* ====================================================
          ERROR GENERAL
          ==================================================== */}

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ====================================================
          RESUMEN
          ==================================================== */}

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
            Empresas con sucursales
          </p>

          <p className="mt-2 text-2xl font-bold text-blue-600">
            {companiesWithBranches}
          </p>

        </div>

      </div>

      {/* ====================================================
          BUSCADOR
          ==================================================== */}

      <div className="mb-6">

        <input
          type="text"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Buscar sucursal, empresa, dirección..."
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 md:max-w-md"
        />

      </div>

      {/* ====================================================
          TABLA
          ==================================================== */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        <div className="overflow-x-auto">

          {loading ? (
            <div className="p-8 text-center text-slate-500">
              Cargando sucursales...
            </div>
          ) : (
            <table className="w-full text-left">

              <thead className="border-b bg-slate-50">

                <tr>

                  <th className="px-6 py-4 text-sm font-semibold">
                    Sucursal
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold">
                    Empresa
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold">
                    Dirección
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold">
                    Teléfono
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold">
                    Estado
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y">

                {filteredBranches.map(
                  (branch) => {
                    // Buscamos el nombre de la empresa
                    // correspondiente al company_id.
                    const company =
                      companies.find(
                        (item) =>
                          item.id ===
                          branch.company_id
                      )

                    return (
                      <tr
                        key={branch.id}
                        className="hover:bg-slate-50"
                      >

                        <td className="px-6 py-4 font-medium text-slate-800">
                          {branch.name}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {company?.name ??
                            `Empresa #${branch.company_id}`}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {branch.address ||
                            'Sin dirección'}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {branch.phone ||
                            'Sin teléfono'}
                        </td>

                        <td className="px-6 py-4">

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${branch.is_active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                              }`}
                          >
                            {branch.is_active
                              ? 'Activa'
                              : 'Inactiva'}
                          </span>

                        </td>

                      </tr>
                    )
                  }
                )}

              </tbody>

            </table>
          )}

          {!loading &&
            filteredBranches.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                No se encontraron sucursales.
              </div>
            )}

        </div>

      </div>

      {/* ====================================================
          MODAL DE NUEVA SUCURSAL
          ==================================================== */}

      {showForm && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">

            <div className="mb-6 flex items-center justify-between">

              <h2 className="text-xl font-bold text-slate-900">
                Nueva sucursal
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

              {/* EMPRESA */}

              <div>

                <label className="text-sm font-medium text-slate-700">
                  Empresa
                </label>

                <select
                  value={companyId}
                  onChange={(event) =>
                    setCompanyId(
                      event.target.value
                    )
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
                >

                  <option value="">
                    Selecciona una empresa
                  </option>

                  {companies.map(
                    (company) => (
                      <option
                        key={company.id}
                        value={company.id}
                      >
                        {company.name}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* NOMBRE */}

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

              {/* DIRECCIÓN */}

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

              {/* TELÉFONO */}

              <div>

                <label className="text-sm font-medium text-slate-700">
                  Teléfono
                </label>

                <input
                  type="tel"
                  value={phone}
                  onChange={(event) =>
                    setPhone(event.target.value)
                  }
                  placeholder="999 999 999"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                />

              </div>

            </div>

            {/* BOTONES */}

            <div className="mt-6 flex justify-end gap-3">

              <button
                type="button"
                onClick={resetForm}
                disabled={saving}
                className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={
                  saving ||
                  companies.length === 0
                }
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? 'Guardando...'
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