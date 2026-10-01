import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type {
  DashboardSalesByPeriod,
} from '../../services/api'


interface SalesChartProps {
  data: DashboardSalesByPeriod[]
}


interface ChartItem {
  period: string
  sales: number
}


const MONTH_NAMES = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
]


function formatPeriod(
  period: string,
): string {
  // El backend devuelve períodos en formato YYYY-MM.
  const [year, month] =
    period.split('-')

  const monthIndex =
    Number(month) - 1

  if (
    !year ||
    monthIndex < 0 ||
    monthIndex > 11
  ) {
    return period
  }

  return `${MONTH_NAMES[monthIndex]} ${year}`
}


function SalesChart({
  data,
}: SalesChartProps) {
  // El backend ya realiza la agrupación.
  // Aquí únicamente adaptamos el formato para Recharts.
  const chartData: ChartItem[] =
    data.map((item) => ({
      period:
        formatPeriod(item.period),

      sales:
        Number(item.total),
    }))


  if (chartData.length === 0) {
    return (
      <div className="flex h-[320px] items-center justify-center text-sm text-slate-500">
        No hay ventas registradas.
      </div>
    )
  }


  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <LineChart
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
            dataKey="period"
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

          <Line
            type="monotone"
            dataKey="sales"
            strokeWidth={3}
            dot={{
              r: 4,
            }}
            activeDot={{
              r: 6,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}


export default SalesChart