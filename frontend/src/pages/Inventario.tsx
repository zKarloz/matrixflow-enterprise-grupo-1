import { useMemo, useState } from 'react'

interface InventoryItem {
  id: number
  product: string
  category: string
  branch: string
  stock: number
  minimumStock: number
  status: 'Normal' | 'Bajo' | 'Agotado'
}

const initialInventory: InventoryItem[] = [
  {
    id: 1,
    product: 'Laptop empresarial',
    category: 'Tecnología',
    branch: 'Sucursal Lima',
    stock: 15,
    minimumStock: 5,
    status: 'Normal',
  },
  {
    id: 2,
    product: 'Monitor 24"',
    category: 'Tecnología',
    branch: 'Sucursal Lima',
    stock: 8,
    minimumStock: 5,
    status: 'Normal',
  },
  {
    id: 3,
    product: 'Teclado mecánico',
    category: 'Accesorios',
    branch: 'Sucursal Arequipa',
    stock: 3,
    minimumStock: 5,
    status: 'Bajo',
  },
  {
    id: 4,
    product: 'Mouse inalámbrico',
    category: 'Accesorios',
    branch: 'Sucursal Trujillo',
    stock: 0,
    minimumStock: 5,
    status: 'Agotado',
  },
]

type MovementType = 'Entrada' | 'Salida'

function getStatus(
  stock: number,
  minimumStock: number,
): InventoryItem['status'] {
  if (stock <= 0) {
    return 'Agotado'
  }

  if (stock <= minimumStock) {
    return 'Bajo'
  }

  return 'Normal'
}

