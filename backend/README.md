# MatrixFlow Enterprise — Resumen del trabajo realizado

## 1. Objetivo general

MatrixFlow Enterprise es una aplicación empresarial con:

- **Backend:** FastAPI + SQLAlchemy + PostgreSQL.
- **Frontend:** React + TypeScript + Vite + Tailwind CSS.
- **Base de datos:** Supabase PostgreSQL.
- **Autenticación:** JWT + bcrypt.
- **Arquitectura:** rutas → servicios → repositorios → modelos.

La prioridad ha sido avanzar paso a paso y conservar el diseño existente del frontend.

---

# 2. Seguridad del backend

Se trabajó primero en la autenticación.

## Archivo

`backend/app/core/security.py`

Se implementaron funciones para:

- Verificar contraseñas.
- Generar hashes con bcrypt.
- Crear tokens JWT.
- Decodificar tokens JWT.

Configuración utilizada:

- Algoritmo: `HS256`.
- Expiración del token: 60 minutos.
- Clave secreta tomada desde `settings.SECRET_KEY`.

También se instaló:

```text
bcrypt==4.0.1
```

La versión se fijó porque era necesaria para mantener compatibilidad con Passlib.

---

# 3. Servicio de autenticación

## Archivo

`backend/app/services/auth_service.py`

El servicio de autenticación ahora:

1. Busca al usuario por correo.
2. Verifica la contraseña.
3. Busca el rol asociado al usuario.
4. Devuelve el usuario y su rol.
5. Lanza un error si las credenciales no son válidas.

Esto permite separar la lógica de autenticación de las rutas HTTP.

---

# 4. Endpoint de login

## Archivo

`backend/app/api/routes/auth.py`

El login ahora genera un JWT con información básica:

```text
sub  → ID del usuario
role → nombre del rol
```

La respuesta tiene la estructura:

```json
{
  "access_token": "TOKEN",
  "token_type": "bearer"
}
```

Los errores de autenticación devuelven HTTP 401.

---

# 5. Configuración del backend

## Archivo

`backend/app/core/config.py`

Se centralizó la configuración de MatrixFlow.

Incluye:

- Nombre de la aplicación.
- Versión.
- Prefijo de la API.
- Configuración PostgreSQL.
- `DATABASE_URL`.
- `SECRET_KEY`.

La configuración permite utilizar `.env` sin tener que escribir las credenciales directamente en el código.

---

# 6. Conexión a la base de datos

## Archivo

`backend/app/core/database.py`

Se configuró SQLAlchemy mediante:

```text
engine
SessionLocal
Base
get_db()
```

`get_db()` crea una sesión para cada petición HTTP y la cierra al terminar.

---

# 7. CORS

## Archivo

`backend/app/main.py`

Se agregó CORS para permitir que el frontend React pueda comunicarse con FastAPI.

Se permitieron:

```text
http://localhost:5173
http://127.0.0.1:5173
```

También se registraron las rutas principales del backend bajo:

```text
/api/v1
```

---

# 8. Conexión del frontend con el backend

## Archivo

`frontend/src/services/api.ts`

Se creó el cliente básico para comunicarse con FastAPI.

La URL actual es:

```text
http://127.0.0.1:8000
```

También se agregó:

```text
checkBackend()
```

Esta función consulta:

```text
GET /health
```

y permite comprobar si el backend está funcionando.

En el navegador se comprobó que aparece:

```text
Backend conectado correctamente
```

Por lo tanto:

**Frontend → Backend**

ya funciona correctamente.

---

# 9. Conexión con Supabase

Se intentó primero conectar utilizando el host directo de PostgreSQL de Supabase.

Ese método presentó un problema de resolución de red en Windows.

Por eso se utilizó el **Session Pooler de Supabase**.

Host utilizado:

```text
aws-0-us-east-2.pooler.supabase.com
```

Puerto:

```text
5432
```

Usuario:

```text
postgres.uyexpibwntyeqhjnnfvs
```

Base de datos:

```text
postgres
```

La conexión se probó directamente con Psycopg y funcionó:

```text
CONEXION SUPABASE OK
```

Por lo tanto:

**Backend → Supabase PostgreSQL**

también tiene las credenciales correctas.

> Importante: nunca se debe subir la contraseña de Supabase a GitHub ni compartirla públicamente.

---

# 10. Problema actual de la base de datos

Cuando se llamó:

```text
GET /api/v1/products
```

FastAPI llegó correctamente hasta PostgreSQL, pero PostgreSQL respondió:

