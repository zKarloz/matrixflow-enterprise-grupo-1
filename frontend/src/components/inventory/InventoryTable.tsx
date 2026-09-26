import { inventory } from '../../data/inventory'

function InventoryTable() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left">

          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                Producto
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                Categoría
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                Sucursal
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                Stock
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                Stock mínimo
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                Estado
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {inventory.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-slate-50"
              >
                <td className="px-6 py-4 font-medium text-slate-800">
                  {item.product}
                </td>

                <td className="px-6 py-4 text-sm text-slate-600">
                  {item.category}
                </td>

                <td className="px-6 py-4 text-sm text-slate-600">
                  {item.branch}
                </td>

                <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                  {item.stock}
                </td>

                <td className="px-6 py-4 text-sm text-slate-600">
                  {item.minimumStock}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      item.status === 'Normal'
                        ? 'bg-green-100 text-green-700'
                        : item.status === 'Bajo'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {item.status}
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

export default InventoryTable