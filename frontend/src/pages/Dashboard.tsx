import {
  useEffect,
  useState,
} from 'react'

import {
  Boxes,
  ReceiptText,
  ShoppingCart,
} from 'lucide-react'

import StatCard from '../components/dashboard/StatCard'
import SalesChart from '../components/dashboard/SalesChart'
import SalesByBranchChart from '../components/dashboard/SalesByBranchChart'
import SalesByProductChart from '../components/dashboard/SalesByProductChart'
import RecentActivity from '../components/dashboard/RecentActivity'

import {
  getCurrentUser,
  getDashboard,
} from '../services/api'

import type {
  DashboardResponse,
} from '../services/api'


// Roles disponibles en MatrixFlow.
type UserRole =
  | 'Administrador'
  | 'Analista'
  | 'Consulta'


function Dashboard() {
  // Obtenemos el rol almacenado en el JWT.
  const currentUser =
    getCurrentUser()

  const currentRole =
    currentUser?.role as
    | UserRole
    | undefined


  // Toda la información del Dashboard se almacena
  // en un único estado.
  const [
    dashboard,
    setDashboard,
  ] = useState<
    DashboardResponse | null
  >(null)


  const [
    loading,
    setLoading,
  ] = useState(true)


  const [
    error,
    setError,
  ] = useState('')


  // ----------------------------------------------------------
  // CARGAR DASHBOARD
  // ----------------------------------------------------------

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true)
        setError('')

        // Una única petición obtiene KPIs, gráficos
        // y actividad reciente.
        const response =
          await getDashboard()

        setDashboard(
          response,
        )
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'No se pudo cargar el Dashboard.',
        )
      } finally {
        setLoading(false)
      }
    }


    void loadDashboard()
  }, [])


  return (
    <div className="min-h-full bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* El Header global ya muestra el título Dashboard.
            Evitamos repetir un segundo H1 dentro de la página. */}
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />

            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Panel empresarial
            </span>
          </div>

          <p className="max-w-2xl text-sm text-slate-500">
            Visión general de ventas,
            inventario y comportamiento
            comercial.
          </p>
        </div>


        {/* Error general del Dashboard. */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-red-500" />

            <div>
              <p className="font-semibold">
                No se pudo actualizar la información
              </p>

              <p className="mt-1 text-red-600">
                {error}
              </p>
            </div>
          </div>
        )}


        {/* ====================================================
            INDICADORES
            ==================================================== */}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <StatCard
            title="Ventas totales"
            value={
              loading
                ? 'Cargando...'
                : dashboard
                  ? `S/ ${Number(
                    dashboard
                      .summary
                      .total_sales,
                  ).toLocaleString(
                    'es-PE',
                    {
                      minimumFractionDigits: 2,
                    },
                  )}`
                  : 'N/D'
            }
            description="Ingresos acumulados por ventas"
            icon={ShoppingCart}
          />


          <StatCard
            title="Inventario"
            value={
              loading
                ? 'Cargando...'
                : dashboard
                  ? Number(
                    dashboard
                      .summary
                      .total_inventory,
                  ).toLocaleString(
                    'es-PE',
                  )
                  : 'N/D'
            }
            description="Unidades disponibles"
            icon={Boxes}
          />


          <StatCard
            title="Ventas registradas"
            value={
              loading
                ? 'Cargando...'
                : dashboard
                  ? Number(
                    dashboard
                      .summary
                      .sales_count,
                  ).toLocaleString(
                    'es-PE',
                  )
                  : 'N/D'
            }
            description="Operaciones comerciales"
            icon={ReceiptText}
          />
        </div>


        {/* ====================================================
            ANALÍTICA
            ==================================================== */}

        {!loading &&
          dashboard &&
          currentRole !==
          'Consulta' && (
            <>
              {/* Evolución temporal. */}
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
                  <SalesChart
                    data={
                      dashboard
                        .sales_by_period
                    }
                  />
                </div>
              </section>


              {/* Sucursal y producto. */}
              <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-100 px-6 py-5">
                    <h2 className="text-lg font-bold text-slate-900">
                      Ventas por sucursal
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Distribución del importe vendido entre sucursales.
                    </p>
                  </div>

                  <div className="p-6">
                    <SalesByBranchChart
                      data={
                        dashboard
                          .sales_by_branch
                      }
                    />
                  </div>
                </section>


                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-100 px-6 py-5">
                    <h2 className="text-lg font-bold text-slate-900">
                      Ventas por producto
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Importe acumulado según los productos vendidos.
                    </p>
                  </div>

                  <div className="p-6">
                    <SalesByProductChart
                      data={
                        dashboard
                          .sales_by_product
                      }
                    />
                  </div>
                </section>
              </div>


              {/* Actividad reciente. */}
              <section className="mt-6">
                <RecentActivity
                  data={
                    dashboard
                      .recent_sales
                  }
                />
              </section>
            </>
          )}


        {/* ====================================================
            USUARIO CONSULTA
            ==================================================== */}

        {!loading &&
          dashboard &&
          currentRole ===
          'Consulta' && (
            <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Vista de consulta
                </h2>

                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                  Las métricas principales están disponibles de
                  acuerdo con el nivel de acceso asignado a tu
                  usuario.
                </p>
              </div>
            </section>
          )}
      </div>
    </div>
  )
}


export default Dashboard