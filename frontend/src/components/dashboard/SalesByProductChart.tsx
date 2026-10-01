import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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

  // Colores utilizados para diferenciar visualmente
  // los productos dentro del gráfico.
  const PRODUCT_COLORS = [
    '#2563EB',
    '#06B6D4',
    '#6366F1',
    '#0EA5E9',
    '#14B8A6',
    '#8B5CF6',
  ]

  const chartData =
    data.map((item, index) => ({
      product:
        item.product_name,

      total:
        Number(item.total),

      quantity:
        Number(item.quantity),

      // Guardamos el color junto con los datos para poder
      // reutilizarlo tanto en la barra como en el tooltip.
      color:
        PRODUCT_COLORS[
        index %
        PRODUCT_COLORS.length
        ],
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
              _name,
              item,
            ) => [
                <span
                  style={{
                    // El valor utiliza exactamente el mismo
                    // color asignado a la barra del producto.
                    color:
                      item.payload.color,
                    fontWeight: 600,
                  }}
                >
                  S/{' '}
                  {Number(
                    value,
                  ).toLocaleString(
                    'es-PE',
                    {
                      minimumFractionDigits: 2,
                    },
                  )}
                </span>,
                'Ventas',
              ]}
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
          >
            {chartData.map(
              (item, index) => (
                <Cell
                  key={item.product}

                  // Reutilizamos la paleta si existen
                  // más productos que colores disponibles.
                  fill={
                    PRODUCT_COLORS[
                    index %
                    PRODUCT_COLORS.length
                    ]
                  }
                />
              ),
            )}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}


export default SalesByProductChart