import { useMemo, useState } from 'react'

interface Sale {
  id: number
  customer: string
  product: string
  quantity: number
  total: number
  date: string
  status: 'Completada' | 'Pendiente' | 'Cancelada'
}

const initialSales: Sale[] = [
  {
    id: 1,
    customer: 'Empresa ABC',
    product: 'Laptop empresarial',
    quantity: 2,
    total: 5000,
    date: '24/09/2026',
    status: 'Completada',
  },
  {
    id: 2,
    customer: 'Comercial XYZ',
    product: 'Monitor 24"',
    quantity: 3,
    total: 1950,
    date: '23/09/2026',
    status: 'Completada',
  },
  {
    id: 3,
    customer: 'Juan Pérez',
    product: 'Teclado mecánico',
    quantity: 1,
    total: 180,
    date: '23/09/2026',
    status: 'Pendiente',
  },
]

function Ventas() {
  const [sales, setSales] =
    useState<Sale[]>(initialSales)

  const [showForm, setShowForm] =
    useState(false)

  const [editingId, setEditingId] =
    useState<number | null>(null)

  const [customer, setCustomer] = useState('')
  const [product, setProduct] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [total, setTotal] = useState('')
  const [status, setStatus] =
    useState<Sale['status']>('Completada')

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] =
    useState('Todas')

  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      const matchesSearch =
        `${sale.customer} ${sale.product}`
          .toLowerCase()
          .includes(search.toLowerCase())

      const matchesStatus =
        statusFilter === 'Todas' ||
        sale.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [sales, search, statusFilter])

  const totalSales = sales.reduce(
    (sum, sale) => sum + sale.total,
    0,
  )

  const completedSales = sales.filter(
    (sale) => sale.status === 'Completada',
  ).length

  const pendingSales = sales.filter(
    (sale) => sale.status === 'Pendiente',
  ).length

  const resetForm = () => {
    setCustomer('')
    setProduct('')
    setQuantity('1')
    setTotal('')
    setStatus('Completada')
    setEditingId(null)
    setShowForm(false)
  }

  const handleSave = () => {
    if (
      !customer.trim() ||
      !product.trim() ||
      !quantity.trim() ||
      !total.trim()
    ) {
      alert('Completa todos los campos.')
      return
    }

    const numericQuantity = Number(quantity)
    const numericTotal = Number(total)

    if (
      !Number.isFinite(numericQuantity) ||
      numericQuantity <= 0
    ) {
      alert('La cantidad debe ser mayor que 0.')
      return
    }

    if (
      !Number.isFinite(numericTotal) ||
      numericTotal <= 0
    ) {
      alert('El total debe ser mayor que 0.')
      return
    }

    if (editingId !== null) {
      setSales((currentSales) =>
        currentSales.map((sale) =>
          sale.id === editingId
            ? {
                ...sale,
                customer: customer.trim(),
                product: product.trim(),
                quantity: numericQuantity,
                total: numericTotal,
                status,
              }
            : sale,
        ),
      )
    } else {
      const newSale: Sale = {
        id: Date.now(),
        customer: customer.trim(),
        product: product.trim(),
        quantity: numericQuantity,
        total: numericTotal,
        date: new Date().toLocaleDateString(
          'es-PE',
        ),
        status,
      }

      setSales((currentSales) => [
        newSale,
        ...currentSales,
      ])
    }

    resetForm()
  }

  const handleEdit = (sale: Sale) => {
    setEditingId(sale.id)
    setCustomer(sale.customer)
    setProduct(sale.product)
    setQuantity(String(sale.quantity))
    setTotal(String(sale.total))
    setStatus(sale.status)
    setShowForm(true)
  }

  const handleDelete = (id: number) => {
    const sale = sales.find(
      (item) => item.id === id,
    )

    if (!sale) {
      return
    }

    const confirmed = window.confirm(
      `¿Seguro que deseas eliminar la venta de "${sale.customer}"?`,
    )

    if (!confirmed) {
      return
    }

    setSales((currentSales) =>
      currentSales.filter(
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
            Ventas
          </h1>

          <p className="mt-2 text-slate-500">
            Registro y seguimiento de ventas.
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
          + Nueva venta
        </button>

      </div>

      {/* RESUMEN */}

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Ventas registradas
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {sales.length}
          </p>

        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Ventas completadas
          </p>

          <p className="mt-2 text-2xl font-bold text-green-600">
            {completedSales}
          </p>

        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Ventas pendientes
          </p>

          <p className="mt-2 text-2xl font-bold text-yellow-600">
            {pendingSales}
          </p>

        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Total vendido
          </p>

          <p className="mt-2 text-2xl font-bold text-blue-600">
            S/ {totalSales.toFixed(2)}
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
          placeholder="Buscar cliente o producto..."
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 md:max-w-md"
        />

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
          className="rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
        >
          <option>Todas</option>
          <option>Completada</option>
          <option>Pendiente</option>
          <option>Cancelada</option>
        </select>

      </div>

      {/* TABLA */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead className="border-b bg-slate-50">

              <tr>

                <th className="px-6 py-4 text-sm font-semibold">
                  Cliente
                </th>

                <th className="px-6 py-4 text-sm font-semibold">
                  Producto
                </th>

                <th className="px-6 py-4 text-sm font-semibold">
                  Cantidad
                </th>

                <th className="px-6 py-4 text-sm font-semibold">
                  Total
                </th>

                <th className="px-6 py-4 text-sm font-semibold">
                  Fecha
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

              {filteredSales.map((sale) => (

                <tr
                  key={sale.id}
                  className="hover:bg-slate-50"
                >

                  <td className="px-6 py-4 font-medium text-slate-800">
                    {sale.customer}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {sale.product}
                  </td>

                  <td className="px-6 py-4 text-sm">
                    {sale.quantity}
                  </td>

                  <td className="px-6 py-4 text-sm font-medium">
                    S/ {sale.total.toFixed(2)}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {sale.date}
                  </td>

                  <td className="px-6 py-4">

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        sale.status === 'Completada'
                          ? 'bg-green-100 text-green-700'
                          : sale.status === 'Pendiente'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {sale.status}
                    </span>

                  </td>

                  <td className="px-6 py-4">

                    <div className="flex gap-2">

                      <button
                        type="button"
                        onClick={() =>
                          handleEdit(sale)
                        }
                        className="rounded-lg border border-blue-300 px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(sale.id)
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

          {filteredSales.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              No se encontraron ventas.
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
                  ? 'Editar venta'
                  : 'Nueva venta'}
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
                  Cliente
                </label>

                <input
                  type="text"
                  value={customer}
                  onChange={(event) =>
                    setCustomer(event.target.value)
                  }
                  placeholder="Nombre del cliente"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                />

              </div>

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
                  placeholder="Producto vendido"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                />

              </div>

              <div>

                <label className="text-sm font-medium text-slate-700">
                  Cantidad
                </label>

                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(event) =>
                    setQuantity(event.target.value)
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                />

              </div>

              <div>

                <label className="text-sm font-medium text-slate-700">
                  Total
                </label>

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={total}
                  onChange={(event) =>
                    setTotal(event.target.value)
                  }
                  placeholder="0.00"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                />

              </div>

              <div>

                <label className="text-sm font-medium text-slate-700">
                  Estado
                </label>

                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(
                      event.target.value as Sale['status'],
                    )
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                >
                  <option value="Completada">
                    Completada
                  </option>

                  <option value="Pendiente">
                    Pendiente
                  </option>

                  <option value="Cancelada">
                    Cancelada
                  </option>
                </select>

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

export default Ventas