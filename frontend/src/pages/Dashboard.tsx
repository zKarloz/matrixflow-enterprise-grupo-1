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


function Dashboard() {
  // Información de la cuenta incluida dentro del JWT.
  const currentUser =
    getCurrentUser()

  // La forma del saludo puede configurarse por usuario.
  const greetingStorageKey =
    currentUser
      ? `matrixflow-greeting-name-${currentUser.userId}`
      : 'matrixflow-greeting-name'

  const greetingNameMode =
    localStorage.getItem(
      greetingStorageKey,
    ) === 'username'
      ? 'username'
      : 'full_name'

  // Nombre final utilizado en el saludo.
  const greetingName =
    currentUser
      ? (
        greetingNameMode === 'username'
          ? currentUser.username
          : currentUser.fullName
      )
      : null

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
            Añadimos una bienvenida personalizada para la sesión. */}
        <div className="mb-8">
          {greetingName && (
            <div className="mb-5">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                ¡Hola, {greetingName}!
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Bienvenido nuevamente a MatrixFlow Enterprise. Consulta los indicadores de tu negocio y toma decisiones informadas.
              </p>
            </div>
          )}
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
          dashboard && (
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
                  {/* En teléfonos el gráfico mantiene un ancho
                      suficiente para evitar que sus datos se compriman.
                      La barra horizontal pertenece solo al gráfico. */}
                  <div className="overflow-x-auto pb-2">
                    <div className="min-w-[680px] md:min-w-0">
                      <SalesChart
                        data={
                          dashboard
                            .sales_by_period
                        }
                      />
                    </div>
                  </div>
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
                    {/* Scroll independiente para conservar la
                        legibilidad del gráfico en teléfonos. */}
                    <div className="overflow-x-auto pb-2">
                      <div className="min-w-[680px] md:min-w-0">
                        <SalesByBranchChart
                          data={
                            dashboard
                              .sales_by_branch
                          }
                        />
                      </div>
                    </div>
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
                    {/* Los nombres de productos suelen ser largos,
                        por eso evitamos comprimirlos en pantallas pequeñas. */}
                    <div className="overflow-x-auto pb-2">
                      <div className="min-w-[680px] md:min-w-0">
                        <SalesByProductChart
                          data={
                            dashboard
                              .sales_by_product
                          }
                        />
                      </div>
                    </div>
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
      </div>
    </div>
  )
}


export default Dashboard