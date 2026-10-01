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
  DashboardSalesByProduct,
} from '../../services/api'


interface SalesByProductChartProps {
  data: DashboardSalesByProduct[]
}


function SalesByProductChart({
  data,
}: SalesByProductChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[320px] items-center justify-center text-sm text-slate-500">
        No hay ventas registradas por producto.
      </div>
    )
  }


  const chartData =
    data.map((item) => ({
      product:
        item.product_name,

      total:
        Number(item.total),

      quantity:
        Number(item.quantity),
    }))


  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{
            top: 10,
            right: 25,
            left: 20,
            bottom: 10,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
          />

          <XAxis
            type="number"
          />

          <YAxis
            type="category"
            dataKey="product"
            width={135}
          />

          <Tooltip
            formatter={(
              value,
              name,
            ) => {
              if (
                name === 'total'
              ) {
                return [
                  `S/ ${Number(
                    value,
                  ).toLocaleString(
                    'es-PE',
                    {
                      minimumFractionDigits: 2,
                    },
                  )}`,
                  'Ventas',
                ]
              }

              return [
                value,
                name,
              ]
            }}
          />

          <Bar
            dataKey="total"
            name="total"
            radius={[
              0,
              6,
              6,
              0,
            ]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}


export default SalesByProductChart