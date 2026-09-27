import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const productData = [
  {
    product: 'Laptops',
    sales: 12500,
  },
  {
    product: 'Monitores',
    sales: 8300,
  },
  {
    product: 'Teclados',
    sales: 4200,
  },
  {
    product: 'Mouse',
    sales: 3100,
  },
  {
    product: 'Accesorios',
    sales: 2600,
  },
]

function SalesByProductChart() {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={productData}
          margin={{
            top: 10,
            right: 20,
            left: 10,
            bottom: 10,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="product" />

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

export default SalesByProductChart