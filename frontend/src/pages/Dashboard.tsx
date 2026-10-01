import { useEffect, useState } from 'react'

import {
  Boxes,
  ShoppingCart,
  Target,
} from 'lucide-react'

import StatCard from '../components/dashboard/StatCard'
import SalesChart from '../components/dashboard/SalesChart'
import SalesByBranchChart from '../components/dashboard/SalesByBranchChart'
import SalesByProductChart from '../components/dashboard/SalesByProductChart'
import RecentActivity from '../components/dashboard/RecentActivity'

import {
  getCurrentUser,
  getInventory,
  getReports,
  getSales,
} from '../services/api'

// Importamos únicamente los tipos necesarios para TypeScript.
import type {
  InventoryItem,
  ReportsResponse,
  Sale,
} from '../services/api'

// Roles disponibles dentro de MatrixFlow.
type UserRole = 'Administrador' | 'Analista' | 'Consulta'

function Dashboard() {
  // Obtenemos el usuario autenticado y su rol actual.
  const currentUser = getCurrentUser()

  // El rol determina qué información puede consultar el usuario.
  const currentRole = currentUser?.role as UserRole | undefined

  // Guardamos el total acumulado de ventas.
  const [totalSales, setTotalSales] = useState(0)

  // Guardamos la cantidad total de unidades disponibles.
  const [totalInventory, setTotalInventory] = useState(0)

  // Controlamos el estado de carga de las métricas principales.
  const [loading, setLoading] = useState(true)

  // Guardamos cualquier error producido durante la consulta.
  const [error, setError] = useState('')

  useEffect(() => {
    // Cargamos las métricas respetando los permisos del usuario.
    async function loadDashboardStats() {
      try {
        setLoading(true)
        setError('')

        // El rol Consulta utiliza el reporte autorizado para obtener
        // las métricas generales sin acceder directamente a ventas.
        if (currentRole === 'Consulta') {
          const reports: ReportsResponse = await getReports()

          // Calculamos las ventas acumuladas a partir de los registros reales.
          const salesTotal = reports.sales.reduce(
            (accumulator, sale) => accumulator + Number(sale.total),
            0,
          )

          // Calculamos las unidades disponibles sumando el stock existente.
          const inventoryTotal = reports.inventory.reduce(
            (accumulator, item) => accumulator + Number(item.stock),
            0,
          )

          setTotalSales(salesTotal)
          setTotalInventory(inventoryTotal)

          return
        }

        // Administrador y Analista pueden consultar ventas e inventario.
        const [sales, inventory] = await Promise.all([
          getSales(),
          getInventory(),
        ])

        // Sumamos los importes de todas las ventas.
        const salesTotal = (sales as Sale[]).reduce(
          (accumulator, sale) => accumulator + Number(sale.total),
          0,
        )

        // Sumamos las existencias de todos los registros de inventario.
        const inventoryTotal = (inventory as InventoryItem[]).reduce(
          (accumulator, item) => accumulator + Number(item.stock),
          0,
        )

        setTotalSales(salesTotal)
        setTotalInventory(inventoryTotal)
      } catch (requestError) {
        // Mostramos un mensaje claro sin utilizar información simulada.
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'No se pudieron cargar las métricas del Dashboard.',
        )
      } finally {
        // Finalizamos el estado de carga independientemente del resultado.
        setLoading(false)
      }
    }

    loadDashboardStats()
  }, [currentRole])

  return (
    <div className="min-h-full bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Encabezado principal del Dashboard. */}
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />

            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Panel empresarial
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Visión general de ventas, inventario y comportamiento comercial.
          </p>
        </div>

        {/* Mostramos el error únicamente cuando existe un problema real. */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />

            <div>
              <p className="font-semibold">No se pudo actualizar la información</p>

              <p className="mt-1 text-red-600">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Indicadores principales del negocio. */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <StatCard
            title="Ventas totales"
            value={
              loading
                ? 'Cargando...'
                : `S/ ${totalSales.toLocaleString('es-PE', {
                  minimumFractionDigits: 2,
                })}`
            }
            description="Ventas acumuladas"
            icon={ShoppingCart}
          />

          <StatCard
            title="Inventario"
            value={
              loading
                ? 'Cargando...'
                : totalInventory.toLocaleString('es-PE')
            }
            description="Unidades disponibles"
            icon={Boxes}
          />

          <StatCard
            title="Cumplimiento"
            value="N/D"
            description="Meta empresarial no configurada"
            icon={Target}
          />
        </div>

        {/* Contenido analítico disponible para Administrador y Analista. */}
        {currentRole !== 'Consulta' && (
          <>
            {/* Evolución temporal de las ventas. */}
            <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Ventas por período
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Evolución de las ventas registradas.
                    </p>
                  </div>

                  <div className="hidden rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500 sm:block">
                    Evolución comercial
                  </div>
                </div>
              </div>

              <div className="p-6">
                <SalesChart />
              </div>
            </section>

            {/* Distribuciones comerciales por sucursal y producto. */}
            <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-6 py-5">
                  <h2 className="text-lg font-bold text-slate-900">
                    Ventas por sucursal
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Distribución de ventas entre las sucursales.
                  </p>
                </div>

                <div className="p-6">
                  <SalesByBranchChart />
                </div>
              </section>

              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-6 py-5">
                  <h2 className="text-lg font-bold text-slate-900">
                    Ventas por producto
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Distribución de ventas según los productos registrados.
                  </p>
                </div>

                <div className="p-6">
                  <SalesByProductChart />
                </div>
              </section>
            </div>

            {/* Actividad reciente del sistema. */}
            <section className="mt-6">
              <RecentActivity />
            </section>
          </>
        )}

        {/* La vista Consulta mantiene únicamente la información permitida. */}
        {currentRole === 'Consulta' && (
          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                <Target className="h-5 w-5 text-slate-600" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Vista de consulta
                </h2>

                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                  Las métricas principales están disponibles de acuerdo con
                  el nivel de acceso asignado a tu usuario.
                </p>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

export default Dashboard