```text
relation "products" does not exist
```

Esto significa que:

**La conexión a Supabase funciona.**

El problema es que las tablas todavía no fueron creadas en la base de datos.

Por eso ahora necesitamos utilizar **Alembic** para crear y administrar las tablas.

---

# 11. Configuración inicial de Alembic

Se ejecutó:

```cmd
alembic init alembic
```

Esto creó:

```text
backend/
├── alembic/
│   ├── env.py
│   ├── README
│   ├── script.py.mako
│   └── versions/
└── alembic.ini
```

Sin embargo, el `alembic.ini` original estaba vacío.

El siguiente paso pendiente es configurar correctamente:

```text
alembic.ini
```

y:

```text
alembic/env.py
```

para que Alembic conozca los modelos de SQLAlchemy y la conexión de Supabase.

---

# 12. Productos

Se trabajó en el módulo de productos.

## Modelo

`backend/app/models/product.py`

La tabla `products` contiene:

```text
id
name
category_id
price
active
```

El producto se relaciona con:

```text
categories
```

mediante:

```text
category_id
```

---

# 13. Categorías

## Modelo

`backend/app/models/category.py`

La tabla `categories` contiene:

```text
id
name
```

El nombre de la categoría es único.

---

# 14. Inventario

## Archivo

`backend/app/models/inventory.py`

Se definieron dos modelos:

### Inventory

Representa las existencias:

```text
id
branch_id
product_id
quantity
```

### InventoryMovement

Representa movimientos:

```text
id
product_id
branch_id
movement_type
quantity
created_at
```

Esto permite posteriormente registrar:

```text
entradas
salidas
ajustes
```

---

# 15. Repository de inventario

## Archivo

`backend/app/repositories/inventory_repository.py`

Se agregaron funciones para:

- Obtener todo el inventario.
- Buscar inventario por sucursal.
- Buscar inventario por producto.
- Crear inventario.
- Registrar movimientos.

La idea es mantener separada la consulta a la base de datos de la lógica de negocio.

---

# 16. Repository de productos

## Archivo

`backend/app/repositories/product_repository.py`

Se modificó la consulta de productos para obtener:

```text
id
name
category
price
stock
active
```

El stock se calcula sumando las cantidades de inventario:

```text
SUM(inventory.quantity)
```

Y cuando un producto no tiene inventario se utiliza:

```text
COALESCE(..., 0)
```

para mostrar:

```text
stock = 0
```

También se implementaron funciones para:

- Obtener todos los productos.
- Obtener un producto por ID.
- Obtener productos activos.
- Crear productos.

---

# 17. Servicio de productos

## Archivo

`backend/app/services/product_service.py`

Se implementó la lógica para:

- Listar productos.
- Listar productos activos.
- Buscar productos por ID.
- Registrar productos.

También se agregó una validación para evitar:

```text
nombre vacío
precio negativo
```

---

# 18. Rutas de productos

## Archivo

`backend/app/api/routes/products.py`

Actualmente existen rutas para:

```text
GET  /api/v1/products
GET  /api/v1/products/active
GET  /api/v1/products/{product_id}
POST /api/v1/products
```

La ruta utiliza:

```text
product_service
```

para mantener la separación de responsabilidades.

---

# 19. Problema pendiente en productos

Hay una diferencia entre lo que devuelve el backend y lo que espera el frontend.

El frontend utiliza:

```typescript
interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: "Activo" | "Inactivo";
}
```

Pero una parte del backend devuelve:

```text
active
```

en lugar de:

```text
status
```

Esto deberá corregirse después de crear las tablas.

También existe una limitación actual en:

```text
POST /api/v1/products
```

porque recibe:

```text
category
stock
```

pero actualmente no utiliza completamente esos valores para crear la categoría y el inventario.

Se dejó pendiente para no hacer cambios innecesarios antes de terminar la conexión con la base de datos.

---

# 20. Frontend de Productos

## Archivo

`frontend/src/pages/Productos.tsx`

La pantalla actualmente utiliza datos locales mediante:

```typescript
useState(initialProducts);
```

Tiene:

- Buscador.
- Tabla.
- Crear producto.
- Editar producto.
- Eliminar producto.
- Modal.
- Validaciones.
- Estado activo/inactivo.

El objetivo es conectar posteriormente esta pantalla con:

```text
GET /api/v1/products
POST /api/v1/products
```

sin cambiar su diseño visual.

---

# 21. Combinaciones lineales

## Archivo

