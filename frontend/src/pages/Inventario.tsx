// ============================================================
// MATRIXFLOW ENTERPRISE
// Módulo de Inventario
// ============================================================
//
// Esta página consulta y muestra el inventario real obtenido
// desde el backend mediante getInventory().
//
// Importante:
// - No se utilizan datos ficticios.
// - No se modifica la información recibida del backend.
// - Los indicadores superiores se calculan únicamente a partir
//   de los registros reales.
// - La interfaz utiliza exclusivamente el tema claro.
// ============================================================

import { useEffect, useState } from 'react'

// Importamos la función que consulta el inventario real.
import { getInventory } from '../services/api'

// Importamos InventoryItem únicamente como tipo de TypeScript.
import type { InventoryItem } from '../services/api'

function Inventario() {
  // ==========================================================
  // ESTADO
  // ==========================================================

  // Guardamos los registros reales recibidos desde PostgreSQL.
  const [items, setItems] = useState<InventoryItem[]>([])

  // Indica si todavía estamos esperando la respuesta del backend.
  const [loading, setLoading] = useState(true)

  // Guarda cualquier error producido durante la consulta.
  const [error, setError] = useState<string | null>(null)

  // ==========================================================
  // CONSULTA DEL INVENTARIO
  // ==========================================================

  // Consultamos el inventario cuando se carga la página.
  useEffect(() => {
    async function loadInventory() {
      try {
        // Activamos el estado de carga antes de consultar.
        setLoading(true)

        // Limpiamos cualquier error anterior.
        setError(null)

        // Obtenemos los datos reales mediante FastAPI.
        const data = await getInventory()

        // Guardamos los registros recibidos.
        setItems(data)
      } catch (err) {
        // Mostramos el mensaje recibido desde el servicio.
        setError(
          err instanceof Error
            ? err.message
            : 'Ocurrió un error al obtener el inventario.',
        )
      } finally {
        // Finalizamos el estado de carga.
        setLoading(false)
      }
    }

    loadInventory()
  }, [])

  // ==========================================================
  // INDICADORES DERIVADOS
  // ==========================================================
  //
  // Estos valores se calculan exclusivamente a partir de los
  // registros reales obtenidos desde el backend.
  // ==========================================================

  // Cantidad total de unidades almacenadas.
  const totalStock = items.reduce(
    (total, item) => total + Number(item.stock),
    0,
  )

  // Cantidad de registros que se encuentran en stock bajo.
  const lowStockItems = items.filter(
    (item) => item.stock <= item.minimum_stock,
  ).length

  // ==========================================================
  // ESTADO DE CARGA
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          {/* Encabezado simulado durante la carga. */}
          <div className="mb-8">
            <div className="h-8 w-56 animate-pulse rounded-lg bg-slate-200" />

            <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-slate-200" />
          </div>

          {/* Tarjeta simulada para representar la tabla. */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="space-y-4 p-6">
              <div className="h-12 animate-pulse rounded-lg bg-slate-100" />
              <div className="h-12 animate-pulse rounded-lg bg-slate-100" />
              <div className="h-12 animate-pulse rounded-lg bg-slate-100" />
              <div className="h-12 animate-pulse rounded-lg bg-slate-100" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ==========================================================
  // ESTADO DE ERROR
  // ==========================================================

  if (error) {
    return (
      <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-red-200 bg-white p-8 shadow-sm">
            <div className="flex items-start gap-4">
              {/* Icono de advertencia. */}
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="9" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  No se pudo cargar el inventario
                </h2>

                <p className="mt-1 text-sm text-slate-600">
                  {error}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ==========================================================
  // INTERFAZ PRINCIPAL
  // ==========================================================

  return (
    <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        {/* ====================================================
            ENCABEZADO
            ==================================================== */}

        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            {/* Pequeño indicador visual de la sección. */}
            <span className="h-1.5 w-8 rounded-full bg-slate-400" />

            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Gestión empresarial
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Inventario
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Consulta y supervisa el estado actual del inventario
            registrado en las sucursales de la empresa.
          </p>
        </div>

        {/* ====================================================
            INDICADORES
            ==================================================== */}

        <div className="mb-6 grid gap-4 md:grid-cols-3">

          {/* Cantidad de registros. */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Registros de inventario
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  {items.length}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Registros disponibles actualmente
                </p>
              </div>

              {/* Icono neutro para mantener la paleta clara. */}
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Z" />
                  <path d="M4 7.5 12 12l8-4.5" />
                  <path d="M12 12v9" />
                </svg>
              </div>
            </div>
          </div>

          {/* Cantidad total de unidades. */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Unidades en inventario
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  {totalStock}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Suma de existencias registradas
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <path d="M5 8h14" />
                  <path d="M5 12h14" />
                  <path d="M5 16h9" />
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                </svg>
              </div>
            </div>
          </div>

          {/* Registros con stock bajo. */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Stock bajo
                </p>

                <p
                  className={`mt-2 text-3xl font-bold tracking-tight ${lowStockItems > 0
                    ? 'text-amber-600'
                    : 'text-slate-900'
                    }`}
                >
                  {lowStockItems}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Registros bajo el mínimo configurado
                </p>
              </div>

              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${lowStockItems > 0
                  ? 'bg-amber-50 text-amber-600'
                  : 'bg-slate-100 text-slate-600'
                  }`}
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <path d="M12 3 2.8 19h18.4L12 3Z" />
                  <path d="M12 9v4" />
                  <path d="M12 16h.01" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* ====================================================
            TABLA PRINCIPAL
            ==================================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Cabecera de la sección. */}
          <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Existencias registradas
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Detalle de productos, stock mínimo y costo unitario.
              </p>
            </div>
          </div>

          {/* ==================================================
              ESTADO VACÍO
              ================================================== */}

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <svg
                  className="h-7 w-7"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  aria-hidden="true"
                >
                  <path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Z" />
                  <path d="M4 7.5 12 12l8-4.5" />
                  <path d="M12 12v9" />
                </svg>
              </div>

              <h3 className="mt-4 text-base font-semibold text-slate-900">
                No hay registros de inventario
              </h3>

              <p className="mt-1 max-w-md text-sm text-slate-500">
                Actualmente no existen registros disponibles para
                mostrar en esta sección.
              </p>
            </div>
          ) : (

            /* ==================================================
               TABLA DE INVENTARIO
               ================================================== */

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">

                {/* Encabezados de la tabla. */}
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      ID
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Sucursal
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Producto
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Stock
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Stock mínimo
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Costo unitario
                    </th>
                  </tr>
                </thead>

                {/* Cuerpo de la tabla. */}
                <tbody className="divide-y divide-slate-100">

                  {items.map((item) => {

                    // Calculamos únicamente un estado visual a
                    // partir de los datos reales del backend.
                    const lowStock =
                      item.stock <= item.minimum_stock

                    return (
                      <tr
                        key={item.id}
                        className="transition-colors hover:bg-slate-50"
                      >

                        {/* ID del registro. */}
                        <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-700">
                          #{item.id}
                        </td>

                        {/* Identificador de la sucursal. */}
                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                          {item.branch_id}
                        </td>

                        {/* Identificador del producto. */}
                        <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-800">
                          {item.product_id}
                        </td>

                        {/* Stock actual con indicador visual. */}
                        <td className="whitespace-nowrap px-5 py-4 text-right">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${lowStock
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-emerald-50 text-emerald-700'
                              }`}
                          >
                            {item.stock}
                          </span>
                        </td>

                        {/* Stock mínimo configurado. */}
                        <td className="whitespace-nowrap px-5 py-4 text-right text-sm text-slate-600">
                          {item.minimum_stock}
                        </td>

                        {/* Costo unitario real. */}
                        <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-medium text-slate-800">
                          {item.unit_cost != null
                            ? `S/ ${Number(item.unit_cost).toFixed(2)}`
                            : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Exportamos la página de Inventario.
export default Inventario