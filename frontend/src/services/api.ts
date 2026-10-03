// ============================================================
// URL DEL BACKEND
// ============================================================
//
// Vite utiliza variables de entorno diferentes según
// el entorno donde se ejecute el frontend.
//
// Desarrollo:
// React local -> FastAPI local.
//
// Producción:
// Vercel -> Backend desplegado en Render.
//
// De esta manera no necesitamos cambiar manualmente
// la URL cada vez que desarrollamos o desplegamos.
// ============================================================

const API_URL = import.meta.env.VITE_API_URL

// ============================================================
// PETICIONES AUTENTICADAS
// ============================================================
//
// Esta función centraliza las peticiones que necesitan JWT.
//
// Flujo:
//
// React
//   ↓
// localStorage
//   ↓
// JWT
//   ↓
// Authorization: Bearer <JWT>
//   ↓
// FastAPI
//
// IMPORTANTE:
// El frontend solamente envía el token.
// La validación real del JWT y los permisos RBAC
// continúan siendo responsabilidad del backend.
// ============================================================

export async function authenticatedFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  // Recuperamos el JWT almacenado después del Login.
  const token = localStorage.getItem('matrixflow-access-token')

  // Construimos los headers de la petición.
  const headers = new Headers(options.headers)

  // Indicamos que las peticiones JSON utilizan este formato.
  headers.set('Content-Type', 'application/json')

  // Si existe un JWT, lo enviamos mediante Bearer Authentication.
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  // Realizamos la petición al endpoint solicitado.
  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  )

  // Si el token expiró o dejó de ser válido,
  // eliminamos las credenciales locales.
  //
  // El backend continúa siendo quien determina
  // si el token realmente es válido.
  if (response.status === 401) {
    localStorage.removeItem('matrixflow-access-token')
    localStorage.removeItem('matrixflow-token-type')
  }

  // Devolvemos la respuesta para que cada función
  // pueda decidir cómo manejarla.
  return response
}

// ============================================================
// Comprobar estado del backend
// ============================================================

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
  // Identificador del evento de auditoría.
  id: number

  // Usuario relacionado con la acción.
  user_id: number | null

  // Acción registrada.
  action: string

  // Tabla o módulo relacionado.
  table_name: string | null

  // Registro afectado, cuando corresponde.
  record_id: number | null

  // Descripción general del evento.
  description: string | null

  // Dirección IP capturada durante el acceso.
  ip_address: string | null

  // Ubicación aproximada obtenida desde la IP.
  city: string | null
  region: string | null
  country: string | null

  // Coordenadas aproximadas para representar
  // visualmente el acceso.
  latitude: number | null
  longitude: number | null

  // Información enviada por el navegador.
  user_agent: string | null

  // Fecha y hora del evento.
  created_at: string
}

