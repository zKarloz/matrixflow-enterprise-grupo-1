import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  getBranches,
  getProducts,
  getReports,
} from '../services/api'

import type {
  Branch,
  Product,
  ReportsResponse,
} from '../services/api'

// Componentes utilizados para los gráficos
// empresariales del módulo de reportes.
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

function Reportes() {
  // Guardamos la respuesta real de los reportes.
  const [reports, setReports] = useState<ReportsResponse | null>(null)

  // Guardamos las sucursales reales para sustituir
  // los branch_id por nombres comprensibles.
  const [branches, setBranches] = useState<Branch[]>([])

  // Guardamos los productos reales para sustituir
  // los product_id por sus nombres.
  const [products, setProducts] = useState<Product[]>([])

  // Controlamos el estado de carga de la página.
  const [loading, setLoading] = useState(true)

  // Guardamos cualquier error producido durante la consulta.
  const [error, setError] = useState<string | null>(null)

  // Consultamos los reportes cuando se carga la página.
  useEffect(() => {
    async function loadReports() {
      try {
        setLoading(true)
        setError(null)

        // Consultamos en paralelo los reportes,
        //
        // las sucursales y los productos.
        // Esto evita realizar las peticiones una detrás de otra.
        const [
          reportsData,
          branchesData,
          productsData,
        ] = await Promise.all([
          getReports(),
          getBranches(),
          getProducts(),
        ])

        // Guardamos toda la información real
        // obtenida desde FastAPI.
        setReports(reportsData)
        setBranches(branchesData)
        setProducts(productsData)
      } catch (err) {
        // Mostramos un mensaje amigable si ocurre un problema.
        setError(
          err instanceof Error
            ? err.message
            : 'Ocurrió un error al obtener los reportes.'
        )
      } finally {
        // Finalizamos el estado de carga.
        setLoading(false)
      }
    }

    loadReports()
  }, [])

  // Calculamos métricas únicamente a partir de los datos reales.
  const totalSales =
    reports?.sales.reduce((sum, sale) => sum + sale.total, 0) ?? 0

  const totalInventoryUnits =
    reports?.inventory.reduce((sum, item) => sum + item.stock, 0) ?? 0

  // Calculamos el importe promedio de una venta.
  const averageSale =
    reports && reports.sales.length > 0
      ? totalSales / reports.sales.length
      : 0

  // Calculamos el valor monetario total
  // del inventario actualmente registrado.
  const totalInventoryValue =
    reports?.inventory.reduce(
      (sum, item) => {
        // Si el costo unitario no existe,
        // consideramos cero para este cálculo.
        const unitCost =
          item.unit_cost ?? 0

        return (
          sum +
          item.stock * unitCost
        )
      },
      0,
    ) ?? 0

  // Identificamos cuántos registros requieren
  // atención por tener stock igual o inferior
  // al mínimo establecido.
  const lowStockCount =
    reports?.inventory.filter(
      (item) =>
        item.stock <=
        item.minimum_stock,
    ).length ?? 0

  // Creamos un mapa:
  // branch_id -> nombre de sucursal.
  //
  // useMemo evita reconstruirlo innecesariamente
  // en cada renderizado.
  const branchNames = useMemo(() => {
    return new Map(
      branches.map((branch) => [
        branch.id,
        branch.name,
      ]),
    )
  }, [branches])

  // Creamos un mapa:
  // product_id -> nombre del producto.
  const productNames = useMemo(() => {
    return new Map(
      products.map((product) => [
        product.id,
        product.name,
      ]),
    )
  }, [products])

  // ============================================================
  // VENTAS AGRUPADAS POR SUCURSAL
  // ============================================================

  const salesByBranch = useMemo(() => {
    // Utilizamos un Map para acumular todas las ventas
    // que pertenecen a una misma sucursal.
    const groupedSales = new Map<
      number,
      {
        branchId: number
        branchName: string
        salesCount: number
        totalSales: number
      }
    >()

    reports?.sales.forEach((sale) => {
      // Buscamos si la sucursal ya tiene ventas acumuladas.
      const current = groupedSales.get(
        sale.branch_id,
      )

      if (current) {
        // Si ya existe, incrementamos cantidad e importe.
        current.salesCount += 1
        current.totalSales += sale.total

        return
      }

      // Si es la primera venta de esa sucursal,
      // creamos su registro acumulado.
      groupedSales.set(
        sale.branch_id,
        {
          branchId: sale.branch_id,

          branchName:
            branchNames.get(
              sale.branch_id,
            ) ??
            `Sucursal #${sale.branch_id}`,

          salesCount: 1,
          totalSales: sale.total,
        },
      )
    })

    // Convertimos el Map en arreglo y mostramos primero
    // las sucursales con mayor importe de ventas.
    return Array.from(
      groupedSales.values(),
    ).sort(
      (a, b) =>
        b.totalSales -
        a.totalSales,
    )
  }, [
    reports,
    branchNames,
  ])

  // ============================================================
  // DATOS DEL GRÁFICO DE VENTAS
  // ============================================================

  const salesChartData = useMemo(() => {
    // Reutilizamos la agrupación ya calculada
    // para no volver a procesar las ventas.
    return salesByBranch.map((branch) => ({
      // Nombre mostrado en el eje horizontal.
      sucursal: branch.branchName,

      // Importe acumulado de la sucursal.
      ventas: branch.totalSales,
    }))
  }, [salesByBranch])

  // ============================================================
  // ESTADO DEL INVENTARIO
  // ============================================================

  const inventoryReport = useMemo(() => {
    if (!reports) {
      return []
    }

    // Transformamos cada registro técnico del inventario
    // en una fila más útil para el reporte empresarial.
    return reports.inventory
      .map((item) => {
        // Obtenemos los nombres reales para no mostrar
        // solamente identificadores internos.
        const branchName =
          branchNames.get(item.branch_id) ??
          `Sucursal #${item.branch_id}`

        const productName =
          productNames.get(item.product_id) ??
          `Producto #${item.product_id}`

        // Si no existe costo unitario,
        // usamos cero únicamente para el cálculo del valor.
        const unitCost = item.unit_cost ?? 0

        // Valor monetario almacenado en esta fila.
        const inventoryValue =
          item.stock * unitCost

        // Consideramos stock bajo cuando el nivel actual
        // es igual o inferior al mínimo configurado.
        const lowStock =
          item.stock <= item.minimum_stock

        return {
          id: item.id,
          branchId: item.branch_id,
          branchName,
          productId: item.product_id,
          productName,
          stock: item.stock,
          minimumStock: item.minimum_stock,
          unitCost: item.unit_cost,
          inventoryValue,
          lowStock,
        }
      })

      // Las alertas de stock aparecen primero.
      // Dentro de cada grupo ordenamos alfabéticamente
      // por nombre de producto.
      .sort((a, b) => {
        if (a.lowStock !== b.lowStock) {
          return a.lowStock ? -1 : 1
        }

        return a.productName.localeCompare(
          b.productName,
          'es',
        )
      })
  }, [
    reports,
    branchNames,
    productNames,
  ])

  // ============================================================
  // DATOS DEL GRÁFICO DE INVENTARIO
  // ============================================================

  const inventoryStatusData = useMemo(() => {
    // Contamos los registros que requieren atención.
    const lowStock = inventoryReport.filter(
      (item) => item.lowStock,
    ).length

    // El resto se considera dentro del nivel normal.
    const normalStock =
      inventoryReport.length - lowStock

    return [
      {
        name: 'Normal',
        value: normalStock,
      },
      {
        name: 'Stock bajo',
        value: lowStock,
      },
    ]
  }, [inventoryReport])

  // Mostramos un estado visual mientras se cargan los datos.
  if (loading) {
    return (
      <div className="min-h-full bg-slate-50 p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Skeleton del encabezado. */}
          <div className="space-y-2">
            <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
            <div className="h-4 w-72 animate-pulse rounded bg-slate-200" />
          </div>

          {/* Skeleton de las tarjetas principales. */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-28 animate-pulse rounded-xl border border-slate-200 bg-white" />
            <div className="h-28 animate-pulse rounded-xl border border-slate-200 bg-white" />
          </div>

          {/* Skeleton de las tablas. */}
          <div className="h-72 animate-pulse rounded-xl border border-slate-200 bg-white" />
          <div className="h-72 animate-pulse rounded-xl border border-slate-200 bg-white" />
        </div>
      </div>
    )
  }

  // Mostramos el error dentro de una tarjeta empresarial.
  if (error) {
    return (
      <div className="min-h-full bg-slate-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-xl border border-red-200 bg-white p-6 shadow-sm">
            {/* Título del estado de error. */}
            <h1 className="text-lg font-semibold text-slate-900">
              No se pudieron cargar los reportes
            </h1>

            {/* Mensaje descriptivo del error. */}
            <p className="mt-2 text-sm text-red-600">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  // Verificamos que exista información antes de mostrarla.
  if (!reports) {
    return (
      <div className="min-h-full bg-slate-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              No hay información disponible.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Encabezado principal de la sección. */}
        <div>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Consulta consolidada de ventas e inventario.
          </p>
        </div>

        {/* ============================================================
            INDICADORES GENERALES
            ============================================================ */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

          {/* ----------------------------------------------------------
              TOTAL DE VENTAS
              ---------------------------------------------------------- */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Ventas acumuladas
            </p>

            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              S/ {totalSales.toFixed(2)}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              {reports.sales.length}{' '}
              {reports.sales.length === 1
                ? 'venta registrada'
                : 'ventas registradas'}
            </p>
          </div>

          {/* ----------------------------------------------------------
              VENTA PROMEDIO
              ---------------------------------------------------------- */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Venta promedio
            </p>

            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              S/ {averageSale.toFixed(2)}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Promedio por venta
            </p>
          </div>

          {/* ----------------------------------------------------------
              UNIDADES EN INVENTARIO
              ---------------------------------------------------------- */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Unidades en inventario
            </p>

            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              {totalInventoryUnits}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Stock total registrado
            </p>
          </div>

          {/* ----------------------------------------------------------
              VALOR DEL INVENTARIO
              ---------------------------------------------------------- */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Valor del inventario
            </p>

            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              S/ {totalInventoryValue.toFixed(2)}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Stock × costo unitario
            </p>
          </div>

          {/* ----------------------------------------------------------
              ALERTAS DE STOCK
              ---------------------------------------------------------- */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Stock bajo
            </p>

            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              {lowStockCount}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Productos por debajo del mínimo
            </p>
          </div>
        </div>

        {/* ============================================================
    VISUALIZACIONES EMPRESARIALES
    ============================================================ */}
        <div className="grid gap-6 lg:grid-cols-2">

          {/* ==========================================================
      VENTAS POR SUCURSAL
      ========================================================== */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Ventas por sucursal
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Comparación del importe acumulado entre sucursales.
              </p>
            </div>

            <div className="mt-6 h-80">
              {salesChartData.length === 0 ? (
                // Estado vacío cuando todavía no existen ventas.
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-slate-500">
                    No hay ventas disponibles para graficar.
                  </p>
                </div>
              ) : (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    data={salesChartData}
                    margin={{
                      top: 10,
                      right: 10,
                      left: 10,
                      bottom: 10,
                    }}
                  >
                    {/* Líneas horizontales de referencia. */}
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                    />

                    {/* Nombre de cada sucursal. */}
                    <XAxis
                      dataKey="sucursal"
                      tick={{
                        fontSize: 12,
                      }}
                    />

                    {/* Escala monetaria. */}
                    <YAxis
                      tick={{
                        fontSize: 12,
                      }}
                      tickFormatter={(value) =>
                        `S/ ${value}`
                      }
                    />

                    {/* Información al pasar el cursor. */}
                    <Tooltip
                      formatter={(value) => [
                        `S/ ${Number(value).toFixed(2)}`,
                        'Ventas',
                      ]}
                    />

                    {/* Importe vendido por sucursal. */}
                    <Bar
                      dataKey="ventas"
                      fill="#0f766e"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </section>

          {/* ==========================================================
      ESTADO GENERAL DEL INVENTARIO
      ========================================================== */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Estado del inventario
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Distribución de registros según su nivel de stock.
              </p>
            </div>

            <div className="mt-6 h-80">
              {inventoryReport.length === 0 ? (
                // Estado vacío cuando todavía no existe inventario.
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-slate-500">
                    No hay inventario disponible para graficar.
                  </p>
                </div>
              ) : (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <PieChart>

                    {/* Gráfico circular del estado de stock. */}
                    <Pie
                      data={inventoryStatusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      label
                    >
                      {/* Normal. */}
                      <Cell fill="#10b981" />

                      {/* Stock bajo. */}
                      <Cell fill="#f59e0b" />
                    </Pie>

                    {/* Mostramos nombre y cantidad
                al pasar el cursor. */}
                    <Tooltip />

                    {/* Leyenda inferior. */}
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </section>
        </div>

        {/* ============================================================
            VENTAS POR SUCURSAL
            ============================================================ */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

          {/* Encabezado del reporte. */}
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Ventas por sucursal
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Comparación del rendimiento comercial acumulado por sucursal.
            </p>
          </div>

          {salesByBranch.length === 0 ? (
            // Mostramos un estado vacío cuando todavía
            // no existen ventas registradas.
            <div className="px-5 py-10 text-center">
              <p className="text-sm font-medium text-slate-700">
                No existen ventas registradas.
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Las ventas aparecerán aquí cuando sean registradas.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] border-collapse">

                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Sucursal
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Ventas realizadas
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Importe acumulado
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Participación
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {salesByBranch.map(
                    (branch) => {
                      // Calculamos qué porcentaje representa
                      // esta sucursal dentro del total vendido.
                      const participation =
                        totalSales > 0
                          ? (
                            branch.totalSales /
                            totalSales
                          ) *
                          100
                          : 0

                      return (
                        <tr
                          key={branch.branchId}
                          className="border-b border-slate-100 transition-colors last:border-b-0 hover:bg-slate-50"
                        >

                          {/* Nombre real de la sucursal. */}
                          <td className="px-5 py-4">
                            <p className="font-medium text-slate-900">
                              {branch.branchName}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              Sucursal #{branch.branchId}
                            </p>
                          </td>

                          {/* Número de ventas registradas. */}
                          <td className="px-5 py-4 text-right text-sm font-medium text-slate-700">
                            {branch.salesCount}
                          </td>

                          {/* Total acumulado por sucursal. */}
                          <td className="px-5 py-4 text-right text-sm font-semibold text-slate-900">
                            S/{' '}
                            {branch.totalSales.toFixed(
                              2,
                            )}
                          </td>

                          {/* Porcentaje respecto al total general. */}
                          <td className="px-5 py-4 text-right">
                            <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                              {participation.toFixed(
                                1,
                              )}
                              %
                            </span>
                          </td>
                        </tr>
                      )
                    },
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ============================================================
    ESTADO DEL INVENTARIO
    ============================================================ */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

          {/* Encabezado del reporte. */}
          <div className="border-b border-slate-200 px-5 py-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Estado del inventario
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Disponibilidad, valorización y alertas de stock por producto.
                </p>
              </div>

              {/* Indicamos cuántos registros requieren atención. */}
              <span
                className={
                  lowStockCount > 0
                    ? 'inline-flex w-fit rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700'
                    : 'inline-flex w-fit rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700'
                }
              >
                {lowStockCount > 0
                  ? `${lowStockCount} con stock bajo`
                  : 'Inventario saludable'}
              </span>
            </div>
          </div>

          {inventoryReport.length === 0 ? (
            // Estado vacío cuando todavía no existen
            // registros de inventario.
            <div className="px-5 py-10 text-center">
              <p className="text-sm font-medium text-slate-700">
                No existen registros de inventario.
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Los productos aparecerán aquí cuando tengan stock registrado.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] border-collapse">

                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Producto
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Sucursal
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Stock
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Stock mínimo
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Costo unitario
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Valor almacenado
                    </th>

                    <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Estado
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {inventoryReport.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-slate-100 transition-colors last:border-b-0 hover:bg-slate-50"
                    >

                      {/* Producto real. */}
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-900">
                          {item.productName}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Producto #{item.productId}
                        </p>
                      </td>

                      {/* Sucursal real. */}
                      <td className="px-5 py-4">
                        <p className="text-sm text-slate-700">
                          {item.branchName}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Sucursal #{item.branchId}
                        </p>
                      </td>

                      {/* Stock actual. */}
                      <td className="px-5 py-4 text-right">
                        <span
                          className={
                            item.lowStock
                              ? 'font-semibold text-amber-700'
                              : 'font-semibold text-slate-900'
                          }
                        >
                          {item.stock}
                        </span>
                      </td>

                      {/* Stock mínimo configurado. */}
                      <td className="px-5 py-4 text-right text-sm text-slate-600">
                        {item.minimumStock}
                      </td>

                      {/* Costo unitario. */}
                      <td className="px-5 py-4 text-right text-sm text-slate-700">
                        {item.unitCost !== null
                          ? `S/ ${item.unitCost.toFixed(2)}`
                          : '—'}
                      </td>

                      {/* Valorización de la existencia actual. */}
                      <td className="px-5 py-4 text-right text-sm font-semibold text-slate-900">
                        S/{' '}
                        {item.inventoryValue.toFixed(
                          2,
                        )}
                      </td>

                      {/* Estado empresarial del stock. */}
                      <td className="px-5 py-4 text-center">
                        <span
                          className={
                            item.lowStock
                              ? 'inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700'
                              : 'inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700'
                          }
                        >
                          {item.lowStock
                            ? 'Stock bajo'
                            : 'Normal'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default Reportes