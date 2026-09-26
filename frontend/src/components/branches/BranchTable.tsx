import { branches } from '../../data/branches'

function BranchTable() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

      <div className="overflow-x-auto">

        <table className="w-full text-left">

          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                Sucursal
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                Ciudad
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                Dirección
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                Teléfono
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                Estado
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">

            {branches.map((branch) => (
              <tr
                key={branch.id}
                className="hover:bg-slate-50"
              >

                <td className="px-6 py-4">
                  <p className="font-medium text-slate-800">
                    {branch.name}
                  </p>
                </td>

                <td className="px-6 py-4 text-sm text-slate-600">
                  {branch.city}
                </td>

                <td className="px-6 py-4 text-sm text-slate-600">
                  {branch.address}
                </td>

                <td className="px-6 py-4 text-sm text-slate-600">
                  {branch.phone}
                </td>

                <td className="px-6 py-4">

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      branch.status === 'Activa'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {branch.status}
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

export default BranchTable