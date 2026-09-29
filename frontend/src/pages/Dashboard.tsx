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

import { getInventory, getSales } from '../services/api'

// Importamos los tipos únicamente para TypeScript.
import type {
  InventoryItem,
  Sale,
} from '../services/api'

function Dashboard() {
  // Guardamos el total real de ventas.
  const [totalSales, setTotalSales] = useState(0)

  // Guardamos la cantidad total de unidades disponibles.
  const [totalInventory, setTotalInventory] = useState(0)

  // Controlamos la carga de las tarjetas superiores.
  const [loading, setLoading] = useState(true)

  // Guardamos cualquier error producido al consultar los datos.
  const [error, setError] = useState('')

  useEffect(() => {
    // Cargamos las métricas reales del Dashboard.
    async function loadDashboardStats() {
      try {
        setLoading(true)
        setError('')

        // Consultamos ventas e inventario en paralelo.
        const [sales, inventory] = await Promise.all([
          getSales(),
          getInventory(),
        ])

        // Sumamos los totales de todas las ventas reales.
        const salesTotal = (sales as Sale[]).reduce(
          (accumulator, sale) =>
            accumulator + Number(sale.total),
          0,
        )

        // Sumamos las existencias reales de todos los registros.
        const inventoryTotal = (inventory as InventoryItem[]).reduce(
          (accumulator, item) =>
            accumulator + Number(item.stock),
          0,
        )

        setTotalSales(salesTotal)
        setTotalInventory(inventoryTotal)
      } catch (requestError) {
        // Mostramos el error real en lugar de utilizar valores simulados.
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'No se pudieron cargar las métricas del Dashboard.',
        )
      } finally {
        // Finalizamos el estado de carga.
        setLoading(false)
      }
    }

    loadDashboardStats()
  }, [])

  return (
    <div>
      {/* Encabezado principal del Dashboard. */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Dashboard
        </h1>

        <p className="mt-2 text-slate-500">
          Resumen general de MatrixFlow Enterprise.
        </p>
      </div>

      {/* Mostramos un error general únicamente si falló la carga
          de las métricas superiores. */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Tarjetas con información proveniente del backend. */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">

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

      {/* Ventas agrupadas por período utilizando datos reales. */}
      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900">
            Ventas por período
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Evolución de las ventas registradas.
          </p>
        </div>

        <SalesChart />

      </div>

      {/* Gráficos secundarios del Dashboard. */}
      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              Ventas por sucursal
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Distribución de ventas entre las sucursales.
            </p>
          </div>

          <SalesByBranchChart />

        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              Ventas por producto
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Información disponible según los datos actuales.
            </p>
          </div>

          <SalesByProductChart />

        </div>

      </div>

      {/* Actividad reciente basada en ventas reales. */}
      <div className="mt-8">
        <RecentActivity />
      </div>

    </div>
  )
}

export default Dashboard