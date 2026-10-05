import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  Building2,
  Mail,
  MapPin,
  Package,
  Pencil,
  Phone,
  Plus,
  Store,
  X,
} from 'lucide-react'

import { useNavigate } from 'react-router-dom'

import Modal from '../components/ui/Modal'
import CompanyInfoCard from '../components/company/CompanyInfoCard'

import {
  createCompany,
  getCompanies,
  updateCompany,
  type Company,
} from '../services/api'


function Empresa() {
  // Permite abrir los módulos internos de Empresa.
  const navigate = useNavigate()

  // Empresas reales obtenidas desde FastAPI.
  const [companies, setCompanies] =
    useState<Company[]>([])

  // Empresa seleccionada actualmente.
  const [
    selectedCompanyId,
    setSelectedCompanyId,
  ] = useState('')

  // Estados generales.
  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  // Modal utilizado tanto para crear como para editar.
  const [showForm, setShowForm] =
    useState(false)

  // Cuando contiene un ID, el formulario está en modo edición.
  // Si es null, el formulario crea una nueva empresa.
  const [editingCompanyId, setEditingCompanyId] =
    useState<number | null>(null)

  const [saving, setSaving] =
    useState(false)

  const [formError, setFormError] =
    useState('')

  // Campos del formulario.
  const [name, setName] =
    useState('')

  const [taxId, setTaxId] =
    useState('')

  const [address, setAddress] =
    useState('')

  const [phone, setPhone] =
    useState('')

  const [email, setEmail] =
    useState('')


  // ----------------------------------------------------------
  // CARGA DE EMPRESAS
  // ----------------------------------------------------------

  const loadCompanies = async () => {
    try {
      setLoading(true)
      setError('')

      const data =
        await getCompanies()

      setCompanies(data)

      // Conservamos la selección actual cuando todavía existe.
      setSelectedCompanyId(
        (currentId) => {
          const currentExists =
            data.some(
              (company) =>
                String(company.id) ===
                currentId,
            )

          if (currentExists) {
            return currentId
          }

          return data.length > 0
            ? String(data[0].id)
            : ''
        },
      )
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No se pudo cargar la información de las empresas.',
      )
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    void loadCompanies()
  }, [])


  // Empresa activa en la pantalla.
  const selectedCompany =
    useMemo(
      () =>
        companies.find(
          (company) =>
            company.id ===
            Number(
              selectedCompanyId,
            ),
        ) ?? null,
      [
        companies,
        selectedCompanyId,
      ],
    )


  // ----------------------------------------------------------
  // FORMULARIO DE EMPRESA
  // ----------------------------------------------------------

  const resetForm = () => {
    // Cerramos el modal y devolvemos todos los estados
    // a sus valores iniciales.
    setShowForm(false)
    setEditingCompanyId(null)
    setSaving(false)
    setFormError('')
    setName('')
    setTaxId('')
    setAddress('')
    setPhone('')
    setEmail('')
  }


  const openCreateForm = () => {
    // Abrimos el formulario vacío en modo creación.
    resetForm()
    setShowForm(true)
  }


  const openEditForm = () => {
    if (!selectedCompany) {
      return
    }

    // Precargamos en el formulario los datos actuales
    // para que el usuario pueda modificarlos.
    setEditingCompanyId(
      selectedCompany.id,
    )
    setName(selectedCompany.name)
    setTaxId(selectedCompany.tax_id)
    setAddress(
      selectedCompany.address ?? '',
    )
    setPhone(
      selectedCompany.phone ?? '',
    )
    setEmail(
      selectedCompany.email ?? '',
    )
    setFormError('')
    setShowForm(true)
  }


  const handleSave = async () => {
    if (!name.trim()) {
      setFormError(
        'El nombre de la empresa es obligatorio.',
      )
      return
    }

    if (!taxId.trim()) {
      setFormError(
        'El RUC o identificador tributario es obligatorio.',
      )
      return
    }

    try {
      setSaving(true)
      setFormError('')

      // Construimos una sola estructura de datos para crear
      // o actualizar una empresa.
      const companyData = {
        name: name.trim(),
        tax_id: taxId.trim(),
        address:
          address.trim() || null,
        phone:
          phone.trim() || null,
        email:
          email.trim() || null,
      }

      let companyIdToSelect: number

      if (editingCompanyId !== null) {
        // Modo edición: actualizamos la empresa existente.
        const updatedCompany =
          await updateCompany(
            editingCompanyId,
            companyData,
          )

        companyIdToSelect =
          updatedCompany.id
      } else {
        // Modo creación: registramos una nueva empresa.
        const createdCompany =
          await createCompany(
            companyData,
          )

        companyIdToSelect =
          createdCompany.id
      }

      // Recargamos para reflejar exactamente lo almacenado
      // por PostgreSQL y mantenemos seleccionada la empresa
      // recién creada o editada.
      const updatedCompanies =
        await getCompanies()

      setCompanies(
        updatedCompanies,
      )

      setSelectedCompanyId(
        String(companyIdToSelect),
      )

      resetForm()
    } catch (requestError) {
      setFormError(
        requestError instanceof Error
          ? requestError.message
          : editingCompanyId !== null
            ? 'No se pudo actualizar la empresa.'
            : 'No se pudo registrar la empresa.',
      )
    } finally {
      setSaving(false)
    }
  }


  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* ======================================================
          ENCABEZADO
          ====================================================== */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="max-w-2xl text-sm text-slate-500">
            Administra las empresas registradas y accede a sus
            módulos de sucursales y productos.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800"
        >
          <Plus size={18} />
          Nueva empresa
        </button>
      </div>


      {/* Mensaje de error general. */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}


      {/* ======================================================
          SELECTOR DE EMPRESA
          ====================================================== */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Building2
                size={20}
                className="text-blue-600"
              />

              <h2 className="text-lg font-semibold text-slate-900">
                Empresa seleccionada
              </h2>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Selecciona la empresa cuya información deseas consultar.
            </p>
          </div>

          <div className="w-full lg:max-w-sm">
            <label
              htmlFor="company-selector"
              className="text-xs font-semibold uppercase tracking-wide text-slate-400"
            >
              Empresa
            </label>

            <select
              id="company-selector"
              value={selectedCompanyId}
              onChange={(event) =>
                setSelectedCompanyId(
                  event.target.value,
                )
              }
              disabled={
                loading ||
                companies.length === 0
              }
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
            >
              {companies.length === 0 ? (
                <option value="">
                  No hay empresas registradas
                </option>
              ) : (
                companies.map(
                  (company) => (
                    <option
                      key={company.id}
                      value={company.id}
                    >
                      {company.name}
                    </option>
                  ),
                )
              )}
            </select>
          </div>
        </div>
      </section>


      {/* ======================================================
          INFORMACIÓN DE LA EMPRESA
          ====================================================== */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map(
            (item) => (
              <div
                key={item}
                className="h-28 animate-pulse rounded-xl bg-slate-100"
              />
            ),
          )}
        </div>
      ) : selectedCompany ? (
        <>
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Building2 size={22} />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      {selectedCompany.name}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Información corporativa registrada en MatrixFlow.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={openEditForm}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <Pencil size={16} />
                  Editar empresa
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2 xl:grid-cols-4">
              <CompanyInfoCard
                label="RUC"
                value={
                  selectedCompany.tax_id
                }
              />

              <CompanyInfoCard
                label="Teléfono"
                value={
                  selectedCompany.phone ??
                  'No registrado'
                }
              />

              <CompanyInfoCard
                label="Correo electrónico"
                value={
                  selectedCompany.email ??
                  'No registrado'
                }
              />

              <CompanyInfoCard
                label="Domicilio fiscal"
                value={
                  selectedCompany.address ??
                  'No registrado'
                }
              />
            </div>
          </section>


          {/* ==================================================
              ACCESOS A LOS SUBMÓDULOS
              ================================================== */}
          <div className="grid gap-5 md:grid-cols-2">
            <button
              type="button"
              onClick={() =>
                navigate(
                  '/empresa/sucursales',
                )
              }
              className="
                company-module-card
                company-module-card-branches
                group
                rounded-2xl
                border
                border-slate-200
                bg-white
                p-6
                text-left
                shadow-sm
              "
            >
              <div className="flex items-start justify-between gap-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Store size={22} />
                </div>

                <span className="company-module-arrow text-xl text-slate-300 group-hover:text-blue-500">
                  →
                </span>
              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-900">
                Sucursales
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Administra las sedes y puntos de operación asociados
                a las empresas registradas.
              </p>
            </button>


            <button
              type="button"
              onClick={() =>
                navigate(
                  '/empresa/productos',
                )
              }
              className="
                company-module-card
                company-module-card-products
                group
                rounded-2xl
                border
                border-slate-200
                bg-white
                p-6
                text-left
                shadow-sm
              "
            >
              <div className="flex items-start justify-between gap-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Package size={22} />
                </div>

                <span className="company-module-arrow text-xl text-slate-300 group-hover:text-emerald-500">
                  →
                </span>
              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-900">
                Productos
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Consulta y administra el catálogo de productos y
                sus categorías.
              </p>
            </button>
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Building2
            size={34}
            className="mx-auto text-slate-300"
          />

          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            No hay empresas registradas
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Crea la primera empresa para comenzar a organizar
            sucursales y productos.
          </p>

          <button
            type="button"
            onClick={openCreateForm}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <Plus size={17} />
            Crear empresa
          </button>
        </div>
      )}


      {/* ======================================================
          MODAL CREAR / EDITAR EMPRESA
          ====================================================== */}
      <Modal
        open={showForm}
        onClose={() => {
          if (!saving) {
            resetForm()
          }
        }}
        panelClassName="max-w-xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {editingCompanyId !== null
                ? 'Editar empresa'
                : 'Nueva empresa'}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {editingCompanyId !== null
                ? 'Actualiza la información corporativa principal.'
                : 'Registra la información corporativa principal.'}
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
          {formError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {formError}
            </div>
          )}


          <div>
            <label className="text-sm font-semibold text-slate-700">
              Nombre o razón social
            </label>

            <div className="relative mt-2">
              <Building2
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value,
                  )
                }
                disabled={saving}
                placeholder="Ej. Empresa Comercial SAC"
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>


          <div>
            <label className="text-sm font-semibold text-slate-700">
              RUC
            </label>

            <input
              type="text"
              value={taxId}
              onChange={(event) =>
                setTaxId(
                  event.target.value,
                )
              }
              disabled={saving}
              placeholder="Ej. 20123456789"
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>


          <div>
            <label className="text-sm font-semibold text-slate-700">
              Domicilio fiscal
            </label>

            <div className="relative mt-2">
              <MapPin
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={address}
                onChange={(event) =>
                  setAddress(
                    event.target.value,
                  )
                }
                disabled={saving}
                placeholder="Ej. Av. Javier Prado 1234, Lima"
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>


          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Teléfono
              </label>

              <div className="relative mt-2">
                <Phone
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="tel"
                  value={phone}
                  onChange={(event) =>
                    setPhone(
                      event.target.value,
                    )
                  }
                  disabled={saving}
                  placeholder="999 999 999"
                  className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>


            <div>
              <label className="text-sm font-semibold text-slate-700">
                Correo electrónico
              </label>

              <div className="relative mt-2">
                <Mail
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value,
                    )
                  }
                  disabled={saving}
                  placeholder="empresa@correo.com"
                  className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
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
            onClick={() =>
              void handleSave()
            }
            disabled={saving}
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? 'Guardando...'
              : editingCompanyId !== null
                ? 'Guardar cambios'
                : 'Crear empresa'}
          </button>
        </div>
      </Modal>
    </div>
  )
}


export default Empresa
