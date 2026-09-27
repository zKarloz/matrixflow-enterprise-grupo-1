import { useState } from 'react'

interface Product {
  id: number
  name: string
  category: string
  price: number
  stock: number
  status: 'Activo' | 'Inactivo'
}

const initialProducts: Product[] = [
  {
    id: 1,
    name: 'Laptop empresarial',
    category: 'Tecnología',
    price: 2500,
    stock: 15,
    status: 'Activo',
  },
  {
    id: 2,
    name: 'Monitor 24"',
    category: 'Tecnología',
    price: 650,
    stock: 8,
    status: 'Activo',
  },
  {
    id: 3,
    name: 'Teclado mecánico',
    category: 'Accesorios',
    price: 180,
    stock: 20,
    status: 'Activo',
  },
]

function Productos() {
  const [products, setProducts] =
    useState<Product[]>(initialProducts)

  const [showForm, setShowForm] = useState(false)

  const [editingId, setEditingId] =
    useState<number | null>(null)

  const [name, setName] = useState('')
  const [category, setCategory] =
    useState('Tecnología')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')

  const [search, setSearch] = useState('')

  const filteredProducts = products.filter((product) =>
    `${product.name} ${product.category}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  )

  const resetForm = () => {
    setName('')
    setCategory('Tecnología')
    setPrice('')
    setStock('')
    setEditingId(null)
    setShowForm(false)
  }

  const handleSave = () => {
    if (
      !name.trim() ||
      !price.trim() ||
      !stock.trim()
    ) {
      alert('Completa todos los campos.')
      return
    }

    const numericPrice = Number(price)
    const numericStock = Number(stock)

    if (
      Number.isNaN(numericPrice) ||
      Number.isNaN(numericStock) ||
      numericPrice < 0 ||
      numericStock < 0
    ) {
      alert('El precio y el stock deben ser valores válidos.')
      return
    }

    if (editingId !== null) {
      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product.id === editingId
            ? {
              ...product,
              name: name.trim(),
              category,
              price: numericPrice,
              stock: numericStock,
            }
            : product,
        ),
      )
    } else {
      const newProduct: Product = {
        id: Date.now(),
        name: name.trim(),
        category,
        price: numericPrice,
        stock: numericStock,
        status: 'Activo',
      }

      setProducts((currentProducts) => [
        ...currentProducts,
        newProduct,
      ])
    }

    resetForm()
  }

  const handleEdit = (product: Product) => {
    setEditingId(product.id)
    setName(product.name)
    setCategory(product.category)
    setPrice(String(product.price))
    setStock(String(product.stock))
    setShowForm(true)
  }

  const handleDelete = (id: number) => {
    const product = products.find(
      (item) => item.id === id,
    )

    if (!product) {
      return
    }

    const confirmed = window.confirm(
      `¿Seguro que deseas eliminar "${product.name}"?`,
    )

    if (!confirmed) {
      return
    }

    setProducts((currentProducts) =>
      currentProducts.filter(
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
            Productos
          </h1>

          <p className="mt-2 text-slate-500">
            Administración de productos de MATRIXFLOW.
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

      {/* BUSCADOR */}

      <div className="mb-6">

        <input
          type="text"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Buscar producto o categoría..."
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
                  Producto
                </th>

                <th className="px-6 py-4 text-sm font-semibold">
                  Categoría
                </th>

                <th className="px-6 py-4 text-sm font-semibold">
                  Precio
                </th>

                <th className="px-6 py-4 text-sm font-semibold">
                  Stock
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

              {filteredProducts.map((product) => (

                <tr
                  key={product.id}
                  className="hover:bg-slate-50"
                >

                  <td className="px-6 py-4 font-medium text-slate-800">
                    {product.name}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {product.category}
                  </td>

                  <td className="px-6 py-4 text-sm font-medium">
                    S/ {product.price.toFixed(2)}
                  </td>

                  <td className="px-6 py-4 text-sm">
                    {product.stock}
                  </td>

                  <td className="px-6 py-4">

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${product.status === 'Activo'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                        }`}
                    >
                      {product.status}
                    </span>

                  </td>

                  <td className="px-6 py-4">

                    <div className="flex gap-2">

                      <button
                        type="button"
                        onClick={() =>
                          handleEdit(product)
                        }
                        className="rounded-lg border border-blue-300 px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(product.id)
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

          {filteredProducts.length === 0 && (
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
                  ? 'Editar producto'
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
                  Nombre del producto
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Ej. Laptop empresarial"
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
                  Precio
                </label>

                <input
                  type="number"
                  min="0"
                  value={price}
                  onChange={(event) =>
                    setPrice(event.target.value)
                  }
                  placeholder="0.00"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                />

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

export default Productos