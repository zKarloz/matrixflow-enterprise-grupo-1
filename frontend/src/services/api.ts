
// ============================================================
// MatrixFlow Enterprise
// Cliente principal para comunicarse con el backend
// ============================================================
//
// Este archivo centraliza la comunicación entre React y FastAPI.
//
// Frontend:
//     http://localhost:5173
//
// Backend:
//     http://127.0.0.1:8000
//----------------------------------------------------------

// Todas las peticiones de la API partirán de esta dirección.
export const API_URL = 'http://127.0.0.1:8000'


// ------------------------------------------------------------
// Comprobar estado del backend
// ------------------------------------------------------------

export async function checkBackend(): Promise<{
  status: string
  service: string
}> {
  // Realizamos una petición GET al endpoint /health.
  const response = await fetch(`${API_URL}/health`)

  // Si FastAPI devuelve un código diferente de 200,
  // consideramos que la petición no fue exitosa.
  if (!response.ok) {
    throw new Error('No se pudo conectar con el backend')
  }

  // Convertimos la respuesta JSON de FastAPI
  // en un objeto JavaScript.
  return response.json()
}