function Inventario() {
  const [items, setItems] =
    useState<InventoryItem[]>(initialInventory)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] =
    useState('Todos')

  const [showForm, setShowForm] =
    useState(false)

  const [editingId, setEditingId] =
    useState<number | null>(null)

  const [product, setProduct] = useState('')
  const [category, setCategory] =
    useState('Tecnología')
  const [branch, setBranch] =
    useState('Sucursal Lima')
  const [stock, setStock] = useState('')
  const [minimumStock, setMinimumStock] =
    useState('5')

  const [movementType, setMovementType] =
    useState<MovementType>('Entrada')

  const filteredInventory = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        `${item.product} ${item.category} ${item.branch}`
          .toLowerCase()
          .includes(search.toLowerCase())

      const matchesStatus =
        statusFilter === 'Todos' ||
        item.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [items, search, statusFilter])

  const total = items.length

  const lowStock = items.filter(
    (item) => item.status === 'Bajo',
  ).length

  const outOfStock = items.filter(
    (item) => item.status === 'Agotado',
  ).length

  const totalUnits = items.reduce(
    (sum, item) => sum + item.stock,
    0,
  )

  const resetForm = () => {
    setProduct('')
    setCategory('Tecnología')
    setBranch('Sucursal Lima')
    setStock('')
    setMinimumStock('5')
    setMovementType('Entrada')
    setEditingId(null)
    setShowForm(false)
  }

  const handleSave = () => {
    if (
      !product.trim() ||
      !stock.trim() ||
      !minimumStock.trim()
    ) {
      alert('Completa todos los campos.')
      return
    }

    const numericStock = Number(stock)
    const numericMinimum = Number(minimumStock)

    if (
      !Number.isFinite(numericStock) ||
      numericStock < 0
    ) {
      alert('El stock no puede ser negativo.')
      return
    }

    if (
      !Number.isFinite(numericMinimum) ||
      numericMinimum < 0
    ) {
      alert('El stock mínimo no puede ser negativo.')
      return
    }

    if (editingId !== null) {
      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === editingId
            ? {
                ...item,
                product: product.trim(),
                category,
                branch,
                stock: numericStock,
                minimumStock: numericMinimum,
                status: getStatus(
                  numericStock,
                  numericMinimum,
                ),
              }
            : item,
        ),
      )
    } else {
      const newItem: InventoryItem = {
        id: Date.now(),
        product: product.trim(),
        category,
        branch,
        stock: numericStock,
        minimumStock: numericMinimum,
        status: getStatus(
          numericStock,
          numericMinimum,
        ),
      }

      setItems((currentItems) => [
        ...currentItems,
        newItem,
      ])
    }

    resetForm()
  }

  const handleEdit = (item: InventoryItem) => {
    setEditingId(item.id)
    setProduct(item.product)
    setCategory(item.category)
    setBranch(item.branch)
    setStock(String(item.stock))
    setMinimumStock(
      String(item.minimumStock),
    )
    setShowForm(true)
  }

  const handleDelete = (id: number) => {
    const item = items.find(
      (inventoryItem) =>
        inventoryItem.id === id,
    )

    if (!item) {
      return
    }

    const confirmed = window.confirm(
      `¿Seguro que deseas eliminar "${item.product}" del inventario?`,
    )

    if (!confirmed) {
      return
    }

    setItems((currentItems) =>
      currentItems.filter(
        (inventoryItem) =>
          inventoryItem.id !== id,
      ),
    )
  }

  const handleMovement = (item: InventoryItem) => {
    const amountText = window.prompt(
      `¿Cuántas unidades deseas ${
        movementType === 'Entrada'
          ? 'ingresar'
          : 'retirar'
      } de "${item.product}"?`,
      '1',
    )

    if (amountText === null) {
      return
    }

    const amount = Number(amountText)

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      alert(
        'Ingresa una cantidad válida mayor que 0.',
      )
      return
    }

    const newStock =
      movementType === 'Entrada'
        ? item.stock + amount
        : item.stock - amount

    if (newStock < 0) {
      alert(
        'No puedes retirar más unidades de las disponibles.',
      )
      return
    }

    setItems((currentItems) =>
      currentItems.map((currentItem) =>
        currentItem.id === item.id
          ? {
              ...currentItem,
              stock: newStock,
              status: getStatus(
                newStock,
                currentItem.minimumStock,
              ),
            }
          : currentItem,
      ),
    )
  }

  return (
    <div>

      {/* ENCABEZADO */}

      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">

        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Inventario
          </h1>

          <p className="mt-2 text-slate-500">
            Control y seguimiento del inventario.
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
          + Nuevo producto
        </button>

      </div>

      {/* RESUMEN */}

      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-4">

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Productos registrados
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {total}
          </p>

        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Unidades disponibles
          </p>

          <p className="mt-2 text-2xl font-bold text-blue-600">
            {totalUnits}
          </p>

        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Stock bajo
          </p>

          <p className="mt-2 text-2xl font-bold text-yellow-600">
            {lowStock}
          </p>

        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Agotados
          </p>

          <p className="mt-2 text-2xl font-bold text-red-600">
            {outOfStock}
          </p>

        </div>

      </div>

      {/* FILTROS */}

      <div className="mb-6 flex flex-col gap-3 md:flex-row">

        <input
          type="text"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Buscar producto, categoría o sucursal..."
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 md:max-w-md"
        />

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
          className="rounded-lg border border-slate-300 bg-white px-4 py-3"
        >
          <option>Todos</option>
          <option>Normal</option>
          <option>Bajo</option>
          <option>Agotado</option>
        </select>

      </div>

      {/* TABLA */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead className="border-b bg-slate-50">

              <tr>

                <th className="px-6 py-4 text-sm font-semibold">
                  Producto
                </th>

                <th className="px-6 py-4 text-sm font-semibold">
                  Categoría
                </th>

                <th className="px-6 py-4 text-sm font-semibold">
                  Sucursal
                </th>

                <th className="px-6 py-4 text-sm font-semibold">
                  Stock
                </th>

                <th className="px-6 py-4 text-sm font-semibold">
                  Mínimo
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

              {filteredInventory.map((item) => (

                <tr
                  key={item.id}
                  className="hover:bg-slate-50"
                >

                  <td className="px-6 py-4 font-medium">
                    {item.product}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {item.category}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {item.branch}
                  </td>

                  <td className="px-6 py-4 text-sm font-semibold">
                    {item.stock}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {item.minimumStock}
                  </td>

                  <td className="px-6 py-4">

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        item.status === 'Normal'
                          ? 'bg-green-100 text-green-700'
                          : item.status === 'Bajo'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {item.status}
                    </span>

                  </td>

                  <td className="px-6 py-4">

                    <div className="flex flex-wrap gap-2">

                      <button
                        type="button"
                        onClick={() => {
                          setMovementType('Entrada')
                          handleMovement(item)
                        }}
                        className="rounded-lg border border-green-300 px-3 py-2 text-xs font-medium text-green-600 hover:bg-green-50"
                      >
                        + Entrada
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setMovementType('Salida')
                          handleMovement(item)
                        }}
                        className="rounded-lg border border-orange-300 px-3 py-2 text-xs font-medium text-orange-600 hover:bg-orange-50"
                      >
                        - Salida
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleEdit(item)
                        }
                        className="rounded-lg border border-blue-300 px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(item.id)
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

          {filteredInventory.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              No se encontraron productos.
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
                  ? 'Editar inventario'
                  : 'Nuevo producto'}
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
                  Producto
                </label>

                <input
                  type="text"
                  value={product}
                  onChange={(event) =>
                    setProduct(event.target.value)
                  }
                  placeholder="Nombre del producto"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                />

              </div>

              <div>

                <label className="text-sm font-medium text-slate-700">
                  Categoría
                </label>

                <select
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value)
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                >
                  <option>Tecnología</option>
                  <option>Accesorios</option>
                  <option>Oficina</option>
                  <option>Otros</option>
                </select>

              </div>

              <div>

                <label className="text-sm font-medium text-slate-700">
                  Sucursal
                </label>

                <select
                  value={branch}
                  onChange={(event) =>
                    setBranch(event.target.value)
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                >
                  <option>Sucursal Lima</option>
                  <option>Sucursal Arequipa</option>
                  <option>Sucursal Trujillo</option>
                </select>

              </div>

              <div>

                <label className="text-sm font-medium text-slate-700">
                  Stock
                </label>

                <input
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(event) =>
                    setStock(event.target.value)
                  }
                  placeholder="0"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                />

              </div>

              <div>

                <label className="text-sm font-medium text-slate-700">
                  Stock mínimo
                </label>

                <input
                  type="number"
                  min="0"
                  value={minimumStock}
                  onChange={(event) =>
                    setMinimumStock(event.target.value)
                  }
                  placeholder="5"
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

export default Inventario