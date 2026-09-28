
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

// ============================================================
// AUTENTICACIÓN
// ============================================================
//
// Estas funciones permiten que React se comunique con el
// sistema de autenticación implementado en FastAPI.
//
// IMPORTANTE:
// React NO se conecta directamente a Supabase.
// Toda la autenticación pasa por:
// React → FastAPI → SQLAlchemy → PostgreSQL
// ============================================================

/**
 * Datos que el usuario introduce en el formulario de Login.
 */
export interface LoginData {
  email: string
  password: string
}

/**
 * Respuesta que devuelve FastAPI después de autenticar
 * correctamente al usuario.
 */
export interface LoginResponse {
  access_token: string
  token_type: string
}

/**
 * Realiza el inicio de sesión contra FastAPI.
 *
 * Endpoint utilizado:
 * POST /api/v1/auth/login
 *
 * Si las credenciales son correctas, FastAPI devuelve
 * un JWT que posteriormente podremos utilizar para
 * acceder a endpoints protegidos.
 */
export async function login(
  data: LoginData
): Promise<LoginResponse> {
  // Enviamos las credenciales al backend como JSON.
  const response = await fetch(
    `${API_URL}/api/v1/auth/login`,
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify(data),
    }
  )

  // Si FastAPI devuelve 401, 400, 500, etc.,
  // consideramos que el Login no fue exitoso.
  if (!response.ok) {
    let message = 'No se pudo iniciar sesión.'

    // Intentamos obtener el mensaje de error enviado
    // por FastAPI para mostrarlo al usuario.
    try {
      const errorData = await response.json()

      if (errorData.detail) {
        message = errorData.detail
      }
    } catch {
      // Si la respuesta no contiene JSON,
      // mantenemos el mensaje genérico.
    }

    throw new Error(message)
  }

  // Convertimos la respuesta JSON de FastAPI
  // en nuestro objeto LoginResponse.
  return response.json()
}

// ============================================================
// Auditoría
// ============================================================
//
// Obtiene los registros de acceso registrados por el backend.
// Estos datos provienen de la tabla audit_logs de PostgreSQL.
// ============================================================

export interface AuditLog {
  // Identificador del registro de auditoría.
  id: number

  // Identificador del usuario que realizó la acción.
  user_id: number | null

  // Acción realizada por el usuario.
  action: string

  // Tabla relacionada con la acción.
  table_name: string | null

  // Registro afectado por la acción.
  record_id: number | null

  // Información adicional, incluida la IP.
  description: string | null

  // Fecha y hora del evento.
  created_at: string
}

// Consulta los registros de auditoría del backend.
export async function getAuditLogs(): Promise<AuditLog[]> {
  const response = await fetch(
    `${API_URL}/api/v1/audit`
  )

  // Si el backend devuelve un error, detenemos la operación.
  if (!response.ok) {
    throw new Error(
      'No se pudieron obtener los registros de auditoría.'
    )
  }

  // Convertimos la respuesta JSON al formato esperado.
  return response.json()
}