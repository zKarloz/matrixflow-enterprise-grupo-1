import { useEffect, useState } from 'react'

// Importamos la función que consulta el inventario real.
import { getInventory } from '../services/api'

// Importamos InventoryItem únicamente como tipo de TypeScript.
import type { InventoryItem } from '../services/api'

function Inventario() {
  // Guardamos los registros recibidos desde PostgreSQL.
  const [items, setItems] = useState<InventoryItem[]>([])

  // Indica si todavía estamos esperando la respuesta.
  const [loading, setLoading] = useState(true)

  // Guarda cualquier error producido durante la consulta.
  const [error, setError] = useState<string | null>(null)

  // Consultamos el inventario cuando se carga la página.
  useEffect(() => {
    async function loadInventory() {
      try {
        setLoading(true)
        setError(null)

        // Obtenemos los datos reales mediante FastAPI.
        const data = await getInventory()

        setItems(data)
      } catch (err) {
        // Mostramos el mensaje recibido desde el servicio.
        setError(
          err instanceof Error
            ? err.message
            : 'Ocurrió un error al obtener el inventario.'
        )
      } finally {
        // Finalizamos el estado de carga.
        setLoading(false)
      }
    }

    loadInventory()
  }, [])

  // Mostramos un mensaje mientras esperamos al backend.
  if (loading) {
    return <div className="p-6">Cargando inventario...</div>
  }

  // Mostramos el error si la consulta falla.
  if (error) {
    return (
      <div className="p-6 text-red-600">
        Error: {error}
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold">
        Inventario
      </h1>

      {items.length === 0 ? (
        <p>No hay registros de inventario.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border">
            <thead>
              <tr>
                <th className="border p-2">ID</th>
                <th className="border p-2">Sucursal</th>
                <th className="border p-2">Producto</th>
                <th className="border p-2">Stock</th>
                <th className="border p-2">Stock mínimo</th>
                <th className="border p-2">Costo unitario</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="border p-2">{item.id}</td>
                  <td className="border p-2">{item.branch_id}</td>
                  <td className="border p-2">{item.product_id}</td>
                  <td className="border p-2">{item.stock}</td>
                  <td className="border p-2">{item.minimum_stock}</td>
                  <td className="border p-2">
                    {item.unit_cost ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Inventario