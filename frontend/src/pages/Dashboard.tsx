import {
  Boxes,
  Package,
  ShoppingCart,
  Target,
} from 'lucide-react'

import StatCard from '../components/dashboard/StatCard'
import SalesChart from '../components/dashboard/SalesChart'
import SalesByBranchChart from '../components/dashboard/SalesByBranchChart'
import SalesByProductChart from '../components/dashboard/SalesByProductChart'
import RecentActivity from '../components/dashboard/RecentActivity'

import { dashboardStats } from '../data/dashboard'

function Dashboard() {
  return (
    <div>
      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Dashboard
        </h1>

        <p className="mt-2 text-slate-500">
          Resumen general de MatrixFlow Enterprise.
        </p>
      </div>

      {/* Tarjetas */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          title="Ventas totales"
          value={`S/ ${dashboardStats.totalSales.toLocaleString('es-PE')}`}
          description="Ventas acumuladas"
          icon={ShoppingCart}
        />

        <StatCard
          title="Productos"
          value={dashboardStats.totalProducts.toLocaleString('es-PE')}
          description="Productos registrados"
          icon={Package}
        />

        <StatCard
          title="Inventario"
          value={dashboardStats.inventory.toLocaleString('es-PE')}
          description="Unidades disponibles"
          icon={Boxes}
        />

        <StatCard
          title="Cumplimiento"
          value={`${dashboardStats.goalProgress}%`}
          description="Meta empresarial"
          icon={Target}
        />

      </div>

      {/* Ventas por período */}
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

      {/* Gráficos */}
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
              Distribución de ventas según producto.
            </p>
          </div>

          <SalesByProductChart />

        </div>

      </div>

      {/* Actividad reciente */}
      <div className="mt-8">
        <RecentActivity />
      </div>

    </div>
  )
}

export default Dashboard