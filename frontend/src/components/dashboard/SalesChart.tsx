import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const salesData = [
  { month: 'Ene', sales: 4200 },
  { month: 'Feb', sales: 5800 },
  { month: 'Mar', sales: 4900 },
  { month: 'Abr', sales: 7200 },
  { month: 'May', sales: 6500 },
  { month: 'Jun', sales: 8400 },
]

function SalesChart() {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={salesData}
          margin={{
            top: 10,
            right: 20,
            left: 10,
            bottom: 10,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="month" />

          <YAxis />

          <Tooltip
            formatter={(value) => [
              `S/ ${Number(value).toLocaleString('es-PE')}`,
              'Ventas',
            ]}
          />

          <Line
            type="monotone"
            dataKey="sales"
            strokeWidth={3}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default SalesChart