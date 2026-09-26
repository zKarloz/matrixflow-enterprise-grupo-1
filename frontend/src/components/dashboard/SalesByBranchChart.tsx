import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const branchData = [
  {
    branch: 'Lima',
    sales: 18500,
  },
  {
    branch: 'Arequipa',
    sales: 12300,
  },
  {
    branch: 'Trujillo',
    sales: 9800,
  },
  {
    branch: 'Cusco',
    sales: 7600,
  },
]

function SalesByBranchChart() {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={branchData}
          margin={{
            top: 10,
            right: 20,
            left: 10,
            bottom: 10,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="branch" />

          <YAxis />

          <Tooltip
            formatter={(value) => [
              `S/ ${Number(value).toLocaleString('es-PE')}`,
              'Ventas',
            ]}
          />

          <Bar
            dataKey="sales"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default SalesByBranchChart