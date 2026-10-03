import { useEffect, useState } from 'react'

// Modal compartido para centrar formularios y cubrir todo el viewport.
import Modal from '../components/ui/Modal'
import {
  AlertCircle,
  CheckCircle2,
  Package,
  PackageSearch,
  Pencil,
  Plus,
  Power,
  PowerOff,
  Search,
  Tags,
  X,
} from 'lucide-react'

import {
  createCategory,
  createProduct,
  getActiveCategories,
  getCategories,
  getProducts,
  updateCategory,
  updateProduct,
  type Category,
  type CreateProductData,
  type Product,
  type UpdateCategoryData,
  type UpdateProductData,
} from '../services/api'

function Productos() {
  // Datos obtenidos desde FastAPI.
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  // Estados generales de la página.
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Controla la creación rápida de categorías dentro
  // del formulario de productos.
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [categorySaving, setCategorySaving] = useState(false)
  const [categoryError, setCategoryError] = useState('')

  // Campos de la nueva categoría.
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryDescription, setNewCategoryDescription] =
    useState('')

  // Categorías completas, incluyendo las inactivas.
  // Esta lista se utiliza solo en el panel de administración.
  const [allCategories, setAllCategories] = useState<Category[]>([])

  // Control del panel de administración.
  const [showCategoryManager, setShowCategoryManager] =
    useState(false)

  const [categoryManagerLoading, setCategoryManagerLoading] =
    useState(false)

  const [categoryManagerError, setCategoryManagerError] =
    useState('')

  // Categoría que se está editando desde el panel.
  const [editingCategoryId, setEditingCategoryId] =
    useState<number | null>(null)

  const [categoryEditName, setCategoryEditName] = useState('')
  const [categoryEditDescription, setCategoryEditDescription] =
    useState('')

  const [categoryUpdating, setCategoryUpdating] =
    useState(false)

  // Error general de la página:
  // carga de datos, activar/desactivar, etc.
  const [error, setError] = useState('')

  // Error exclusivo del formulario abierto.
  const [formError, setFormError] = useState('')

  const [search, setSearch] = useState('')

  // Control del formulario.
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  // Conserva el nombre de la categoría actual durante la edición.
  const [editingCategoryName, setEditingCategoryName] = useState('')

  // Campos del producto.
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [price, setPrice] = useState('')
  const [sku, setSku] = useState('')
  const [description, setDescription] = useState('')
  const [isActive, setIsActive] = useState(true)

  // ------------------------------------------------------------
  // CARGA DE DATOS
  // ------------------------------------------------------------

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')

      const [productsData, categoriesData] = await Promise.all([
        getProducts(),
        getActiveCategories(),
      ])

      setProducts(productsData)
      setCategories(categoriesData)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No se pudieron cargar los productos.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  // ------------------------------------------------------------
  // FILTRO E INDICADORES
  // ------------------------------------------------------------

  const filteredProducts = products.filter((product) => {
    const searchableText = [
      product.name,
      product.category,
      product.sku,
      product.description ?? '',
    ]
      .join(' ')
      .toLowerCase()

    return searchableText.includes(
      search.trim().toLowerCase(),
    )
  })

  const activeProducts = products.filter(
    (product) => product.is_active,
  ).length

  // ------------------------------------------------------------
  // FORMULARIO
  // ------------------------------------------------------------

  const resetCategoryForm = () => {
    setShowCategoryForm(false)
    setCategorySaving(false)
    setCategoryError('')
    setNewCategoryName('')
    setNewCategoryDescription('')
  }

  // Cierra la edición de una categoría y limpia sus campos.
  const resetCategoryEdit = () => {
    setEditingCategoryId(null)
    setCategoryEditName('')
    setCategoryEditDescription('')
  }

  const resetForm = () => {
    setEditingId(null)
    setEditingCategoryName('')
    setName('')
    setCategoryId('')
    setPrice('')
    setSku('')
    setDescription('')
    setIsActive(true)
    setShowForm(false)
    setFormError('')

    // Cerramos y limpiamos los controles auxiliares de categorías.
    resetCategoryForm()
    setShowCategoryManager(false)
    setCategoryManagerError('')
    resetCategoryEdit()
  }

  // Consulta todas las categorías para el panel administrativo.
  const loadCategoryManager = async () => {
    try {
      setCategoryManagerLoading(true)
      setCategoryManagerError('')

      const data = await getCategories()
      setAllCategories(data)
    } catch (requestError) {
      setCategoryManagerError(
        requestError instanceof Error
          ? requestError.message
          : 'No se pudieron cargar las categorías.',
      )
    } finally {
      setCategoryManagerLoading(false)
    }
  }


  // Abre el panel de administración.
  // Cerramos el formulario rápido para no mostrar ambos a la vez.
  const openCategoryManager = async () => {
    resetCategoryForm()
    resetCategoryEdit()

    setShowCategoryManager(true)

    await loadCategoryManager()
  }


  // Cierra completamente el panel administrativo.
  const closeCategoryManager = () => {
    setShowCategoryManager(false)
    setCategoryManagerError('')
    resetCategoryEdit()
  }


  // Carga los datos de una categoría en el formulario de edición.
  const openCategoryEdit = (category: Category) => {
    setEditingCategoryId(category.id)
    setCategoryEditName(category.name)
    setCategoryEditDescription(category.description ?? '')
    setCategoryManagerError('')
  }

  const openCreateForm = () => {
    resetForm()

    // Una categoría activa es necesaria para crear productos.
    if (categories.length > 0) {
      setCategoryId(String(categories[0].id))
    }

    setShowForm(true)
  }

  const openEditForm = (product: Product) => {
    setEditingId(product.id)
    setEditingCategoryName(product.category)
    setName(product.name)
    setCategoryId(String(product.category_id))
    setPrice(String(product.price))
    setSku(product.sku)
    setDescription(product.description ?? '')
    setIsActive(product.is_active)
    setFormError('')
    setShowForm(true)
  }

  const handleUpdateCategory = async () => {
    if (editingCategoryId === null) {
      return
    }

    if (!categoryEditName.trim()) {
      setCategoryManagerError(
        'El nombre de la categoría es obligatorio.',
      )
      return
    }

    const category = allCategories.find(
      (item) => item.id === editingCategoryId,
    )

    if (!category) {
      setCategoryManagerError(
        'No se encontró la categoría seleccionada.',
      )
      return
    }

    const data: UpdateCategoryData = {
      name: categoryEditName.trim(),
      description:
        categoryEditDescription.trim() || null,
      is_active: category.is_active,
    }

    try {
      setCategoryUpdating(true)
      setCategoryManagerError('')

      const updatedCategory = await updateCategory(
        category.id,
        data,
      )

      // Actualizamos las listas utilizadas tanto por el selector
      // como por el panel administrativo.
      const [activeCategories, completeCategories] =
        await Promise.all([
          getActiveCategories(),
          getCategories(),
        ])

      setCategories(activeCategories)
      setAllCategories(completeCategories)

      // Reflejamos inmediatamente el nuevo nombre de la categoría
      // en los productos que ya están visibles en la tabla.
      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product.category_id === updatedCategory.id
            ? {
              ...product,
              category: updatedCategory.name,
            }
            : product,
        ),
      )

      // Si estamos editando un producto cuya categoría acaba
      // de cambiar de nombre, actualizamos también ese texto.
      if (Number(categoryId) === updatedCategory.id) {
        setEditingCategoryName(updatedCategory.name)
      }

      resetCategoryEdit()
    } catch (requestError) {
      setCategoryManagerError(
        requestError instanceof Error
          ? requestError.message
          : 'No se pudo actualizar la categoría.',
      )
    } finally {
      setCategoryUpdating(false)
    }
  }

  const handleToggleCategoryStatus = async (
    category: Category,
  ) => {
    const action = category.is_active
      ? 'desactivar'
      : 'activar'

    const confirmed = window.confirm(
      `¿Deseas ${action} la categoría "${category.name}"?`,
    )

    if (!confirmed) {
      return
    }

    const data: UpdateCategoryData = {
      name: category.name,
      description: category.description,
      is_active: !category.is_active,
    }

    try {
      setCategoryUpdating(true)
      setCategoryManagerError('')

      await updateCategory(
        category.id,
        data,
      )

      const [activeCategories, completeCategories] =
        await Promise.all([
          getActiveCategories(),
          getCategories(),
        ])

      setCategories(activeCategories)
      setAllCategories(completeCategories)

      // Si estamos creando un producto y acabamos de desactivar
      // su categoría seleccionada, elegimos otra categoría activa.
      if (
        editingId === null &&
        category.is_active &&
        Number(categoryId) === category.id
      ) {
        setCategoryId(
          activeCategories.length > 0
            ? String(activeCategories[0].id)
            : '',
        )
      }

      resetCategoryEdit()
    } catch (requestError) {
      setCategoryManagerError(
        requestError instanceof Error
          ? requestError.message
          : 'No se pudo actualizar el estado de la categoría.',
      )
    } finally {
      setCategoryUpdating(false)
    }
  }

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      setCategoryError(
        'El nombre de la categoría es obligatorio.',
      )
      return
    }

    try {
      setCategorySaving(true)
      setCategoryError('')

      // Registramos la categoría en FastAPI/PostgreSQL.
      const createdCategory = await createCategory({
        name: newCategoryName.trim(),
        description:
          newCategoryDescription.trim() || null,
      })

      // Volvemos a consultar las categorías activas para
      // mantener el selector sincronizado con el backend.
      const updatedCategories =
        await getActiveCategories()

      setCategories(updatedCategories)

      // Seleccionamos automáticamente la categoría recién creada.
      setCategoryId(
        String(createdCategory.id),
      )

      // Cerramos únicamente el formulario auxiliar.
      resetCategoryForm()
    } catch (requestError) {
      setCategoryError(
        requestError instanceof Error
          ? requestError.message
          : 'No se pudo crear la categoría.',
      )
    } finally {
      setCategorySaving(false)
    }
  }

  // Comprueba si la categoría actual todavía está activa.
  const currentCategoryIsAvailable = categories.some(
    (category) =>
      category.id === Number(categoryId),
  )

  // ------------------------------------------------------------
  // CREAR O EDITAR
  // ------------------------------------------------------------

  const handleSave = async () => {
    if (
      !name.trim() ||
      !categoryId ||
      !price.trim() ||
      !sku.trim()
    ) {
      setFormError(
        'Completa nombre, categoría, precio y SKU.',
      )
      return
    }

    const numericPrice = Number(price)

    if (
      Number.isNaN(numericPrice) ||
      numericPrice < 0
    ) {
      setFormError(
        'El precio debe ser un número válido mayor o igual a 0.',
      )
      return
    }

    try {
      setSaving(true)
      setFormError('')

      if (editingId === null) {
        const data: CreateProductData = {
          name: name.trim(),
          category_id: Number(categoryId),
          price: numericPrice,
          sku: sku.trim(),
          description: description.trim() || null,
        }

        await createProduct(data)
      } else {
        const data: UpdateProductData = {
          name: name.trim(),
          category_id: Number(categoryId),
          price: numericPrice,
          sku: sku.trim(),
          description: description.trim() || null,
          is_active: isActive,
        }

        await updateProduct(
          editingId,
          data,
        )
      }

      resetForm()

      // Volvemos a consultar para obtener también
      // categoría y stock actualizados.
      await loadData()
    } catch (requestError) {
      setFormError(
        requestError instanceof Error
          ? requestError.message
          : 'No se pudo guardar el producto.',
      )
    } finally {
      setSaving(false)
    }
  }

  // ------------------------------------------------------------
  // ACTIVAR / DESACTIVAR
  // ------------------------------------------------------------

  const handleToggleStatus = async (
    product: Product,
  ) => {
    const action = product.is_active
      ? 'desactivar'
      : 'activar'

    const confirmed = window.confirm(
      `¿Deseas ${action} el producto "${product.name}"?`,
    )

    if (!confirmed) {
      return
    }

    const data: UpdateProductData = {
      name: product.name,
      category_id: product.category_id,
      price: Number(product.price),
      sku: product.sku,
      description: product.description,
      is_active: !product.is_active,
    }

    try {
      setError('')

      await updateProduct(
        product.id,
        data,
      )

      await loadData()
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No se pudo actualizar el estado del producto.',
      )
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">

      {/* El título principal ya se muestra en el Header global. */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <p className="max-w-2xl text-sm text-slate-500">
          Administra el catálogo de productos y consulta su
          información comercial e inventario disponible.
        </p>

        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800"
        >
          <Plus size={18} />
          Nuevo producto
        </button>
      </div>

      {/* Indicadores principales. */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Productos registrados
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {products.length}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <Package size={20} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Productos activos
              </p>

              <p className="mt-2 text-2xl font-bold text-emerald-600">
                {activeProducts}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={20} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Categorías activas
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {categories.length}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <Tags size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Mensaje general de error. */}
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

      {/* Catálogo de productos. */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Catálogo de productos
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Consulta y administra los productos registrados.
            </p>
          </div>

          <div className="relative w-full md:max-w-sm">
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
              placeholder="Buscar producto, categoría o SKU..."
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1150px] text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Producto
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Categoría
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  SKU
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Precio
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Stock
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Estado
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [1, 2, 3, 4].map((row) => (
                  <tr key={row}>
                    {Array.from({ length: 7 }).map(
                      (_, index) => (
                        <td
                          key={index}
                          className="px-5 py-5"
                        >
                          <div className="h-4 animate-pulse rounded bg-slate-100" />
                        </td>
                      ),
                    )}
                  </tr>
                ))
              ) : (
                filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="transition-colors hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">
                        {product.name}
                      </p>

                      {product.description && (
                        <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                          {product.description}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {product.category}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-medium text-slate-600">
                        {product.sku}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                      S/ {Number(product.price).toFixed(2)}
                    </td>

                    {/* El stock solo se consulta desde inventory. */}
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {product.stock}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${product.is_active
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                          }`}
                      >
                        {product.is_active
                          ? 'Activo'
                          : 'Inactivo'}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            openEditForm(product)
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                        >
                          <Pencil size={14} />
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            void handleToggleStatus(product)
                          }
                          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${product.is_active
                            ? 'border-red-200 text-red-600 hover:bg-red-50'
                            : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                            }`}
                        >
                          {product.is_active ? (
                            <>
                              <PowerOff size={14} />
                              Desactivar
                            </>
                          ) : (
                            <>
                              <Power size={14} />
                              Activar
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {!loading &&
            filteredProducts.length === 0 && (
              <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                <PackageSearch
                  size={34}
                  className="text-slate-300"
                />

                <h3 className="mt-3 font-semibold text-slate-900">
                  No se encontraron productos
                </h3>

                <p className="mt-1 max-w-sm text-sm text-slate-500">
                  Prueba con otro nombre, categoría,
                  descripción o código SKU.
                </p>
              </div>
            )}
        </div>
      </div>

      {/* Formulario de creación y edición. */}
      <Modal
        open={showForm}
        onClose={() => {
          // No cerramos el formulario mientras existe una operación en curso.
          if (!saving && !categorySaving && !categoryUpdating) {
            resetForm()
          }
        }}
        panelClassName="max-w-lg"
      >

        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {editingId === null
                ? 'Nuevo producto'
                : 'Editar producto'}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {editingId === null
                ? 'Registra un producto en el catálogo.'
                : 'Actualiza la información comercial del producto.'}
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

        {/* Error producido al crear o editar el producto. */}
        {formError && (
          <div className="mx-6 mt-5 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0 text-red-600"
              />

              <div>
                <p className="text-sm font-semibold text-red-800">
                  No fue posible guardar el producto
                </p>

                <p className="mt-1 text-sm text-red-700">
                  {formError}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-5 p-6">
          <div>
            <label
              htmlFor="product-name"
              className="text-sm font-semibold text-slate-700"
            >
              Nombre
            </label>

            <input
              id="product-name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Ej. Laptop empresarial"
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-slate-100"
            />
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <label
                htmlFor="product-category"
                className="text-sm font-semibold text-slate-700"
              >
                Categoría
              </label>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    void openCategoryManager()
                  }
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 transition-colors hover:text-slate-900"
                >
                  <Tags size={14} />
                  Administrar
                </button>

                <button
                  type="button"
                  onClick={() => {
                    // Evitamos mostrar simultáneamente creación
                    // y administración de categorías.
                    closeCategoryManager()
                    setCategoryError('')
                    setShowCategoryForm(true)
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700"
                >
                  <Plus size={14} />
                  Nueva categoría
                </button>
              </div>
            </div>

            <select
              id="product-category"
              value={categoryId}
              onChange={(event) =>
                setCategoryId(event.target.value)
              }
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-slate-100"
            >
              {/* Conserva la categoría actual si está inactiva. */}
              {editingId !== null &&
                !currentCategoryIsAvailable && (
                  <option value={categoryId}>
                    {editingCategoryName} — categoría no activa
                  </option>
                )}

              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
            </select>

            {editingId !== null &&
              !currentCategoryIsAvailable && (
                <p className="mt-2 text-xs text-amber-600">
                  La categoría actual está inactiva.
                  Puedes conservarla o seleccionar una categoría activa.
                </p>
              )}

            {/* Creación rápida sin abandonar el producto. */}
            {showCategoryForm && (
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Nueva categoría
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      La categoría quedará seleccionada automáticamente.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={resetCategoryForm}
                    disabled={categorySaving}
                    aria-label="Cerrar creación de categoría"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white hover:text-slate-700 disabled:opacity-50"
                  >
                    <X size={16} />
                  </button>
                </div>

                {categoryError && (
                  <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
                    <AlertCircle
                      size={17}
                      className="mt-0.5 shrink-0 text-red-600"
                    />

                    <p className="text-xs text-red-700">
                      {categoryError}
                    </p>
                  </div>
                )}

                <div className="mt-4 space-y-4">
                  <div>
                    <label
                      htmlFor="new-category-name"
                      className="text-xs font-semibold text-slate-700"
                    >
                      Nombre
                    </label>

                    <input
                      id="new-category-name"
                      type="text"
                      value={newCategoryName}
                      onChange={(event) =>
                        setNewCategoryName(event.target.value)
                      }
                      placeholder="Ej. Muebles"
                      className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="new-category-description"
                      className="text-xs font-semibold text-slate-700"
                    >
                      Descripción
                    </label>

                    <input
                      id="new-category-description"
                      type="text"
                      value={newCategoryDescription}
                      onChange={(event) =>
                        setNewCategoryDescription(
                          event.target.value,
                        )
                      }
                      placeholder="Descripción opcional"
                      className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-100"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={resetCategoryForm}
                      disabled={categorySaving}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      Cancelar
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        void handleCreateCategory()
                      }
                      disabled={categorySaving}
                      className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {categorySaving
                        ? 'Creando...'
                        : 'Crear categoría'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Administración de categorías existentes. */}
            {showCategoryManager && (
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Tags
                        size={17}
                        className="text-slate-500"
                      />

                      <p className="text-sm font-semibold text-slate-800">
                        Administrar categorías
                      </p>
                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                      Edita, activa o desactiva las categorías registradas.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeCategoryManager}
                    disabled={categoryUpdating}
                    aria-label="Cerrar administración de categorías"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white hover:text-slate-700 disabled:opacity-50"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Los errores de categorías se muestran dentro del panel. */}
                {categoryManagerError && (
                  <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
                    <AlertCircle
                      size={17}
                      className="mt-0.5 shrink-0 text-red-600"
                    />

                    <p className="text-xs text-red-700">
                      {categoryManagerError}
                    </p>
                  </div>
                )}

                {categoryManagerLoading ? (
                  <div className="mt-4 space-y-2">
                    {[1, 2, 3].map((item) => (
                      <div
                        key={item}
                        className="h-16 animate-pulse rounded-lg bg-slate-200"
                      />
                    ))}
                  </div>
                ) : allCategories.length === 0 ? (
                  <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-white p-5 text-center">
                    <Tags
                      size={24}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-2 text-sm font-medium text-slate-700">
                      No hay categorías registradas
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 space-y-2">
                    {allCategories.map((category) => (
                      <div
                        key={category.id}
                        className="rounded-lg border border-slate-200 bg-white p-3"
                      >
                        {editingCategoryId === category.id ? (
                          <div className="space-y-3">
                            <div>
                              <label
                                htmlFor={`category-name-${category.id}`}
                                className="text-xs font-semibold text-slate-700"
                              >
                                Nombre
                              </label>

                              <input
                                id={`category-name-${category.id}`}
                                type="text"
                                value={categoryEditName}
                                onChange={(event) =>
                                  setCategoryEditName(
                                    event.target.value,
                                  )
                                }
                                disabled={categoryUpdating}
                                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-100 disabled:bg-slate-100"
                              />
                            </div>

                            <div>
                              <label
                                htmlFor={`category-description-${category.id}`}
                                className="text-xs font-semibold text-slate-700"
                              >
                                Descripción
                              </label>

                              <input
                                id={`category-description-${category.id}`}
                                type="text"
                                value={categoryEditDescription}
                                onChange={(event) =>
                                  setCategoryEditDescription(
                                    event.target.value,
                                  )
                                }
                                disabled={categoryUpdating}
                                placeholder="Descripción opcional"
                                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-100 disabled:bg-slate-100"
                              />
                            </div>

                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={resetCategoryEdit}
                                disabled={categoryUpdating}
                                className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
                              >
                                Cancelar
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  void handleUpdateCategory()
                                }
                                disabled={categoryUpdating}
                                className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {categoryUpdating
                                  ? 'Guardando...'
                                  : 'Guardar cambios'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="truncate text-sm font-semibold text-slate-800">
                                  {category.name}
                                </p>

                                <span
                                  className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${category.is_active
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-slate-100 text-slate-500'
                                    }`}
                                >
                                  {category.is_active
                                    ? 'Activa'
                                    : 'Inactiva'}
                                </span>
                              </div>

                              <p className="mt-1 text-xs text-slate-500">
                                {category.description ||
                                  'Sin descripción'}
                              </p>
                            </div>

                            <div className="flex shrink-0 items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  openCategoryEdit(category)
                                }
                                disabled={categoryUpdating}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
                              >
                                <Pencil size={13} />
                                Editar
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  void handleToggleCategoryStatus(
                                    category,
                                  )
                                }
                                disabled={categoryUpdating}
                                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-semibold transition-colors disabled:opacity-50 ${category.is_active
                                  ? 'border-red-200 text-red-600 hover:bg-red-50'
                                  : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                                  }`}
                              >
                                {category.is_active ? (
                                  <>
                                    <PowerOff size={13} />
                                    Desactivar
                                  </>
                                ) : (
                                  <>
                                    <Power size={13} />
                                    Activar
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

          <div>
            <label
              htmlFor="product-price"
              className="text-sm font-semibold text-slate-700"
            >
              Precio
            </label>

            <div className="relative mt-2">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                S/
              </span>

              <input
                id="product-price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(event) =>
                  setPrice(event.target.value)
                }
                placeholder="0.00"
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-slate-100"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="product-sku"
              className="text-sm font-semibold text-slate-700"
            >
              SKU
            </label>

            <input
              id="product-sku"
              type="text"
              value={sku}
              onChange={(event) =>
                setSku(event.target.value)
              }
              placeholder="Ej. LAP-001"
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 font-mono text-sm outline-none focus:ring-2 focus:ring-slate-100"
            />

            <p className="mt-2 text-xs text-slate-400">
              El SKU debe ser único para cada producto.
            </p>
          </div>

          <div>
            <label
              htmlFor="product-description"
              className="text-sm font-semibold text-slate-700"
            >
              Descripción
            </label>

            <textarea
              id="product-description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Descripción opcional"
              rows={3}
              className="mt-2 w-full resize-none rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-slate-100"
            />
          </div>

          {/* El stock se modifica únicamente desde Inventario. */}
          {editingId !== null && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-700">
                Inventario
              </p>

              <p className="mt-1 text-xs text-slate-500">
                El stock no se modifica desde Productos.
                Utiliza el módulo Inventario para administrar existencias.
              </p>
            </div>
          )}
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
            onClick={() => void handleSave()}
            disabled={
              saving ||
              (
                editingId === null &&
                categories.length === 0
              )
            }
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? 'Guardando...'
              : editingId === null
                ? 'Crear producto'
                : 'Guardar cambios'}
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default Productos