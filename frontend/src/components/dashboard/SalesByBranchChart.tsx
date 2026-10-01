import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type {
  DashboardSalesByBranch,
} from '../../services/api'


interface SalesByBranchChartProps {
  data: DashboardSalesByBranch[]
}


function SalesByBranchChart({
  data,
}: SalesByBranchChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[320px] items-center justify-center text-sm text-slate-500">
        No hay ventas registradas por sucursal.
      </div>
    )
  }


  const chartData =
    data.map((item) => ({
      branch:
        item.branch_name,

      sales:
        Number(item.total),
    }))


  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <BarChart
          data={chartData}
          margin={{
            top: 10,
            right: 20,
            left: 10,
            bottom: 10,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
          />

          <XAxis
            dataKey="branch"
          />

          <YAxis />

          <Tooltip
            formatter={(value) => [
              `S/ ${Number(
                value,
              ).toLocaleString(
                'es-PE',
                {
                  minimumFractionDigits: 2,
                },
              )}`,
              'Ventas',
            ]}
          />

          <Bar
            dataKey="sales"

            // Azul principal de MatrixFlow.
            fill="#2563EB"

            radius={[
              6,
              6,
              0,
              0,
            ]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}


export default SalesByBranchChart