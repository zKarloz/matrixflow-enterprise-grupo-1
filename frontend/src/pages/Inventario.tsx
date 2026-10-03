import { useEffect, useMemo, useState } from 'react'
// Modal común utilizado por todos los formularios
// emergentes de MatrixFlow.
import Modal from '../components/ui/Modal'

import {
  AlertCircle,
  Boxes,
  Building2,
  CircleAlert,
  Package,
  Pencil,
  Plus,
  Search,
  Warehouse,
  X,
} from 'lucide-react'

import {
  createInventory,
  getBranches,
  getInventory,
  getProducts,
  updateInventory,
  type Branch,
  type InventoryItem,
  type Product,
} from '../services/api'


function formatCurrency(value: number | null) {
  if (value == null) {
    return 'Sin costo'
  }

  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
  }).format(value)
}


function Inventario() {
  // Datos obtenidos desde FastAPI.
  const [items, setItems] = useState<InventoryItem[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [products, setProducts] = useState<Product[]>([])

  // Estados generales de la página.
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  // Estados del formulario.
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const [branchId, setBranchId] = useState('')
  const [productId, setProductId] = useState('')
  const [stock, setStock] = useState('0')
  const [minimumStock, setMinimumStock] = useState('0')
  const [unitCost, setUnitCost] = useState('')


  // ----------------------------------------------------------
  // CARGA DE DATOS
  // ----------------------------------------------------------

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')

      const [
        inventoryData,
        branchesData,
        productsData,
      ] = await Promise.all([
        getInventory(),
        getBranches(),
        getProducts(),
      ])

      setItems(inventoryData)
      setBranches(branchesData)
      setProducts(productsData)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No se pudo cargar el inventario.',
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


  const totalStock = useMemo(
    () =>
      items.reduce(
        (total, item) =>
          total + Number(item.stock),
        0,
      ),
    [items],
  )


  const lowStockItems = useMemo(
    () =>
      items.filter(
        (item) =>
          Number(item.stock) <=
          Number(item.minimum_stock),
      ).length,
    [items],
  )


  const outOfStockItems = useMemo(
    () =>
      items.filter(
        (item) =>
          Number(item.stock) === 0,
      ).length,
    [items],
  )


  const filteredItems = useMemo(() => {
    const term = search
      .trim()
      .toLowerCase()

    return items.filter((item) => {
      const branch = branches.find(
        (currentBranch) =>
          currentBranch.id === item.branch_id,
      )

      const product = products.find(
        (currentProduct) =>
          currentProduct.id === item.product_id,
      )

      return [
        item.id,
        branch?.name ?? '',
        product?.name ?? '',
        product?.sku ?? '',
        item.stock,
        item.minimum_stock,
      ]
        .join(' ')
        .toLowerCase()
        .includes(term)
    })
  }, [
    items,
    branches,
    products,
    search,
  ])


  // ----------------------------------------------------------
  // FORMULARIO
  // ----------------------------------------------------------

  const resetForm = () => {
    setShowForm(false)
    setEditingId(null)
    setSaving(false)
    setFormError('')
    setBranchId('')
    setProductId('')
    setStock('0')
    setMinimumStock('0')
    setUnitCost('')
  }


  const openCreateForm = () => {
    setEditingId(null)
    setFormError('')

    setBranchId(
      activeBranches.length > 0
        ? String(activeBranches[0].id)
        : '',
    )

    setProductId('')
    setStock('0')
    setMinimumStock('0')
    setUnitCost('')
    setShowForm(true)
  }


  const openEditForm = (
    item: InventoryItem,
  ) => {
    setEditingId(item.id)
    setFormError('')

    setBranchId(
      String(item.branch_id),
    )

    setProductId(
      String(item.product_id),
    )

    setStock(
      String(item.stock),
    )

    setMinimumStock(
      String(item.minimum_stock),
    )

    setUnitCost(
      item.unit_cost != null
        ? String(item.unit_cost)
        : '',
    )

    setShowForm(true)
  }


  const handleSave = async () => {
    const parsedStock = Number(stock)
    const parsedMinimumStock =
      Number(minimumStock)

    const parsedUnitCost =
      unitCost.trim() === ''
        ? null
        : Number(unitCost)

    if (
      !Number.isInteger(parsedStock) ||
      parsedStock < 0
    ) {
      setFormError(
        'El stock debe ser un número entero igual o mayor que cero.',
      )
      return
    }

    if (
      !Number.isInteger(
        parsedMinimumStock,
      ) ||
      parsedMinimumStock < 0
    ) {
      setFormError(
        'El stock mínimo debe ser un número entero igual o mayor que cero.',
      )
      return
    }

    if (
      parsedUnitCost !== null &&
      (
        Number.isNaN(parsedUnitCost) ||
        parsedUnitCost < 0
      )
    ) {
      setFormError(
        'El costo unitario no puede ser negativo.',
      )
      return
    }

    try {
      setSaving(true)
      setFormError('')

      if (editingId !== null) {
        await updateInventory(
          editingId,
          {
            stock: parsedStock,
            minimum_stock:
              parsedMinimumStock,
            unit_cost:
              parsedUnitCost,
          },
        )
      } else {
        const parsedBranchId =
          Number(branchId)

        const parsedProductId =
          Number(productId)

        if (
          parsedBranchId <= 0 ||
          parsedProductId <= 0
        ) {
          setFormError(
            'Selecciona una sucursal y un producto.',
          )
          return
        }

        await createInventory({
          branch_id:
            parsedBranchId,
          product_id:
            parsedProductId,
          stock:
            parsedStock,
          minimum_stock:
            parsedMinimumStock,
          unit_cost:
            parsedUnitCost,
        })
      }

      resetForm()

      // Recargamos los datos para reflejar el valor
      // almacenado realmente en PostgreSQL.
      await loadData()
    } catch (requestError) {
      setFormError(
        requestError instanceof Error
          ? requestError.message
          : 'No se pudo guardar el inventario.',
      )
    } finally {
      setSaving(false)
    }
  }


  const selectedCombinationExists =
    editingId === null &&
    items.some(
      (item) =>
        item.branch_id ===
        Number(branchId) &&
        item.product_id ===
        Number(productId),
    )


  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* El título principal ya pertenece al Header global. */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <p className="max-w-2xl text-sm text-slate-500">
          Controla las existencias disponibles por producto y
          sucursal antes de registrar operaciones comerciales.
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
          Nuevo inventario
        </button>
      </div>


      {/* Indicadores del inventario real. */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Unidades disponibles
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {totalStock}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Existencias acumuladas
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Boxes size={20} />
            </div>
          </div>
        </div>


        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Stock bajo
              </p>

              <p className="mt-2 text-2xl font-bold text-amber-600">
                {lowStockItems}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                En o debajo del mínimo
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <CircleAlert size={20} />
            </div>
          </div>
        </div>


        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Sin existencias
              </p>

              <p className="mt-2 text-2xl font-bold text-red-600">
                {outOfStockItems}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Productos con stock cero
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <Warehouse size={20} />
            </div>
          </div>
        </div>
      </div>


      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex gap-3">
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0 text-red-600"
            />

            <div>
              <p className="font-semibold text-red-800">
                No fue posible cargar el inventario
              </p>

              <p className="mt-1 text-sm text-red-700">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}


      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Existencias por sucursal
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Stock actual, mínimo configurado y costo unitario.
            </p>
          </div>

          <div className="relative w-full md:max-w-sm">
            <Search
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Buscar producto o sucursal..."
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            />
          </div>
        </div>


        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Producto
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Sucursal
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Stock
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Mínimo
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Costo
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Acciones
                </th>
              </tr>
            </thead>


            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [1, 2, 3].map((row) => (
                  <tr key={row}>
                    {Array.from({
                      length: 6,
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
                filteredItems.map((item) => {
                  const branch =
                    branches.find(
                      (currentBranch) =>
                        currentBranch.id ===
                        item.branch_id,
                    )

                  const product =
                    products.find(
                      (currentProduct) =>
                        currentProduct.id ===
                        item.product_id,
                    )

                  const lowStock =
                    item.stock <=
                    item.minimum_stock

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                            <Package size={17} />
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {product?.name ??
                                `Producto ${item.product_id}`}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              {product?.sku ??
                                `ID ${item.product_id}`}
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

                          {branch?.name ??
                            `Sucursal ${item.branch_id}`}
                        </div>
                      </td>


                      <td className="px-5 py-4 text-right">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${item.stock === 0
                            ? 'bg-red-50 text-red-700'
                            : lowStock
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-emerald-50 text-emerald-700'
                            }`}
                        >
                          {item.stock}
                        </span>
                      </td>


                      <td className="px-5 py-4 text-right text-sm text-slate-600">
                        {item.minimum_stock}
                      </td>


                      <td className="px-5 py-4 text-right text-sm font-medium text-slate-800">
                        {formatCurrency(
                          item.unit_cost != null
                            ? Number(
                              item.unit_cost,
                            )
                            : null,
                        )}
                      </td>


                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            openEditForm(
                              item,
                            )
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        >
                          <Pencil size={14} />
                          Editar
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>


          {!loading &&
            filteredItems.length === 0 && (
              <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                <Boxes
                  size={34}
                  className="text-slate-300"
                />

                <h3 className="mt-3 font-semibold text-slate-900">
                  No se encontraron registros
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Registra inventario para comenzar a controlar existencias.
                </p>
              </div>
            )}
        </div>
      </div>


      {/* ============================================================
        MODAL DE INVENTARIO
        ============================================================ */}

      <Modal
        // El componente Modal ya decide si debe renderizarse.
        open={showForm}

        // Evitamos cerrar accidentalmente mientras se está guardando.
        onClose={() => {
          if (!saving) {
            resetForm()
          }
        }}

        // Ancho máximo del formulario de inventario.
        panelClassName="max-w-xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {editingId !== null
                ? 'Editar inventario'
                : 'Nuevo inventario'}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Define las existencias disponibles del producto.
            </p>
          </div>

          <button
            type="button"
            onClick={resetForm}
            disabled={saving}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>


        <div className="space-y-5 p-6">
          {formError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {formError}
            </div>
          )}


          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Sucursal
              </label>

              <select
                value={branchId}
                onChange={(event) =>
                  setBranchId(
                    event.target.value,
                  )
                }
                disabled={
                  editingId !== null ||
                  saving
                }
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm disabled:bg-slate-100"
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
              <label className="text-sm font-semibold text-slate-700">
                Producto
              </label>

              <select
                value={productId}
                onChange={(event) =>
                  setProductId(
                    event.target.value,
                  )
                }
                disabled={
                  editingId !== null ||
                  saving
                }
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm disabled:bg-slate-100"
              >
                <option value="">
                  Selecciona un producto
                </option>

                {activeProducts.map(
                  (product) => (
                    <option
                      key={product.id}
                      value={product.id}
                    >
                      {product.name} · {product.sku}
                    </option>
                  ),
                )}
              </select>
            </div>
          </div>


          {selectedCombinationExists && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
              Este producto ya tiene inventario registrado en la sucursal seleccionada.
            </div>
          )}


          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Stock
              </label>

              <input
                type="number"
                min="0"
                step="1"
                value={stock}
                onChange={(event) =>
                  setStock(
                    event.target.value,
                  )
                }
                disabled={saving}
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
              />
            </div>


            <div>
              <label className="text-sm font-semibold text-slate-700">
                Stock mínimo
              </label>

              <input
                type="number"
                min="0"
                step="1"
                value={minimumStock}
                onChange={(event) =>
                  setMinimumStock(
                    event.target.value,
                  )
                }
                disabled={saving}
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
              />
            </div>


            <div>
              <label className="text-sm font-semibold text-slate-700">
                Costo unitario
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={unitCost}
                onChange={(event) =>
                  setUnitCost(
                    event.target.value,
                  )
                }
                disabled={saving}
                placeholder="0.00"
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
              />
            </div>
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
            onClick={() =>
              void handleSave()
            }
            disabled={
              saving ||
              selectedCombinationExists
            }
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? 'Guardando...'
              : editingId !== null
                ? 'Guardar cambios'
                : 'Crear inventario'}
          </button>
        </div>
      </Modal>
    </div>
  )
}


export default Inventario