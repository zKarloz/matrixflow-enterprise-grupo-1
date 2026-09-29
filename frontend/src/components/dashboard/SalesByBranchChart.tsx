import { useEffect, useState } from 'react'

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

// Importamos la función que consulta las ventas reales.
import { getSales } from '../../services/api'

// Importamos Sale únicamente como tipo de TypeScript.
import type { Sale } from '../../services/api'

// Representa los datos agrupados que utilizará Recharts.
interface BranchSales {
  branch: string
  sales: number
}

function SalesByBranchChart() {
  // Guardamos las ventas agrupadas por sucursal.
  const [branchData, setBranchData] = useState<BranchSales[]>([])

  // Controlamos el estado de carga de la petición.
  const [loading, setLoading] = useState(true)

  // Guardamos el mensaje de error si la petición falla.
  const [error, setError] = useState('')

  useEffect(() => {
    // Consultamos las ventas cuando se monta el componente.
    async function loadBranchSales() {
      try {
        setLoading(true)
        setError('')

        // Obtenemos las ventas reales desde FastAPI.
        const sales: Sale[] = await getSales()

        // Agrupamos el total vendido utilizando branch_id.
        const groupedBranches = new Map<number, number>()

        sales.forEach((sale) => {
          // Convertimos el total a número para evitar problemas
          // si el backend devuelve un valor numérico serializado.
          const total = Number(sale.total)

          // Ignoramos valores que no sean números válidos.
          if (Number.isNaN(total)) {
            return
          }

          // Acumulamos las ventas correspondientes a cada sucursal.
          groupedBranches.set(
            sale.branch_id,
            (groupedBranches.get(sale.branch_id) ?? 0) + total,
          )
        })

        // Transformamos los datos al formato esperado por Recharts.
        const chartData: BranchSales[] = Array.from(
          groupedBranches.entries(),
        )
          .sort(([firstBranch], [secondBranch]) => {
            // Ordenamos las sucursales por su identificador.
            return firstBranch - secondBranch
          })
          .map(([branchId, total]) => ({
            // Mostramos el ID porque el endpoint de ventas
            // actualmente no proporciona el nombre de la sucursal.
            branch: `Sucursal ${branchId}`,
            sales: total,
          }))

        setBranchData(chartData)
      } catch (requestError) {
        // Mostramos el error real en lugar de utilizar datos ficticios.
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'No se pudieron cargar las ventas por sucursal.',
        )
      } finally {
        // Finalizamos la carga independientemente del resultado.
        setLoading(false)
      }
    }

    loadBranchSales()
  }, [])

  // Mostramos un estado de carga mientras esperamos al backend.
  if (loading) {
    return (
      <div className="flex h-[320px] items-center justify-center text-sm text-slate-500">
        Cargando ventas por sucursal...
      </div>
    )
  }

  // Mostramos el error si la petición no pudo completarse.
  if (error) {
    return (
      <div className="flex h-[320px] items-center justify-center text-sm text-red-600">
        {error}
      </div>
    )
  }

  // Si todavía no existen ventas, mostramos un estado vacío.
  if (branchData.length === 0) {
    return (
      <div className="flex h-[320px] items-center justify-center text-sm text-slate-500">
        No hay ventas registradas por sucursal.
      </div>
    )
  }

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