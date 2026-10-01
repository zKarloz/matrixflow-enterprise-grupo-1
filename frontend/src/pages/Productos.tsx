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

  // Lista de productos disponibles.
  const [products, setProducts] = useState<Product[]>([])

  // Categorías disponibles para asociar a los productos.
  const [categories, setCategories] = useState<Category[]>([])

  // Controla la apertura del formulario de creación.
  const [showForm, setShowForm] = useState(false)

  // Campos utilizados por el formulario.
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [price, setPrice] = useState('')
  const [sku, setSku] = useState('')
  const [description, setDescription] = useState('')

  // Texto utilizado para buscar productos.
  const [search, setSearch] = useState('')

  // Estados visuales de carga y guardado.
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Mensaje de error para mostrarlo en pantalla.
  const [error, setError] = useState('')

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

        // Cargamos productos y categorías en paralelo.
        const [productsData, categoriesData] = await Promise.all([
          getProducts(),
          getActiveCategories(),
        ])

        // Guardamos los resultados.
        setProducts(productsData)
        setCategories(categoriesData)

        // Seleccionamos automáticamente la primera categoría.
        if (categoriesData.length > 0) {
          setCategoryId(String(categoriesData[0].id))
        }
      } catch (requestError) {
        // Registramos el error para facilitar la depuración.
        console.error(
          'Error al cargar productos y categorías:',
          requestError,
        )

        // Mostramos un mensaje comprensible para el usuario.
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'No se pudieron cargar los productos.',
        )
      } finally {
        // Finalizamos el estado de carga.
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // ============================================================
  // PRODUCTOS FILTRADOS
  // ============================================================

  const filteredProducts = products.filter((product) => {
    // Normalizamos el texto de búsqueda para comparar sin importar
    // mayúsculas o minúsculas.
    const searchText = search.toLowerCase()

    return `${product.name} ${product.category} ${product.sku}`
      .toLowerCase()
      .includes(searchText)
  })

  // ============================================================
  // LIMPIAR FORMULARIO
  // ============================================================

  const resetForm = () => {
    // Restablecemos todos los campos.
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

    // Cerramos el formulario.
    setShowForm(false)
  }

  // ============================================================
  // CREAR PRODUCTO
  // ============================================================

  const handleSave = async () => {
    // Validamos los campos obligatorios.
    if (
      !name.trim() ||
      !categoryId ||
      !price.trim() ||
      !sku.trim()
    ) {
      alert('Completa nombre, categoría, precio y SKU.')
      return
    }

    // Convertimos el precio a número.
    const numericPrice = Number(price)

    // Validamos que el precio sea válido.
    if (Number.isNaN(numericPrice) || numericPrice < 0) {
      alert('El precio debe ser un número válido mayor o igual a 0.')
      return
    }

    // Construimos el objeto con los datos del nuevo producto.
    const productData: CreateProductData = {
      name: name.trim(),
      category_id: Number(categoryId),
      price: numericPrice,
      sku: sku.trim(),
      description: description.trim() || null,
    }

    try {
      // Indicamos que el formulario está procesando el guardado.
      setSaving(true)

      // Limpiamos errores anteriores.
      setError('')

      // Creamos el producto.
      await createProduct(productData)

      // Actualizamos la tabla con los datos más recientes.
      const updatedProducts = await getProducts()
      setProducts(updatedProducts)

      // Cerramos y limpiamos el formulario.
      resetForm()
    } catch (requestError) {
      // Registramos el error para facilitar la depuración.
      console.error('Error al crear producto:', requestError)

      // Mostramos el mensaje correspondiente.
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No se pudo crear el producto.',
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
              Productos
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Administra el catálogo de productos y consulta su información
              comercial.
            </p>
          </div>

          {/* Botón principal para crear productos. */}
          <button
            type="button"
            onClick={() => {
              // Limpiamos el formulario antes de abrirlo.
              resetForm()

              // Abrimos el formulario.
              setShowForm(true)
            }}
            disabled={categories.length === 0}
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            + Nuevo producto
          </button>
        </div>

        {/* ========================================================
            RESUMEN
            ======================================================== */}

        <div className="mb-6 grid gap-4 md:grid-cols-3">

          {/* Total de productos. */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Productos registrados
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {products.length}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-600">
                P
              </div>
            </div>
          </div>

          {/* Productos activos. */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Productos activos
                </p>

                <p className="mt-2 text-2xl font-bold text-emerald-600">
                  {
                    products.filter(
                      (product) => product.is_active,
                    ).length
                  }
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                ✓
              </div>
            </div>
          </div>

          {/* Categorías disponibles. */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Categorías
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {categories.length}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                C
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            ERROR
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
            CONTENEDOR PRINCIPAL
            ======================================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Cabecera de la tabla y buscador. */}
          <div className="flex flex-col gap-4 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Catálogo de productos
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Consulta los productos registrados y su estado actual.
              </p>
            </div>

            {/* Buscador integrado en el contenedor de la tabla. */}
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
                placeholder="Buscar producto, categoría o SKU..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
              />
            </div>
          </div>

          {/* ======================================================
              TABLA
              ====================================================== */}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Producto
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Categoría
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    SKU
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Precio
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Stock
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Estado
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {/* Estado de carga dentro de la tabla. */}
                {loading ? (
                  [1, 2, 3, 4].map((row) => (
                    <tr key={row}>
                      {Array.from({ length: 6 }).map((_, index) => (
                        <td key={index} className="px-6 py-5">
                          <div className="h-4 animate-pulse rounded bg-slate-100" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="transition-colors hover:bg-slate-50"
                    >
                      {/* Nombre y descripción del producto. */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {product.name}
                          </p>

                          {product.description && (
                            <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                              {product.description}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Categoría asociada. */}
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {product.category}
                      </td>

                      {/* Código SKU. */}
                      <td className="px-6 py-4">
                        <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-medium text-slate-600">
                          {product.sku}
                        </span>
                      </td>

                      {/* Precio del producto. */}
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                        S/ {Number(product.price).toFixed(2)}
                      </td>

                      {/* Stock actual. */}
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {product.stock}
                      </td>

                      {/* Estado del producto. */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${product.is_active
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-500'
                            }`}
                        >
                          {product.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Estado vacío cuando el filtro no encuentra resultados. */}
            {!loading && filteredProducts.length === 0 && (
              <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  —
                </div>

                <h3 className="font-semibold text-slate-900">
                  No se encontraron productos
                </h3>

                <p className="mt-1 max-w-sm text-sm text-slate-500">
                  Prueba con otro nombre, categoría o código SKU.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================
            MODAL DE CREACIÓN
            ======================================================== */}

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">

            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">

              {/* Encabezado del formulario. */}
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Catálogo
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-slate-900">
                    Nuevo producto
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

                {/* Nombre. */}
                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Nombre
                  </label>

                  <input
                    type="text"
                    value={name}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                    placeholder="Ej. Laptop empresarial"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                {/* Categoría. */}
                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Categoría
                  </label>

                  <select
                    value={categoryId}
                    onChange={(event) =>
                      setCategoryId(event.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
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

                {/* Precio. */}
                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Precio
                  </label>

                  <div className="relative mt-2">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                      S/
                    </span>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={price}
                      onChange={(event) =>
                        setPrice(event.target.value)
                      }
                      placeholder="0.00"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    />
                  </div>
                </div>

                {/* SKU. */}
                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    SKU
                  </label>

                  <input
                    type="text"
                    value={sku}
                    onChange={(event) =>
                      setSku(event.target.value)
                    }
                    placeholder="Ej. LAP-001"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                {/* Descripción. */}
                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Descripción
                  </label>

                  <textarea
                    value={description}
                    onChange={(event) =>
                      setDescription(event.target.value)
                    }
                    placeholder="Descripción opcional"
                    rows={3}
                    className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                {/* ==================================================
                    ACCIONES
                    ================================================== */}

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
                      saving || categories.length === 0
                    }
                    className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {saving ? 'Guardando...' : 'Guardar producto'}
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

export default Productos