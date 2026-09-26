import { products } from '../../data/products'

function ProductTable() {
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
                Precio
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                Stock
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                Estado
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">

            {products.map((product) => (
              <tr
                key={product.id}
                className="hover:bg-slate-50"
              >
                <td className="px-6 py-4 font-medium text-slate-800">
                  {product.name}
                </td>

                <td className="px-6 py-4 text-sm text-slate-600">
                  {product.category}
                </td>

                <td className="px-6 py-4 text-sm font-medium text-slate-800">
                  S/ {product.price.toFixed(2)}
                </td>

                <td className="px-6 py-4 text-sm text-slate-600">
                  {product.stock}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      product.status === 'Disponible'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {product.status}
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

export default ProductTable