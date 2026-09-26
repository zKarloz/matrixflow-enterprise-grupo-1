import { sales } from '../../data/sales'

function SalesTable() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">

        <table className="w-full text-left">

          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                Fecha
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                Cliente
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                Producto
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                Cantidad
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                Total
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                Estado
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">

            {sales.map((sale) => (
              <tr
                key={sale.id}
                className="hover:bg-slate-50"
              >

                <td className="px-6 py-4 text-sm text-slate-600">
                  {sale.date}
                </td>

                <td className="px-6 py-4 font-medium text-slate-800">
                  {sale.customer}
                </td>

                <td className="px-6 py-4 text-sm text-slate-600">
                  {sale.product}
                </td>

                <td className="px-6 py-4 text-sm text-slate-600">
                  {sale.quantity}
                </td>

                <td className="px-6 py-4 font-semibold text-slate-800">
                  S/ {sale.total.toFixed(2)}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      sale.status === 'Completada'
                        ? 'bg-green-100 text-green-700'
                        : sale.status === 'Pendiente'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {sale.status}
                  </span>
                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>
    </div>
  )
}

export default SalesTable