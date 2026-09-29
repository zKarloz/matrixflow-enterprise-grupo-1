// ============================================================
// MatrixFlow Enterprise
// Gestión de productos
// ============================================================
//
// Esta pantalla obtiene los productos y categorías directamente
// desde el backend de MatrixFlow.
//
// Productos:
// GET  /api/v1/products
// POST /api/v1/products
//
// Categorías:
// GET /api/v1/categories/active
//
// Importante:
// El stock se muestra porque el backend lo devuelve junto con
// cada producto, pero NO se registra al crear el producto.
// El stock pertenece al módulo de Inventario.
// ============================================================

import { useEffect, useState } from 'react'

import {
  createProduct,
  getActiveCategories,
  getProducts,
  type Category,
  type CreateProductData,
  type Product,
} from '../services/api'

function Productos() {
  // ============================================================
  // ESTADO PRINCIPAL
  // ============================================================

  // Lista real de productos obtenida desde PostgreSQL mediante
  // el endpoint GET /products.
  const [products, setProducts] = useState<Product[]>([])

  // Categorías activas obtenidas desde el backend.
  const [categories, setCategories] = useState<Category[]>([])

  // Controla la apertura y cierre del formulario.
  const [showForm, setShowForm] = useState(false)

  // Campos del formulario de creación.
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [price, setPrice] = useState('')
  const [sku, setSku] = useState('')
  const [description, setDescription] = useState('')

  // Texto utilizado para filtrar la tabla.
  const [search, setSearch] = useState('')

  // Estados para mostrar al usuario qué está ocurriendo
  // mientras esperamos la respuesta del backend.
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // ============================================================
  // CARGA INICIAL
  // ============================================================

  useEffect(() => {
    // Cargamos productos y categorías al entrar a la pantalla.
    const loadData = async () => {
      try {
        setLoading(true)
        setError('')

        // Ambas peticiones pueden ejecutarse en paralelo porque
        // ninguna depende de la respuesta de la otra.
        const [productsData, categoriesData] =
          await Promise.all([
            getProducts(),
            getActiveCategories(),
          ])

        setProducts(productsData)
        setCategories(categoriesData)

        // Si existe al menos una categoría, la seleccionamos
        // automáticamente en el formulario.
        if (categoriesData.length > 0) {
          setCategoryId(String(categoriesData[0].id))
        }
      } catch (requestError) {
        console.error(
          'Error al cargar productos y categorías:',
          requestError,
        )

        setError(
          requestError instanceof Error
            ? requestError.message
            : 'No se pudieron cargar los productos.',
        )
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // ============================================================
  // PRODUCTOS FILTRADOS
  // ============================================================

  const filteredProducts = products.filter((product) => {
    const searchText = search.toLowerCase()

    return `${product.name} ${product.category} ${product.sku}`
      .toLowerCase()
      .includes(searchText)
  })

  // ============================================================
  // LIMPIAR FORMULARIO
  // ============================================================

  const resetForm = () => {
    setName('')
    setPrice('')
    setSku('')
    setDescription('')

    // Seleccionamos nuevamente la primera categoría disponible.
    if (categories.length > 0) {
      setCategoryId(String(categories[0].id))
    } else {
      setCategoryId('')
    }

    setShowForm(false)
  }

  // ============================================================
  // CREAR PRODUCTO
  // ============================================================

  const handleSave = async () => {
    // Validamos los campos obligatorios antes de enviar
    // información al backend.
    if (
      !name.trim() ||
      !categoryId ||
      !price.trim() ||
      !sku.trim()
    ) {
      alert(
        'Completa nombre, categoría, precio y SKU.',
      )
      return
    }

    const numericPrice = Number(price)

    // Validamos que el precio sea realmente numérico.
    if (
      Number.isNaN(numericPrice) ||
      numericPrice < 0
    ) {
      alert(
        'El precio debe ser un número válido mayor o igual a 0.',
      )
      return
    }

    // Convertimos los datos del formulario al formato
    // esperado por POST /products.
    const productData: CreateProductData = {
      name: name.trim(),
      category_id: Number(categoryId),
      price: numericPrice,
      sku: sku.trim(),
      description: description.trim() || null,
    }

    try {
      setSaving(true)
      setError('')

      // Enviamos el nuevo producto al backend.
      await createProduct(productData)

      // Volvemos a consultar la base de datos para que la tabla
      // muestre el registro realmente creado.
      const updatedProducts = await getProducts()

      setProducts(updatedProducts)

      // Cerramos y limpiamos el formulario.
      resetForm()
    } catch (requestError) {
      console.error(
        'Error al crear producto:',
        requestError,
      )

      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No se pudo crear el producto.',
      )
    } finally {
      setSaving(false)
    }
  }

  // ============================================================
  // RENDERIZADO
  // ============================================================

  return (
    <div>
      {/* ======================================================
          ENCABEZADO
          ====================================================== */}

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
            // Limpiamos el formulario antes de abrirlo.
            resetForm()
            setShowForm(true)
          }}
          disabled={categories.length === 0}
          className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          + Nuevo producto
        </button>
      </div>

      {/* ======================================================
          RESUMEN
          ====================================================== */}

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Total de productos
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {products.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Productos activos
          </p>

          <p className="mt-2 text-2xl font-bold text-green-600">
            {
              products.filter(
                (product) => product.is_active,
              ).length
            }
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Categorías
          </p>

          <p className="mt-2 text-2xl font-bold text-blue-600">
            {categories.length}
          </p>
        </div>
      </div>

      {/* ======================================================
          ERROR
          ====================================================== */}

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ======================================================
          BUSCADOR
          ====================================================== */}

      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Buscar producto, categoría o SKU..."
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 md:max-w-md"
        />
      </div>

      {/* ======================================================
          TABLA
          ====================================================== */}

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
                  SKU
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
              </tr>
            </thead>

            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    Cargando productos...
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-800">
                          {product.name}
                        </p>

                        {product.description && (
                          <p className="mt-1 text-xs text-slate-500">
                            {product.description}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {product.category}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {product.sku}
                    </td>

                    <td className="px-6 py-4 text-sm font-medium">
                      S/ {Number(product.price).toFixed(2)}
                    </td>

                    <td className="px-6 py-4 text-sm">
                      {product.stock}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${product.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                          }`}
                      >
                        {product.is_active
                          ? 'Activo'
                          : 'Inactivo'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {!loading &&
            filteredProducts.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                No se encontraron productos.
              </div>
            )}
        </div>
      </div>

      {/* ======================================================
          MODAL DE CREACIÓN
          ====================================================== */}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                Nuevo producto
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
              {/* Nombre */}
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
                  placeholder="Ej. Laptop empresarial"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500"
                />
              </div>

              {/* Categoría */}
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Categoría
                </label>

                <select
                  value={categoryId}
                  onChange={(event) =>
                    setCategoryId(event.target.value)
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 outline-none focus:border-blue-500"
                >
                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Precio */}
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Precio
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(event) =>
                    setPrice(event.target.value)
                  }
                  placeholder="0.00"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500"
                />
              </div>

              {/* SKU */}
              <div>
                <label className="text-sm font-medium text-slate-700">
                  SKU
                </label>

                <input
                  type="text"
                  value={sku}
                  onChange={(event) =>
                    setSku(event.target.value)
                  }
                  placeholder="Ej. LAP-001"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Descripción
                </label>

                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder="Descripción opcional"
                  rows={3}
                  className="mt-1 w-full resize-none rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500"
                />
              </div>

              {/* Información del stock */}
              <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
                El stock se administra desde el módulo de
                Inventario y no se registra al crear el producto.
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || categories.length === 0}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {saving
                    ? 'Guardando...'
                    : 'Guardar producto'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Productos