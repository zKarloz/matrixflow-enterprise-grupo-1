import { useEffect, useMemo, useState } from 'react'

// Modal compartido para centrar formularios y cubrir todo el viewport.
import Modal from '../components/ui/Modal'
import {
  formatDateTime,
  parseApiTimestamp,
} from '../utils/date'
import {
  AlertCircle,
  Banknote,
  Building2,
  Filter,
  Package,
  Plus,
  ReceiptText,
  Search,
  ShoppingCart,
  Trash2,
  UserRound,
  X,
} from 'lucide-react'

import {
  createSale,
  getBranches,
  getCurrentUser,
  getProducts,
  getSales,
  type Branch,
  type CreateSaleData,
  type Product,
  type Sale,
} from '../services/api'


interface SaleDraftDetail {
  productId: string
  quantity: string
}


function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
  }).format(value)
}




function Ventas() {
  // Datos reales obtenidos desde FastAPI.
  const [sales, setSales] = useState<Sale[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [products, setProducts] = useState<Product[]>([])

  // Estados generales.
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  // Sucursal utilizada para filtrar el historial de ventas.
  // Una cadena vacía representa "Todas las sucursales".
  const [branchFilter, setBranchFilter] =
    useState('')

  // Estados del formulario de nueva venta.
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [selectedBranchId, setSelectedBranchId] = useState('')

  // Una venta puede contener varios productos.
  const [details, setDetails] = useState<SaleDraftDetail[]>([
    {
      productId: '',
      quantity: '1',
    },
  ])


  // ----------------------------------------------------------
  // CARGA DE DATOS
  // ----------------------------------------------------------

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')

      const [
        salesData,
        branchesData,
        productsData,
      ] = await Promise.all([
        getSales(),
        getBranches(),
        getProducts(),
      ])

      setSales(salesData)
      setBranches(branchesData)
      setProducts(productsData)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No se pudieron cargar los datos de ventas.',
      )
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    void loadData()
  }, [])


  // ----------------------------------------------------------
  // DATOS DERIVADOS
  // ----------------------------------------------------------

  const activeBranches = useMemo(
    () =>
      branches.filter(
        (branch) => branch.is_active,
      ),
    [branches],
  )


  const activeProducts = useMemo(
    () =>
      products.filter(
        (product) => product.is_active,
      ),
    [products],
  )


  const totalSales = useMemo(
    () =>
      sales.reduce(
        (sum, sale) =>
          sum + Number(sale.total),
        0,
      ),
    [sales],
  )


  const averageTicket =
    sales.length > 0
      ? totalSales / sales.length
      : 0


  const filteredSales = useMemo(() => {
    const term = search
      .trim()
      .toLowerCase()

    return [...sales]
      .sort(
        (a, b) =>
          parseApiTimestamp(
            b.created_at,
          ).getTime() -
          parseApiTimestamp(
            a.created_at,
          ).getTime(),
      )
      .filter((sale) => {
        const branch = branches.find(
          (item) =>
            item.id === sale.branch_id,
        )

        const searchableText = [
          sale.id,
          sale.company_id,
          sale.branch_id,
          sale.user_id,
          sale.total,
          branch?.name ?? '',
          formatDateTime(sale.created_at),
        ]
          .join(' ')
          .toLowerCase()

        const matchesSearch =
          searchableText.includes(term)

        const matchesBranch =
          !branchFilter ||
          sale.branch_id ===
          Number(branchFilter)

        return (
          matchesSearch &&
          matchesBranch
        )
      })
  }, [
    sales,
    branches,
    search,
    branchFilter,
  ])


  const previewTotal = useMemo(
    () =>
      details.reduce(
        (total, detail) => {
          const product = activeProducts.find(
            (item) =>
              item.id ===
              Number(detail.productId),
          )

          const quantity =
            Number(detail.quantity) || 0

          if (!product) {
            return total
          }

          return (
            total +
            Number(product.price) *
            quantity
          )
        },
        0,
      ),
    [details, activeProducts],
  )


  // ----------------------------------------------------------
  // FORMULARIO
  // ----------------------------------------------------------

  const resetForm = () => {
    setShowForm(false)
    setSaving(false)
    setFormError('')
    setSelectedBranchId('')
    setDetails([
      {
        productId: '',
        quantity: '1',
      },
    ])
  }


  const openCreateForm = () => {
    setFormError('')

    setSelectedBranchId(
      activeBranches.length > 0
        ? String(activeBranches[0].id)
        : '',
    )

    setDetails([
      {
        productId: '',
        quantity: '1',
      },
    ])

    setShowForm(true)
  }


  const updateDetail = (
    index: number,
    field: keyof SaleDraftDetail,
    value: string,
  ) => {
    setDetails((currentDetails) =>
      currentDetails.map(
        (detail, currentIndex) =>
          currentIndex === index
            ? {
              ...detail,
              [field]: value,
            }
            : detail,
      ),
    )
  }


  const addDetail = () => {
    setDetails((currentDetails) => [
      ...currentDetails,
      {
        productId: '',
        quantity: '1',
      },
    ])
  }


  const removeDetail = (
    index: number,
  ) => {
    if (details.length <= 1) {
      return
    }

    setDetails((currentDetails) =>
      currentDetails.filter(
        (_, currentIndex) =>
          currentIndex !== index,
      ),
    )
  }


  const handleSave = async () => {
    const session = getCurrentUser()

    if (!session) {
      setFormError(
        'No se pudo identificar al usuario conectado.',
      )
      return
    }

    const branch =
      activeBranches.find(
        (item) =>
          item.id ===
          Number(selectedBranchId),
      )

    if (!branch) {
      setFormError(
        'Selecciona una sucursal activa.',
      )
      return
    }

    const processedDetails =
      details.map((detail) => ({
        product_id:
          Number(detail.productId),
        quantity:
          Number(detail.quantity),
      }))

    const invalidDetail =
      processedDetails.some(
        (detail) =>
          !Number.isInteger(
            detail.product_id,
          ) ||
          detail.product_id <= 0 ||
          !Number.isInteger(
            detail.quantity,
          ) ||
          detail.quantity <= 0,
      )

    if (invalidDetail) {
      setFormError(
        'Selecciona un producto y una cantidad válida en cada línea.',
      )
      return
    }

    const productIds =
      processedDetails.map(
        (detail) =>
          detail.product_id,
      )

    if (
      new Set(productIds).size !==
      productIds.length
    ) {
      setFormError(
        'Un producto no puede repetirse en la misma venta.',
      )
      return
    }

    const data: CreateSaleData = {
      company_id: branch.company_id,
      branch_id: branch.id,
      user_id: session.userId,
      details: processedDetails,
    }

    try {
      setSaving(true)
      setFormError('')

      await createSale(data)

      resetForm()

      // Volvemos a consultar para mostrar inmediatamente
      // la venta recién registrada.
      await loadData()
    } catch (requestError) {
      setFormError(
        requestError instanceof Error
          ? requestError.message
          : 'No se pudo registrar la venta.',
      )
    } finally {
      setSaving(false)
    }
  }


  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* El título principal ya se muestra en el Header global. */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <p className="max-w-2xl text-sm text-slate-500">
          Registra operaciones comerciales y consulta el
          historial de ventas realizadas por sucursal.
        </p>

        <button
          type="button"
          onClick={openCreateForm}
          disabled={
            loading ||
            activeBranches.length === 0 ||
            activeProducts.length === 0
          }
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <Plus size={18} />
          Nueva venta
        </button>
      </div>


      {/* Indicadores principales. */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Importe acumulado
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {formatCurrency(totalSales)}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Total registrado
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Banknote size={20} />
            </div>
          </div>
        </div>


        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Ventas registradas
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {sales.length}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Operaciones disponibles
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <ReceiptText size={20} />
            </div>
          </div>
        </div>


        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Ticket promedio
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {formatCurrency(averageTicket)}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Promedio por venta
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <ShoppingCart size={20} />
            </div>
          </div>
        </div>
      </div>


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


      {/* Historial de ventas. */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Registro de ventas
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Consulta las operaciones comerciales registradas.
            </p>
          </div>

          {/* Búsqueda y filtro por sucursal.
              Mantiene el mismo patrón visual de Historial. */}
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
                placeholder="Buscar venta..."
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            <div className="relative md:w-60">
              <Filter
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={branchFilter}
                onChange={(event) =>
                  setBranchFilter(
                    event.target.value,
                  )
                }
                className="w-full appearance-none rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-8 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              >
                <option value="">
                  Todas las sucursales
                </option>

                {branches.map(
                  (branch) => (
                    <option
                      key={branch.id}
                      value={branch.id}
                    >
                      {branch.name}
                    </option>
                  ),
                )}
              </select>
            </div>
          </div>
        </div>


        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Venta
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Sucursal
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Responsable
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Total
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Fecha
                </th>
              </tr>
            </thead>


            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [1, 2, 3, 4].map((row) => (
                  <tr key={row}>
                    {Array.from({
                      length: 5,
                    }).map((_, index) => (
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
                filteredSales.map((sale) => {
                  const branch =
                    branches.find(
                      (item) =>
                        item.id ===
                        sale.branch_id,
                    )

                  return (
                    <tr
                      key={sale.id}
                      className="transition-colors hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                            <ReceiptText size={17} />
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              Venta {sale.id}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              Empresa {sale.company_id}
                            </p>
                          </div>
                        </div>
                      </td>


                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                          <Building2
                            size={16}
                            className="text-slate-400"
                          />

                          <span>
                            {branch?.name ??
                              `Sucursal ${sale.branch_id}`}
                          </span>
                        </div>
                      </td>


                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <UserRound
                            size={16}
                            className="text-slate-400"
                          />

                          Usuario {sale.user_id}
                        </div>
                      </td>


                      <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                        {formatCurrency(
                          Number(sale.total),
                        )}
                      </td>


                      <td className="px-5 py-4 text-sm text-slate-500">
                        {formatDateTime(
                          sale.created_at,
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>


          {!loading &&
            filteredSales.length === 0 && (
              <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                <ShoppingCart
                  size={34}
                  className="text-slate-300"
                />

                <h3 className="mt-3 font-semibold text-slate-900">
                  No se encontraron ventas
                </h3>

                <p className="mt-1 max-w-sm text-sm text-slate-500">
                  Las operaciones registradas aparecerán aquí.
                </p>
              </div>
            )}
        </div>
      </div>


      {/* Formulario para registrar una nueva venta. */}
      <Modal
        open={showForm}
        onClose={() => {
          // Evitamos cerrar el formulario mientras la venta se guarda.
          if (!saving) {
            resetForm()
          }
        }}
        panelClassName="max-w-3xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <div className="flex items-center gap-2">
              <ShoppingCart
                size={20}
                className="text-slate-700"
              />

              <h2 className="text-lg font-bold text-slate-900">
                Nueva venta
              </h2>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Registra uno o más productos en una sola operación.
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


        {formError && (
          <div className="mx-6 mt-5 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0 text-red-600"
              />

              <div>
                <p className="text-sm font-semibold text-red-800">
                  No fue posible registrar la venta
                </p>

                <p className="mt-1 text-sm text-red-700">
                  {formError}
                </p>
              </div>
            </div>
          </div>
        )}


        <div className="space-y-6 p-6">
          <div>
            <label
              htmlFor="sale-branch"
              className="text-sm font-semibold text-slate-700"
            >
              Sucursal
            </label>

            <select
              id="sale-branch"
              value={selectedBranchId}
              onChange={(event) =>
                setSelectedBranchId(
                  event.target.value,
                )
              }
              disabled={saving}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-slate-100 disabled:bg-slate-100"
            >
              {activeBranches.map(
                (branch) => (
                  <option
                    key={branch.id}
                    value={branch.id}
                  >
                    {branch.name}
                  </option>
                ),
              )}
            </select>
          </div>


          <div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-700">
                  Productos
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Agrega los productos incluidos en la venta.
                </p>
              </div>

              <button
                type="button"
                onClick={addDetail}
                disabled={
                  saving ||
                  details.length >=
                  activeProducts.length
                }
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus size={14} />
                Agregar producto
              </button>
            </div>


            <div className="mt-4 space-y-3">
              {details.map(
                (detail, index) => {
                  const selectedProduct =
                    activeProducts.find(
                      (product) =>
                        product.id ===
                        Number(
                          detail.productId,
                        ),
                    )

                  const quantity =
                    Number(
                      detail.quantity,
                    ) || 0

                  const subtotal =
                    selectedProduct
                      ? Number(
                        selectedProduct.price,
                      ) * quantity
                      : 0

                  const selectedIds =
                    details
                      .map(
                        (item) =>
                          item.productId,
                      )
                      .filter(Boolean)

                  return (
                    <div
                      key={index}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="grid gap-4 md:grid-cols-[1fr_110px_130px_40px] md:items-end">
                        <div>
                          <label
                            htmlFor={`sale-product-${index}`}
                            className="text-xs font-semibold text-slate-700"
                          >
                            Producto
                          </label>

                          <select
                            id={`sale-product-${index}`}
                            value={
                              detail.productId
                            }
                            onChange={(
                              event,
                            ) =>
                              updateDetail(
                                index,
                                'productId',
                                event.target
                                  .value,
                              )
                            }
                            disabled={saving}
                            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-slate-100 disabled:bg-slate-100"
                          >
                            <option value="">
                              Selecciona un producto
                            </option>

                            {activeProducts.map(
                              (product) => (
                                <option
                                  key={
                                    product.id
                                  }
                                  value={
                                    product.id
                                  }
                                  disabled={
                                    selectedIds.includes(
                                      String(
                                        product.id,
                                      ),
                                    ) &&
                                    detail.productId !==
                                    String(
                                      product.id,
                                    )
                                  }
                                >
                                  {
                                    product.name
                                  }{' '}
                                  ·{' '}
                                  {
                                    product.sku
                                  }
                                </option>
                              ),
                            )}
                          </select>

                          {selectedProduct && (
                            <p className="mt-1.5 text-xs text-slate-500">
                              Precio:{' '}
                              {formatCurrency(
                                Number(
                                  selectedProduct.price,
                                ),
                              )}
                            </p>
                          )}
                        </div>


                        <div>
                          <label
                            htmlFor={`sale-quantity-${index}`}
                            className="text-xs font-semibold text-slate-700"
                          >
                            Cantidad
                          </label>

                          <input
                            id={`sale-quantity-${index}`}
                            type="number"
                            min="1"
                            step="1"
                            value={
                              detail.quantity
                            }
                            onChange={(
                              event,
                            ) =>
                              updateDetail(
                                index,
                                'quantity',
                                event.target
                                  .value,
                              )
                            }
                            disabled={saving}
                            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-slate-100 disabled:bg-slate-100"
                          />
                        </div>


                        <div>
                          <p className="text-xs font-semibold text-slate-700">
                            Subtotal
                          </p>

                          <div className="mt-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-900">
                            {formatCurrency(
                              subtotal,
                            )}
                          </div>
                        </div>


                        <button
                          type="button"
                          onClick={() =>
                            removeDetail(
                              index,
                            )
                          }
                          disabled={
                            saving ||
                            details.length <= 1
                          }
                          aria-label="Eliminar producto de la venta"
                          className="flex h-10 w-10 items-center justify-center rounded-lg border border-red-200 text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <Trash2
                            size={16}
                          />
                        </button>
                      </div>
                    </div>
                  )
                },
              )}
            </div>
          </div>


          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-700">
                  Total estimado
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  FastAPI volverá a calcular precios y total antes de guardar.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Package
                  size={20}
                  className="text-slate-400"
                />

                <p className="text-2xl font-bold text-slate-900">
                  {formatCurrency(
                    previewTotal,
                  )}
                </p>
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
              ? 'Registrando...'
              : 'Registrar venta'}
          </button>
        </div>
      </Modal>
    </div>
  )
}


export default Ventas