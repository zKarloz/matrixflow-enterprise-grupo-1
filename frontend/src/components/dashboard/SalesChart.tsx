import { useEffect, useState } from 'react'

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

// Importamos la función que consulta las ventas reales.
import { getSales } from '../../services/api'

// Importamos Sale únicamente como tipo de TypeScript.
import type { Sale } from '../../services/api'

// Representa un punto del gráfico después de agrupar las ventas por mes.
interface MonthlySales {
  month: string
  sales: number
}

// Nombres abreviados de los meses para mostrar en el gráfico.
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

function SalesChart() {
  // Guardamos las ventas agrupadas que serán mostradas en el gráfico.
  const [salesData, setSalesData] = useState<MonthlySales[]>([])

  // Controlamos el estado de carga mientras consultamos el backend.
  const [loading, setLoading] = useState(true)

  // Guardamos cualquier error producido por la petición.
  const [error, setError] = useState('')

  useEffect(() => {
    // Cargamos las ventas reales al montar el componente.
    async function loadSales() {
      try {
        setLoading(true)
        setError('')

        // Consultamos las ventas reales mediante la API autenticada.
        const sales: Sale[] = await getSales()

        // Agrupamos las ventas por año y mes.
        const groupedSales = new Map<string, number>()

        sales.forEach((sale) => {
          // Convertimos la fecha almacenada por el backend en un objeto Date.
          const date = new Date(sale.created_at)

          // Ignoramos registros cuya fecha no pueda interpretarse correctamente.
          if (Number.isNaN(date.getTime())) {
            return
          }

          // Usamos año + mes para evitar mezclar meses de diferentes años.
          const year = date.getFullYear()
          const monthIndex = date.getMonth()
          const key = `${year}-${monthIndex}`

          // Acumulamos el total de cada venta dentro del mes correspondiente.
          groupedSales.set(
            key,
            (groupedSales.get(key) ?? 0) + Number(sale.total),
          )
        })

        // Convertimos el Map en los datos que necesita Recharts.
        const chartData: MonthlySales[] = Array.from(
          groupedSales.entries(),
        )
          .sort(([firstKey], [secondKey]) => {
            // Ordenamos cronológicamente por año y mes.
            return firstKey.localeCompare(secondKey, undefined, {
              numeric: true,
            })
          })
          .map(([key, total]) => {
            // Recuperamos el mes desde la clave "año-mes".
            const monthIndex = Number(key.split('-')[1])

            return {
              month: MONTH_NAMES[monthIndex],
              sales: total,
            }
          })

        setSalesData(chartData)
      } catch (requestError) {
        // Mostramos un mensaje claro si el backend no responde correctamente.
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'No se pudieron cargar las ventas.',
        )
      } finally {
        // Finalizamos el estado de carga independientemente del resultado.
        setLoading(false)
      }
    }

    loadSales()
  }, [])

  // Mientras esperamos al backend mostramos un estado de carga.
  if (loading) {
    return (
      <div className="flex h-[320px] items-center justify-center text-sm text-slate-500">
        Cargando ventas...
      </div>
    )
  }

  // Si la consulta falló, informamos el problema en lugar de mostrar datos falsos.
  if (error) {
    return (
      <div className="flex h-[320px] items-center justify-center text-sm text-red-600">
        {error}
      </div>
    )
  }

  // Si no existen ventas, mostramos un estado vacío.
  if (salesData.length === 0) {
    return (
      <div className="flex h-[320px] items-center justify-center text-sm text-slate-500">
        No hay ventas registradas.
      </div>
    )
  }

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