// Consulta los registros de auditoría del backend.
export async function getAuditLogs(): Promise<AuditLog[]> {
  // Utilizamos la función autenticada para que el JWT
  // viaje automáticamente en el header Authorization.
  const response = await authenticatedFetch(
    '/api/v1/audit'
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

// ============================================================
// SESIÓN DEL USUARIO
// ============================================================
//
// El JWT generado por FastAPI contiene información básica
// del usuario:
//
//     sub  → ID del usuario
//     role → nombre del rol
//     exp  → expiración del token
//
// Esta función solamente DECODIFICA el contenido del JWT
// para utilizarlo en la interfaz.
//
// IMPORTANTE:
// Decodificar el JWT en React NO significa validarlo.
// La firma, expiración y permisos continúan siendo
// responsabilidad del backend.
// ============================================================

export interface UserSession {
  // ID del usuario obtenido del campo "sub" del JWT.
  userId: number

  // Rol obtenido del campo "role" del JWT.
  role: string
}

/**
 * Obtiene la información básica del usuario conectado.
 */
export function getCurrentUser(): UserSession | null {
  // Recuperamos el JWT almacenado después del Login.
  const token = localStorage.getItem('matrixflow-access-token')

  // Si no existe token, no existe una sesión local.
  if (!token) {
    return null
  }

  try {
    // Un JWT tiene tres partes:
    //
    // header.payload.signature
    //
    // Para la interfaz solamente necesitamos el payload.
    const parts = token.split('.')

    // Un JWT válido debe contener exactamente tres partes.
    if (parts.length !== 3) {
      return null
    }

    // Obtenemos el payload del JWT.
    const payload = parts[1]

    // Convertimos Base64URL a Base64 estándar.
    const base64 = payload
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    // Decodificamos el contenido JSON.
    const decodedPayload = JSON.parse(
      atob(base64)
    )

    // Convertimos el ID del usuario a número.
    const userId = Number(decodedPayload.sub)

    // Obtenemos el rol enviado por FastAPI.
    const role = decodedPayload.role

    // Verificamos que los datos mínimos existan.
    if (
      !Number.isInteger(userId) ||
      typeof role !== 'string' ||
      role.trim() === ''
    ) {
      return null
    }

    // Devolvemos solamente la información necesaria
    // para controlar la interfaz.
    return {
      userId,
      role,
    }
  } catch {
    // Si el token no puede decodificarse,
    // no asumimos ningún rol.
    return null
  }
}

// ============================================================
// SUCURSALES
// ============================================================
//
// Estas funciones permiten que React consulte y registre
// sucursales mediante la API de FastAPI.
//
// Flujo:
//
// React
//   ↓
// authenticatedFetch()
//   ↓
// JWT + Bearer
//   ↓
// FastAPI
//   ↓
// PostgreSQL
//
// IMPORTANTE:
// El backend solamente permite estas operaciones al rol
// Administrador mediante require_roles("Administrador").
// ============================================================

/**
 * Representa una sucursal tal como la devuelve FastAPI.
 */
export interface Branch {
  // Identificador generado por PostgreSQL.
  id: number

  // Empresa a la que pertenece la sucursal.
  company_id: number

  // Nombre de la sucursal.
  name: string

  // Dirección física.
  address: string | null

  // Teléfono de la sucursal.
  phone: string | null

  // Indica si la sucursal está activa.
  is_active: boolean
}

/**
 * Datos necesarios para registrar una nueva sucursal.
 *
 * El ID y el estado no se envían porque PostgreSQL/backend
 * se encargan de generarlos y establecer is_active = true.
 */
export interface CreateBranchData {
  // Nombre de la nueva sucursal.
  name: string

  // Empresa a la que pertenecerá.
  company_id: number

  // Dirección física.
  address?: string | null

  // Teléfono de contacto.
  phone?: string | null
}

/**
 * Datos que pueden modificarse en una sucursal existente.
 *
 * company_id no se incluye porque la empresa de una sucursal
 * no debe cambiar después de su creación.
 */
export interface UpdateBranchData {
  name: string
  address?: string | null
  phone?: string | null
  is_active: boolean
}

/**
 * Obtiene todas las sucursales registradas.
 *
 * Endpoint:
 * GET /api/v1/branches
 */
export async function getBranches(): Promise<Branch[]> {
  // Enviamos el JWT mediante authenticatedFetch().
  const response = await authenticatedFetch(
    '/api/v1/branches'
  )

  // El backend puede devolver 401, 403 o 500.
  // En cualquiera de esos casos informamos el error.
  if (!response.ok) {
    throw new Error(
      'No se pudieron obtener las sucursales.'
    )
  }

  // Convertimos el JSON de FastAPI en un arreglo
  // de objetos Branch.
  return response.json()
}

/**
 * Registra una nueva sucursal.
 *
 * Endpoint:
 * POST /api/v1/branches
 */
export async function createBranch(
  data: CreateBranchData
): Promise<Branch> {
  // Enviamos los datos al backend utilizando JWT.
  const response = await authenticatedFetch(
    '/api/v1/branches',
    {
      method: 'POST',

      // Convertimos el objeto TypeScript a JSON.
      body: JSON.stringify(data),
    }
  )

  // Si FastAPI devuelve un error, intentamos obtener
  // el mensaje enviado por el backend.
  if (!response.ok) {
    let message =
      'No se pudo registrar la sucursal.'

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

  // Devolvemos la sucursal creada por PostgreSQL.
  return response.json()
}

/**
 * Actualiza una sucursal existente.
 *
 * Endpoint:
 * PATCH /api/v1/branches/{branchId}
 */
export async function updateBranch(
  branchId: number,
  data: UpdateBranchData,
): Promise<Branch> {
  // authenticatedFetch agrega automáticamente el JWT.
  const response = await authenticatedFetch(
    `/api/v1/branches/${branchId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    },
  )

  if (!response.ok) {
    let message = 'No se pudo actualizar la sucursal.'

    try {
      const errorData = await response.json()

      if (errorData.detail) {
        message = errorData.detail
      }
    } catch {
      // Conservamos el mensaje general si la API
      // no devuelve un cuerpo JSON.
    }

    throw new Error(message)
  }

  return response.json()
}

// ============================================================
// EMPRESAS
// ============================================================
//
// Estas funciones permiten consultar las empresas existentes
// para utilizarlas, entre otras cosas, al registrar sucursales.
//
// El endpoint está protegido en FastAPI para Administrador.
// ============================================================

/**
 * Representa una empresa devuelta por FastAPI.
 */
export interface Company {
  // Identificador generado por PostgreSQL.
  id: number

  // Nombre comercial o razón social.
  name: string

  // Identificador tributario.
  tax_id: string

  // Dirección de la empresa.
  address: string | null

  // Teléfono de la empresa.
  phone: string | null

  // Correo electrónico.
  email: string | null
}

/**
 * Obtiene todas las empresas registradas.
 *
 * Endpoint:
 * GET /api/v1/companies
 */
export async function getCompanies(): Promise<Company[]> {
  // Enviamos automáticamente el JWT mediante
  // authenticatedFetch().
  const response = await authenticatedFetch(
    '/api/v1/companies'
  )

  // Si FastAPI devuelve un error, informamos al componente.
  if (!response.ok) {
    throw new Error(
      'No se pudieron obtener las empresas.'
    )
  }

  // Convertimos la respuesta JSON a un arreglo de Company.
  return response.json()
}

// ============================================================
// CATEGORÍAS
// ============================================================
//
// Las categorías son necesarias para registrar productos,
// porque el backend utiliza category_id como clave foránea.
// ============================================================

/**
 * Representa una categoría devuelta por FastAPI.
 */
export interface Category {
  // Identificador de la categoría.
  id: number

  // Nombre de la categoría.
  name: string

  // Descripción opcional.
  description: string | null

  // Indica si la categoría está activa.
  is_active: boolean
}

/**
 * Datos necesarios para crear una categoría.
 */
export interface CreateCategoryData {
  name: string
  description?: string | null
}

/**
 * Datos que pueden modificarse en una categoría existente.
 */
export interface UpdateCategoryData {
  name: string
  description?: string | null
  is_active: boolean
}

/**
 * Obtiene las categorías activas.
 *
 * Endpoint:
 * GET /api/v1/categories/active
 */
export async function getActiveCategories(): Promise<Category[]> {
  // Enviamos el JWT mediante authenticatedFetch().
  const response = await authenticatedFetch(
    '/api/v1/categories/active'
  )

  // Si el backend devuelve un error, informamos al componente.
  if (!response.ok) {
    throw new Error(
      'No se pudieron obtener las categorías.'
    )
  }

  // Convertimos la respuesta JSON en un arreglo de categorías.
  return response.json()
}

/**
 * Registra una nueva categoría.
 *
 * Endpoint:
 * POST /api/v1/categories
 */
export async function createCategory(
  data: CreateCategoryData,
): Promise<Category> {
  // authenticatedFetch agrega automáticamente
  // el JWT del Administrador.
  const response = await authenticatedFetch(
    '/api/v1/categories',
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
  )

  if (!response.ok) {
    let message = 'No se pudo crear la categoría.'

    try {
      const errorData = await response.json()

      if (errorData.detail) {
        message = errorData.detail
      }
    } catch {
      // Conservamos el mensaje general si FastAPI
      // no devuelve una respuesta JSON.
    }

    throw new Error(message)
  }

  return response.json()
}

/**
 * Actualiza una categoría existente.
 *
 * Endpoint:
 * PATCH /api/v1/categories/{categoryId}
 */
export async function updateCategory(
  categoryId: number,
  data: UpdateCategoryData,
): Promise<Category> {
  // authenticatedFetch agrega automáticamente
  // el JWT del usuario Administrador.
  const response = await authenticatedFetch(
    `/api/v1/categories/${categoryId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    },
  )

  if (!response.ok) {
    let message = 'No se pudo actualizar la categoría.'

    try {
      const errorData = await response.json()

      if (errorData.detail) {
        message = errorData.detail
      }
    } catch {
      // Conservamos el mensaje general si FastAPI
      // no devuelve una respuesta JSON.
    }

    throw new Error(message)
  }

  return response.json()
}

/**
 * Obtiene todas las categorías registradas,
 * incluyendo las categorías inactivas.
 *
 * Endpoint:
 * GET /api/v1/categories
 */
export async function getCategories(): Promise<Category[]> {
  const response = await authenticatedFetch(
    '/api/v1/categories',
  )

  if (!response.ok) {
    let message = 'No se pudieron cargar las categorías.'

    try {
      const errorData = await response.json()

      if (errorData.detail) {
        message = errorData.detail
      }
    } catch {
      // Conservamos el mensaje general si FastAPI
      // no devuelve una respuesta JSON.
    }

    throw new Error(message)
  }

  return response.json()
}

// ============================================================
// PRODUCTOS
// ============================================================
//
// IMPORTANTE:
// El stock NO forma parte del producto.
// El stock será gestionado posteriormente por Inventario.
// ============================================================

/**
 * Representa un producto devuelto por FastAPI.
 *
 * GET /products devuelve información adicional calculada
 * por el servicio: nombre de categoría y stock actual.
 */
export interface Product {
  // Identificador generado por PostgreSQL.
  id: number

  // Nombre del producto.
  name: string

  // ID de la categoría relacionada.
  category_id: number

  // Nombre de la categoría.
  // Esta propiedad viene de la consulta enriquecida
  // realizada por el backend.
  category: string

  // Precio del producto.
  price: number

  // Código único del producto.
  sku: string

  // Descripción opcional.
  description: string | null

  // Estado actual del producto.
  is_active: boolean

  // Stock actual obtenido desde la tabla inventory.
  stock: number
}

/**
 * Datos necesarios para registrar un producto.
 */
export interface CreateProductData {
  // Nombre del producto.
  name: string

  // Categoría seleccionada.
  category_id: number

  // Precio del producto.
  price: number

  // Código SKU.
  sku: string

  // Descripción opcional.
  description?: string | null
}

/**
 * Datos que pueden modificarse en un producto existente.
 *
 * El stock no se incluye porque pertenece al módulo
 * de inventario, no al catálogo de productos.
 */
export interface UpdateProductData {
  name: string
  category_id: number
  price: number
  sku: string
  description?: string | null
  is_active: boolean
}

/**
 * Obtiene todos los productos.
 *
 * Endpoint:
 * GET /api/v1/products
 */
export async function getProducts(): Promise<Product[]> {
  // Consultamos productos utilizando el JWT actual.
  const response = await authenticatedFetch(
    '/api/v1/products'
  )

  // Comprobamos la respuesta HTTP.
  if (!response.ok) {
    throw new Error(
      'No se pudieron obtener los productos.'
    )
  }

  // Devolvemos los productos recibidos desde FastAPI.
  return response.json()
}

/**
 * Registra un nuevo producto.
 *
 * Endpoint:
 * POST /api/v1/products
 */
export async function createProduct(
  data: CreateProductData
): Promise<Product> {
  // Enviamos el producto al backend.
  const response = await authenticatedFetch(
    '/api/v1/products',
    {
      method: 'POST',

      // Convertimos los datos a JSON.
      body: JSON.stringify(data),
    }
  )

  // Si existe un error, intentamos mostrar
  // el mensaje enviado por FastAPI.
  if (!response.ok) {
    let message =
      'No se pudo registrar el producto.'

    try {
      const errorData = await response.json()

      if (errorData.detail) {
        message = errorData.detail
      }
    } catch {
      // Mantenemos el mensaje genérico si
      // FastAPI no devuelve JSON.
    }

    throw new Error(message)
  }

  // Devolvemos el producto creado.
  return response.json()
}

/**
 * Actualiza la información comercial de un producto.
 *
 * Endpoint:
 * PATCH /api/v1/products/{productId}
 */
export async function updateProduct(
  productId: number,
  data: UpdateProductData,
): Promise<Product> {
  // authenticatedFetch agrega automáticamente
  // el JWT de la sesión actual.
  const response = await authenticatedFetch(
    `/api/v1/products/${productId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    },
  )

  if (!response.ok) {
    let message = 'No se pudo actualizar el producto.'

    try {
      const errorData = await response.json()

      if (errorData.detail) {
        message = errorData.detail
      }
    } catch {
      // Conservamos el mensaje general si la API
      // no devuelve una respuesta JSON.
    }

    throw new Error(message)
  }

  return response.json()
}

// ============================================================
// VENTAS
// ============================================================
//
// Estas funciones permiten consultar las ventas reales
// almacenadas en PostgreSQL mediante FastAPI.
//
// IMPORTANTE:
// El frontend NO consulta Supabase directamente.
// El flujo es:
//
// React
//   ↓
// authenticatedFetch()
//   ↓
// JWT
//   ↓
// FastAPI /api/v1/sales
//   ↓
// SQLAlchemy
//   ↓
// PostgreSQL / Supabase
// ============================================================

/**
 * Representa una venta almacenada en la tabla sales.
 *
 * Estos campos corresponden al modelo real del backend.
 */
export interface Sale {
  // Identificador de la venta.
  id: number

  // Empresa relacionada con la venta.
  company_id: number

  // Sucursal donde se registró la venta.
  branch_id: number

  // Usuario que registró la venta.
  user_id: number

  // Importe total de la venta.
  total: number

  // Fecha y hora en que se creó la venta.
  created_at: string
}

/**
 * Producto enviado al registrar una venta.
 *
 * El frontend únicamente envía producto y cantidad.
 * El backend obtiene el precio real y calcula el subtotal.
 */
export interface CreateSaleDetailData {
  product_id: number
  quantity: number
}

/**
 * Datos necesarios para registrar una venta completa.
 */
export interface CreateSaleData {
  company_id: number
  branch_id: number
  user_id: number
  details: CreateSaleDetailData[]
}

/**
 * Detalle devuelto por FastAPI después de crear la venta.
 */
export interface SaleDetail {
  id: number
  sale_id: number
  product_id: number
  quantity: number
  unit_price: number
  subtotal: number
}

/**
 * Respuesta completa del POST /sales.
 */
export interface CreatedSaleResponse {
  sale: Sale
  details: SaleDetail[]
}

/**
 * Obtiene las ventas registradas en PostgreSQL.
 *
 * Endpoint:
 * GET /api/v1/sales
 *
 * El backend controla los permisos mediante RBAC.
 * Actualmente este endpoint está disponible para
 * Administrador y Analista.
 */
export async function getSales(): Promise<Sale[]> {
  // authenticatedFetch agrega automáticamente
  // el JWT almacenado en localStorage.
  const response = await authenticatedFetch(
    '/api/v1/sales'
  )

  // Si FastAPI devuelve 401, 403, 500, etc.,
  // informamos al componente que ocurrió un error.
  if (!response.ok) {
    let message =
      'No se pudieron obtener las ventas.'

    try {
      // Intentamos recuperar el mensaje enviado
      // por FastAPI.
      const errorData = await response.json()

      if (errorData.detail) {
        message = errorData.detail
      }
    } catch {
      // Si FastAPI no devuelve JSON,
      // mantenemos el mensaje genérico.
    }

    throw new Error(message)
  }

  // Convertimos la respuesta JSON de FastAPI
  // en un arreglo de ventas.
  return response.json()
}

/**
 * Registra una venta completa con uno o más productos.
 *
 * El total y los precios finales son calculados
 * nuevamente por FastAPI.
 */
export async function createSale(
  data: CreateSaleData,
): Promise<CreatedSaleResponse> {
  const response = await authenticatedFetch(
    '/api/v1/sales',
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
  )

  if (!response.ok) {
    let message = 'No se pudo registrar la venta.'

    try {
      const errorData = await response.json()

      if (errorData.detail) {
        message = errorData.detail
      }
    } catch {
      // Conservamos el mensaje general cuando
      // FastAPI no devuelve una respuesta JSON.
    }

    throw new Error(message)
  }

  return response.json()
}

// Representa un registro de inventario almacenado en PostgreSQL.
export interface InventoryItem {
  id: number
  branch_id: number
  product_id: number
  stock: number
  minimum_stock: number
  unit_cost: number | null
}

/**
 * Datos necesarios para crear un registro de inventario.
 */
export interface CreateInventoryData {
  branch_id: number
  product_id: number
  stock: number
  minimum_stock: number
  unit_cost?: number | null
}

/**
 * Datos administrables de un inventario existente.
 *
 * La sucursal y el producto no cambian porque forman
 * la identidad lógica del registro.
 */
export interface UpdateInventoryData {
  stock: number
  minimum_stock: number
  unit_cost?: number | null
}

// Obtiene el inventario real desde FastAPI.
export async function getInventory(): Promise<InventoryItem[]> {
  // Consultamos el endpoint protegido del inventario.
  const response = await authenticatedFetch('/api/v1/inventory')

  // Si FastAPI devuelve un error, mostramos el detalle disponible.
  if (!response.ok) {
    let message = 'No se pudo obtener el inventario.'

    try {
      const errorData = await response.json()

      if (errorData.detail) {
        message = errorData.detail
      }
    } catch {
      // Si FastAPI no devuelve JSON, mantenemos el mensaje genérico.
    }

    throw new Error(message)
  }

  // Convertimos la respuesta JSON al arreglo de inventario.
  return response.json()
}

/**
 * Registra las existencias iniciales de un producto
 * dentro de una sucursal.
 */
export async function createInventory(
  data: CreateInventoryData,
): Promise<InventoryItem> {
  const response = await authenticatedFetch(
    '/api/v1/inventory',
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
  )

  if (!response.ok) {
    let message = 'No se pudo crear el inventario.'

    try {
      const errorData = await response.json()

      if (errorData.detail) {
        message = errorData.detail
      }
    } catch {
      // Conservamos el mensaje general si la respuesta
      // del backend no contiene JSON.
    }

    throw new Error(message)
  }

  return response.json()
}


/**
 * Actualiza stock, stock mínimo y costo unitario.
 */
export async function updateInventory(
  inventoryId: number,
  data: UpdateInventoryData,
): Promise<InventoryItem> {
  const response = await authenticatedFetch(
    `/api/v1/inventory/${inventoryId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    },
  )

  if (!response.ok) {
    let message = 'No se pudo actualizar el inventario.'

    try {
      const errorData = await response.json()

      if (errorData.detail) {
        message = errorData.detail
      }
    } catch {
      // Conservamos el mensaje general si FastAPI
      // no devuelve una respuesta JSON.
    }

    throw new Error(message)
  }

  return response.json()
}

// Representa una venta incluida en el reporte.
export interface SalesReportItem {
  id: number
  company_id: number
  branch_id: number
  user_id: number
  total: number
  created_at: string
}

// Representa un registro de inventario incluido en el reporte.
export interface InventoryReportItem {
  id: number
  branch_id: number
  product_id: number
  stock: number
  minimum_stock: number
  unit_cost: number | null
}

// Representa la respuesta completa del endpoint de reportes.
export interface ReportsResponse {
  sales: SalesReportItem[]
  inventory: InventoryReportItem[]
}

// Obtiene los reportes generados a partir de los datos reales.
export async function getReports(): Promise<ReportsResponse> {
  // Consultamos el endpoint protegido de reportes.
  const response = await authenticatedFetch('/api/v1/reports')

  // Si FastAPI devuelve un error, intentamos mostrar su detalle.
  if (!response.ok) {
    let message = 'No se pudieron obtener los reportes.'

    try {
      const errorData = await response.json()

      if (errorData.detail) {
        message = errorData.detail
      }
    } catch {
      // Si no existe una respuesta JSON, usamos el mensaje genérico.
    }

    throw new Error(message)
  }

  // Devolvemos los datos reales enviados por FastAPI.
  return response.json()
}

// ============================================================
// DASHBOARD
// ============================================================
//
// El Dashboard utiliza un único endpoint especializado.
//
// React
//   ↓
// GET /api/v1/reports/dashboard
//   ↓
// FastAPI
//   ↓
// PostgreSQL
//
// De esta manera evitamos realizar varias consultas repetidas
// desde cada gráfico del Dashboard.
// ============================================================

export interface DashboardSummary {
  total_sales: number
  total_inventory: number
  sales_count: number
}


export interface DashboardSalesByPeriod {
  period: string
  total: number
}


export interface DashboardSalesByBranch {
  branch_id: number
  branch_name: string
  total: number
}


export interface DashboardSalesByProduct {
  product_id: number
  product_name: string
  quantity: number
  total: number
}


export interface DashboardRecentSale {
  sale_id: number
  branch_id: number
  branch_name: string
  total: number
  created_at: string
}


export interface DashboardResponse {
  summary: DashboardSummary

  sales_by_period: DashboardSalesByPeriod[]

  sales_by_branch: DashboardSalesByBranch[]

  sales_by_product: DashboardSalesByProduct[]

  recent_sales: DashboardRecentSale[]
}


/**
 * Obtiene toda la información necesaria para construir
 * el Dashboard mediante una única petición.
 */
export async function getDashboard(): Promise<DashboardResponse> {
  const response = await authenticatedFetch(
    '/api/v1/reports/dashboard',
  )

  if (!response.ok) {
    let message =
      'No se pudo cargar la información del Dashboard.'

    try {
      const errorData = await response.json()

      if (errorData.detail) {
        message = errorData.detail
      }
    } catch {
      // Conservamos el mensaje general si FastAPI
      // no devuelve una respuesta JSON.
    }

    throw new Error(message)
  }

  return response.json()
}

// ============================================================
// USUARIOS
// ============================================================
//
// Estos servicios conectan la pantalla Usuarios con FastAPI.
//
// Flujo:
// React
//   ↓
// getUsers() / createUser()
//   ↓
// authenticatedFetch()
//   ↓
// JWT
//   ↓
// FastAPI /api/v1/users
//   ↓
// Repository
//   ↓
// PostgreSQL
//
// IMPORTANTE:
// La autorización de Administrador se mantiene en el backend.
// ============================================================

/**
 * Representa un usuario recibido desde FastAPI.
 *
 * La contraseña nunca forma parte de esta interfaz porque
 * el backend jamás devuelve contraseñas ni hashes.
 */
export interface User {
  // Identificador único del usuario.
  id: number

  // Nombre de usuario utilizado para iniciar sesión.
  username: string

  // Correo electrónico del usuario.
  email: string

  // Nombre completo.
  full_name: string

  // Indica si la cuenta está activa.
  is_active: boolean

  // Identificador del rol almacenado en PostgreSQL.
  role_id: number
}

/**
 * Datos necesarios para registrar un usuario.
 *
 * La contraseña solamente se envía al backend para que
 * FastAPI genere el hash correspondiente.
 */
export interface CreateUserData {
  // Nombre de usuario único.
  username: string

  // Correo electrónico único.
  email: string

  // Contraseña inicial.
  password: string

  // Nombre completo.
  full_name: string

  // ID del rol seleccionado.
  role_id: number
}

/**
 * Datos que pueden modificarse en una cuenta existente.
 *
 * La contraseña no se incluye porque tendrá un flujo
 * independiente de cambio de contraseña.
 */
export interface UpdateUserData {
  username: string
  email: string
  full_name: string
  role_id: number
  is_active: boolean
}

/**
 * Obtiene todos los usuarios.
 *
 * Endpoint:
 * GET /api/v1/users
 *
 * Este endpoint está protegido para Administrador.
 */
export async function getUsers(): Promise<User[]> {
  // Enviamos automáticamente el JWT actual.
  const response = await authenticatedFetch(
    '/api/v1/users'
  )

  // Si FastAPI devuelve un error, intentamos mostrar
  // el detalle proporcionado por el backend.
  if (!response.ok) {
    let message = 'No se pudieron obtener los usuarios.'

    try {
      const errorData = await response.json()

      if (errorData.detail) {
        message = errorData.detail
      }
    } catch {
      // Si la respuesta no contiene JSON,
      // conservamos el mensaje genérico.
    }

    throw new Error(message)
  }

  // Devolvemos los usuarios reales de PostgreSQL.
  return response.json()
}

/**
 * Registra un nuevo usuario.
 *
 * Endpoint:
 * POST /api/v1/users
 */
export async function createUser(
  data: CreateUserData
): Promise<User> {
  // Enviamos los datos al backend utilizando el JWT.
  const response = await authenticatedFetch(
    '/api/v1/users',
    {
      method: 'POST',

      // Convertimos el objeto TypeScript a JSON.
      body: JSON.stringify(data),
    }
  )

  // Si FastAPI devuelve un error, intentamos mostrar
  // el mensaje enviado por el backend.
  if (!response.ok) {
    let message = 'No se pudo registrar el usuario.'

    try {
      const errorData = await response.json()

      if (errorData.detail) {
        message = errorData.detail
      }
    } catch {
      // Si no existe una respuesta JSON,
      // usamos el mensaje genérico.
    }

    throw new Error(message)
  }

  // Devolvemos el usuario creado por FastAPI.
  return response.json()
}

/**
 * Actualiza un usuario existente.
 *
 * Endpoint:
 * PATCH /api/v1/users/{userId}
 */
export async function updateUser(
  userId: number,
  data: UpdateUserData,
): Promise<User> {
  // El JWT se agrega automáticamente mediante authenticatedFetch().
  const response = await authenticatedFetch(
    `/api/v1/users/${userId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    },
  )

  if (!response.ok) {
    let message = 'No se pudo actualizar el usuario.'

    try {
      const errorData = await response.json()

      if (errorData.detail) {
        message = errorData.detail
      }
    } catch {
      // Conservamos el mensaje general si FastAPI
      // no devuelve una respuesta JSON.
    }

    throw new Error(message)
  }

  return response.json()
}

// ============================================================
// MATRICES
// ============================================================

// Representa una matriz almacenada en el backend.
export interface Matrix {
  id: number
  company_id: number
  name: string
  description: string | null
  rows: number
  columns: number
  values: number[][]
}

// Datos necesarios para crear una matriz.
export interface CreateMatrixData {
  company_id: number
  name: string
  description?: string | null
  values: number[][]
}

// Obtiene todas las matrices registradas.
export async function getMatrices(): Promise<Matrix[]> {
  // Enviamos el JWT al backend.
  const response = await authenticatedFetch(
    '/api/v1/matrices'
  )

  // Procesamos posibles errores.
  if (!response.ok) {
    let message = 'No se pudieron obtener las matrices.'

    try {
      const errorData = await response.json()

      if (errorData.detail) {
        message = errorData.detail
      }
    } catch {
      // Conservamos el mensaje genérico.
    }

    throw new Error(message)
  }

  // Devolvemos las matrices reales.
  return response.json()
}

// Obtiene una matriz específica.
export async function getMatrix(
  matrixId: number
): Promise<Matrix> {
  // Consultamos la matriz por su identificador.
  const response = await authenticatedFetch(
    `/api/v1/matrices/${matrixId}`
  )

  // Procesamos posibles errores.
  if (!response.ok) {
    let message = 'No se pudo obtener la matriz.'

    try {
      const errorData = await response.json()

      if (errorData.detail) {
        message = errorData.detail
      }
    } catch {
      // Conservamos el mensaje genérico.
    }

    throw new Error(message)
  }

  // Devolvemos la matriz real.
  return response.json()
}

// Registra una nueva matriz en el backend.
export async function createMatrix(
  data: CreateMatrixData
): Promise<Matrix> {
  // Enviamos la matriz mediante POST.
  const response = await authenticatedFetch(
    '/api/v1/matrices',
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  )

  // Procesamos posibles errores.
  if (!response.ok) {
    let message = 'No se pudo registrar la matriz.'

    try {
      const errorData = await response.json()

      if (errorData.detail) {
        message = errorData.detail
      }
    } catch {
      // Conservamos el mensaje genérico.
    }

    throw new Error(message)
  }

  // Devolvemos la matriz recién creada.
  return response.json()
}

// ============================================================
// VECTORES Y OPERACIONES MATEMÁTICAS
// ============================================================
//
// Estos servicios conectan el módulo matemático de React
// con los endpoints reales de FastAPI.
//
// Vectores:
//   GET  /api/v1/vectors
//   GET  /api/v1/vectors/{id}
//   POST /api/v1/vectors
//
// Operaciones:
//   GET  /api/v1/operations
//   POST /api/v1/operations
//
// Los cálculos matemáticos NO se realizan en React.
// FastAPI delega estas operaciones al motor NumPy.
// ============================================================

// ------------------------------------------------------------
// INTERFAZ DE VECTOR
// ------------------------------------------------------------

/**
 * Representa un vector almacenado en el backend.
 */
export interface Vector {
  // Identificador único del vector.
  id: number

  // Empresa propietaria del vector.
  company_id: number

  // Nombre descriptivo.
  name: string

  // Descripción opcional.
  description: string | null

  // Cantidad de componentes.
  dimension: number

  // Valores numéricos del vector.
  values: number[]
}

// ------------------------------------------------------------
// DATOS PARA CREAR UN VECTOR
// ------------------------------------------------------------

export interface CreateVectorData {
  // Empresa propietaria.
  company_id: number

  // Nombre del vector.
  name: string

  // Descripción opcional.
  description?: string | null

  // Componentes numéricos.
  values: number[]
}

// ------------------------------------------------------------
// OBTENER VECTORES
// ------------------------------------------------------------

/**
 * Obtiene todos los vectores registrados.
 *
 * Endpoint:
 * GET /api/v1/vectors
 */
export async function getVectors(): Promise<Vector[]> {
  // Enviamos el JWT mediante authenticatedFetch().
  const response = await authenticatedFetch(
    '/api/v1/vectors'
  )

  // Procesamos posibles errores del backend.
  if (!response.ok) {
    let message = 'No se pudieron obtener los vectores.'

    try {
      const errorData = await response.json()

      if (errorData.detail) {
        message = errorData.detail
      }
    } catch {
      // Conservamos el mensaje genérico.
    }

    throw new Error(message)
  }

  // Devolvemos los vectores reales.
  return response.json()
}

// ------------------------------------------------------------
// OBTENER UN VECTOR
// ------------------------------------------------------------

/**
 * Obtiene un vector específico junto con sus valores.
 *
 * Endpoint:
 * GET /api/v1/vectors/{vector_id}
 */
export async function getVector(
  vectorId: number
): Promise<Vector> {
  const response = await authenticatedFetch(
    `/api/v1/vectors/${vectorId}`
  )

  if (!response.ok) {
    let message = 'No se pudo obtener el vector.'

    try {
      const errorData = await response.json()

      if (errorData.detail) {
        message = errorData.detail
      }
    } catch {
      // Conservamos el mensaje genérico.
    }

    throw new Error(message)
  }

  return response.json()
}

// ------------------------------------------------------------
// CREAR VECTOR
// ------------------------------------------------------------

/**
 * Registra un nuevo vector en PostgreSQL.
 *
 * Endpoint:
 * POST /api/v1/vectors
 */
export async function createVector(
  data: CreateVectorData
): Promise<Vector> {
  const response = await authenticatedFetch(
    '/api/v1/vectors',
    {
      method: 'POST',

      // Convertimos los datos a JSON.
      body: JSON.stringify(data),
    }
  )

  if (!response.ok) {
    let message = 'No se pudo registrar el vector.'

    try {
      const errorData = await response.json()

      if (errorData.detail) {
        message = errorData.detail
      }
    } catch {
      // Conservamos el mensaje genérico.
    }

    throw new Error(message)
  }

  return response.json()
}

// ============================================================
// OPERACIONES MATEMÁTICAS
// ============================================================

// Datos necesarios para registrar una operación matemática.
export interface CreateOperationData {
  company_id: number
  name: string
  operation_type: string
  first_values: number[][]
  second_values?: number[][] | null

  // Primer escalar o coeficiente de la operación.
  scalar?: number | null

  // Segundo coeficiente utilizado en combinaciones lineales.
  second_scalar?: number | null

  // Identificadores opcionales de matrices y vectores.
  first_vector_id?: number | null
  second_vector_id?: number | null
  result_vector_id?: number | null
  first_matrix_id?: number | null
  second_matrix_id?: number | null
  result_matrix_id?: number | null
}

/**
 * Respuesta del backend después de ejecutar una operación.
 */
export interface Operation {
  id: number
  company_id: number
  name: string
  operation_type: string

  // El backend puede devolver un número o un arreglo.
  result: unknown
}

/**
 * Ejecuta una operación matemática en FastAPI.
 *
 * Endpoint:
 * POST /api/v1/operations
 *
 * El cálculo se realiza en el backend utilizando NumPy.
 */
export async function createOperation(
  data: CreateOperationData
): Promise<Operation> {
  const response = await authenticatedFetch(
    '/api/v1/operations',
    {
      method: 'POST',

      // Enviamos exactamente el contrato definido
      // por OperationCreate en FastAPI.
      body: JSON.stringify(data),
    }
  )

  if (!response.ok) {
    let message = 'No se pudo ejecutar la operación.'

    try {
      const errorData = await response.json()

      if (errorData.detail) {
        message = errorData.detail
      }
    } catch {
      // Conservamos el mensaje genérico.
    }

    throw new Error(message)
  }

  // Devolvemos el resultado calculado por el backend.
  return response.json()
}

// ============================================================
// HISTORIAL DE OPERACIONES MATEMÁTICAS
// ============================================================

// Entrada utilizada por una operación registrada.
export interface OperationHistoryInput {
  name: string
  type: 'vector' | 'matrix'
  id: number
  source_name: string
}

// Resultado vectorial o matricial reconstruido
// desde PostgreSQL.
export interface OperationHistoryStructuredResult {
  id: number
  name: string
  values: number[] | number[][]
}

// Registro completo utilizado por Historial.tsx.
export interface OperationHistoryItem {
  id: number
  company_id: number
  name: string
  operation_type: string
  description: string | null
  created_at: string

  inputs: OperationHistoryInput[]

  result_type:
  | 'scalar'
  | 'vector'
  | 'matrix'
  | null

  result:
  | number
  | OperationHistoryStructuredResult
  | null

  execution_time: number | null
}

/**
 * Obtiene el historial completo de operaciones matemáticas.
 *
 * Endpoint:
 * GET /api/v1/operations
 */
export async function getOperations(): Promise<
  OperationHistoryItem[]
> {
  // authenticatedFetch devuelve un objeto Response.
  const response = await authenticatedFetch(
    '/api/v1/operations',
  )

  // Si FastAPI devuelve un error,
  // intentamos recuperar el mensaje correspondiente.
  if (!response.ok) {
    let message =
      'No se pudieron obtener las operaciones.'

    try {
      const errorData = await response.json()

      if (errorData.detail) {
        message = errorData.detail
      }
    } catch {
      // Conservamos el mensaje genérico si la
      // respuesta del backend no contiene JSON.
    }

    throw new Error(message)
  }

  // Convertimos el JSON recibido al contrato
  // utilizado por Historial.tsx.
  return response.json()
}