`frontend/src/pages/CombinacionesLineales.tsx`

Actualmente el componente contiene solamente:

```text
Título:
Combinaciones lineales

Descripción:
Módulo de análisis de combinaciones lineales.
```

El código actual es una página inicial.

Por eso **no aparece ningún gráfico**.

Todavía no se ha implementado:

- Entrada de vectores.
- Coeficientes.
- Operación matemática.
- Vector resultante.
- Gráfico.
- Representación visual de los vectores.

La página actual no está rota: simplemente todavía no tiene implementada esa funcionalidad.

---

# 22. Qué falta hacer ahora

El orden recomendado para continuar es:

## Paso 1 — Terminar Alembic

Configurar:

```text
backend/alembic.ini
backend/alembic/env.py
```

para conectar Alembic con:

```text
Supabase PostgreSQL
```

---

## Paso 2 — Detectar todos los modelos

Alembic debe conocer todos los modelos de MatrixFlow.

Por ejemplo:

```text
User
Role
Company
Branch
Category
Product
Inventory
InventoryMovement
Sale
...
```

Esto permitirá generar el esquema inicial.

---

## Paso 3 — Crear la migración inicial

Ejecutar:

```cmd
alembic revision --autogenerate -m "initial schema"
```

Después revisar la migración generada.

---

## Paso 4 — Crear las tablas en Supabase

Ejecutar:

```cmd
alembic upgrade head
```

Esto debe crear las tablas en PostgreSQL.

---

## Paso 5 — Probar productos

Comprobar:

```text
GET /api/v1/products
```

Ahora ya no debería aparecer:

```text
relation "products" does not exist
```

---

## Paso 6 — Corregir la respuesta de productos

Adaptar el backend para que devuelva exactamente:

```text
id
name
category
price
stock
status
```

como espera React.

---

## Paso 7 — Conectar Productos.tsx

Sustituir gradualmente:

```typescript
useState(initialProducts);
```

por datos obtenidos desde FastAPI.

El diseño actual se debe conservar.

---

## Paso 8 — Implementar Combinaciones Lineales

Después se puede construir el módulo matemático:

```text
Vector 1
Vector 2
Coeficiente 1
Coeficiente 2
        ↓
Combinación lineal
        ↓
Vector resultante
        ↓
Gráfico
```

La parte gráfica puede hacerse con una librería de gráficos adecuada para React.

---

# 23. Estado actual del proyecto

| Área                              | Estado                                   |
| --------------------------------- | ---------------------------------------- |
| FastAPI                           | ✅ Funcionando                           |
| React/Vite                        | ✅ Funcionando                           |
| Frontend → Backend                | ✅ Conectado                             |
| JWT                               | ✅ Implementado                          |
| bcrypt                            | ✅ Configurado                           |
| Supabase                          | ✅ Conexión validada                     |
| SQLAlchemy                        | ✅ Configurado                           |
| Productos API                     | 🟡 Implementada, falta validar contra BD |
| Inventario                        | 🟡 Modelos/repository preparados         |
| Alembic                           | 🟡 Inicializado, falta configurar        |
| Tablas Supabase                   | 🔴 Todavía no creadas                    |
| Productos frontend → API          | 🔴 Pendiente                             |
| Combinaciones lineales            | 🔴 Solo pantalla inicial                 |
| Gráfico de combinaciones lineales | 🔴 Pendiente                             |

---

# 24. Arquitectura que estamos utilizando

La estructura principal sigue esta idea:

```text
React
  │
  │ HTTP
  ▼
FastAPI
  │
  ├── Routes
  │
  ├── Services
  │
  ├── Repositories
  │
  └── Models
        │
        ▼
   SQLAlchemy
        │
        ▼
PostgreSQL / Supabase
```

La ventaja es que cada parte tiene una responsabilidad específica.

---

# 25. Regla importante para continuar

Para evitar romper el proyecto:

1. Cambiar una cosa a la vez.
2. Probar después de cada cambio.
3. No modificar el diseño del frontend sin necesidad.
4. No colocar contraseñas directamente en el código.
5. Mantener comentarios en español para entender el código.
6. Revisar las migraciones antes de ejecutarlas.
7. No hacer grandes refactorizaciones mientras estamos conectando los módulos.

---

## Próximo paso

El siguiente trabajo concreto es:

**terminar la configuración de Alembic → generar la migración inicial → crear las tablas en Supabase.**

Después podremos conectar las pantallas React directamente a los datos reales de MatrixFlow.
