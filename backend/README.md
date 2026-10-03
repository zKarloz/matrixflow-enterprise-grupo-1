# MatrixFlow Enterprise — Backend

Backend REST de **MatrixFlow Enterprise**, desarrollado con Python y FastAPI.

Este módulo implementa la capa de servicios, persistencia, seguridad y procesamiento matemático descrita en el **Plan Maestro de Desarrollo — MatrixFlow Enterprise v1.0 (septiembre de 2026)**.

Su responsabilidad principal es conectar la información empresarial con PostgreSQL y con el motor matemático NumPy, exponiendo los resultados al frontend mediante HTTP/JSON.

---

## 1. Propósito

El backend concentra:

- autenticación;
- autorización mediante roles;
- lógica de negocio;
- validación de datos;
- persistencia PostgreSQL;
- gestión de ventas e inventario;
- vectores y matrices;
- operaciones matemáticas;
- combinaciones lineales;
- historial;
- reportes;
- auditoría.

### Arquitectura general

```text
React + TypeScript
        ↓ HTTP / JSON
FastAPI + Python
        ↓
Pydantic / Services / Repositories
        ↓
├── PostgreSQL
└── NumPy
        ↓
Historial / Auditoría
        ↓
JSON
        ↓
Frontend
```

---

## 2. Tecnologías utilizadas

| Tecnología          | Uso                                |
| ------------------- | ---------------------------------- |
| Python              | Lenguaje principal                 |
| FastAPI             | API REST                           |
| Uvicorn             | Servidor ASGI                      |
| SQLAlchemy          | ORM                                |
| PostgreSQL          | Persistencia                       |
| Supabase PostgreSQL | Infraestructura de base de datos   |
| Psycopg 3           | Driver PostgreSQL                  |
| Pydantic            | Validación y serialización         |
| Pydantic Settings   | Variables de entorno               |
| NumPy               | Motor matemático                   |
| Alembic             | Migraciones                        |
| python-jose         | JWT                                |
| Passlib + bcrypt    | Hash y verificación de contraseñas |
| Pytest              | Pruebas                            |
| HTTPX               | Pruebas HTTP                       |

---

## 3. Fases del Plan Maestro relacionadas

### Fase 2 — Backend Python + FastAPI

El backend implementa la API REST del sistema.

El Plan Maestro define una separación entre:

```text
Routers
↓
Services
↓
Repositories
↓
Algorithms / PostgreSQL
```

Esta arquitectura busca mantener responsabilidades separadas y facilitar pruebas y mantenimiento.

---

### Fase 3 — PostgreSQL y modelo de datos

La persistencia utiliza PostgreSQL mediante SQLAlchemy.

Entre las entidades principales se encuentran:

- usuarios;
- roles;
- empresas;
- sucursales;
- productos;
- ventas;
- detalles de venta;
- inventario;
- vectores;
- matrices;
- operaciones;
- auditoría.

La conexión se obtiene desde la variable:

```env
DATABASE_URL=...
```

El frontend nunca se conecta directamente a PostgreSQL.

---

### Fase 4 — Motor matemático Python + NumPy

NumPy se utiliza como núcleo de cálculo para operaciones con vectores y matrices.

Operaciones contempladas:

#### Vectores

```text
sum_vector()
subtract_vector()
scalar_multiply()
dot_product()
```

#### Matrices

```text
add_matrix()
subtract_matrix()
multiply_matrix()
transpose_matrix()
scalar_multiply_matrix()
```

#### Álgebra lineal

```text
linear_combination()
validate_dimensions()
validate_vector()
validate_matrix()
```

El objetivo es mantener los algoritmos matemáticos independientes, reutilizables y comprobables.

---

### Fase 5 — Integración

El backend constituye la capa intermedia entre React y PostgreSQL/NumPy:

```text
React
  ↓
FastAPI
  ↓
Services
  ├── lógica empresarial
  └── NumPy
  ↓
PostgreSQL
  ↓
JSON
```

---

### Fase 6 — Seguridad y auditoría

El sistema utiliza:

- JWT;
- autenticación Bearer;
- bcrypt para contraseñas;
- RBAC;
- validación del usuario activo;
- auditoría de accesos.

Roles:

| Rol           | Alcance general                                                   |
| ------------- | ----------------------------------------------------------------- |
| Administrador | Acceso completo                                                   |
| Analista      | Operación comercial, inventario, matemática, historial y reportes |
| Consulta      | Dashboard y reportes autorizados                                  |

La autorización real se realiza en FastAPI y no depende únicamente de que el frontend oculte opciones.

---

### Fase 7 — Dashboard y reportes

El backend consolida información persistida para alimentar:

- ventas por período;
- ventas por sucursal;
- ventas por producto;
- inventario;
- actividad reciente;
- reportes empresariales.

---

### Fase 8 — Pruebas

El backend contempla validaciones de:

- algoritmos matemáticos;
- endpoints;
- autenticación;
- autorización;
- integración con PostgreSQL;
- errores HTTP;
- reglas de negocio.

---

## 4. Estructura principal

La estructura sigue la separación planteada por el Plan Maestro:

```text
backend/
├── app/
│   ├── api/
│   │   └── routes/
│   │       ├── auth.py
│   │       ├── users.py
│   │       ├── companies.py
│   │       ├── branches.py
│   │       ├── products.py
│   │       ├── sales.py
│   │       ├── inventory.py
│   │       ├── vectors.py
│   │       ├── matrices.py
│   │       ├── operations.py
│   │       └── reports.py
│   ├── algorithms/
│   ├── core/
│   │   ├── config.py
│   │   ├── database.py
│   │   └── security.py
│   ├── models/
│   ├── repositories/
│   ├── schemas/
│   ├── services/
│   └── main.py
├── tests/
├── alembic/
├── alembic.ini
├── requirements.txt
└── .env
```

---

## 5. Configuración

La configuración central se encuentra en:

```text
app/core/config.py
```

Actualmente las variables obligatorias del backend son:

```env
DATABASE_URL=
SECRET_KEY=
```

### Ejemplo

```env
# PostgreSQL.
DATABASE_URL=postgresql+psycopg://USUARIO:CONTRASENA@HOST:5432/postgres?sslmode=require

# Clave utilizada para firmar JWT.
SECRET_KEY=CAMBIAR_POR_UNA_CLAVE_SEGURA
```

> `.env` contiene secretos reales y no debe versionarse.

El repositorio debe incluir únicamente un `.env.example` con valores ficticios.

---

## 6. Base de datos

La conexión se crea mediante SQLAlchemy:

```text
DATABASE_URL
     ↓
Pydantic Settings
     ↓
SQLAlchemy create_engine()
     ↓
PostgreSQL
```

El proyecto utiliza Psycopg 3:

```text
psycopg[binary]
```

por lo que la URL SQLAlchemy utiliza:

```text
postgresql+psycopg://
```

---

## 7. Seguridad

### Hash de contraseñas

Las contraseñas no se almacenan en texto plano.

El backend utiliza:

```text
Passlib
  ↓
bcrypt
  ↓
Hash almacenado
```

---

### JWT

Al iniciar sesión, FastAPI crea un token firmado.

Configuración actual:

```text
Algoritmo: HS256
Expiración: 60 minutos
```

Flujo:

```text
Credenciales
   ↓
Validación
   ↓
Usuario + rol
   ↓
JWT firmado
   ↓
Frontend
```

Las peticiones protegidas utilizan:

```http
Authorization: Bearer <token>
```

---

### Usuario autenticado

Antes de permitir una operación protegida, el backend:

1. recibe el Bearer Token;
2. valida el JWT;
3. obtiene el `sub`;
4. recupera al usuario desde PostgreSQL;
5. comprueba que exista;
6. comprueba que siga activo.

Por tanto, una cuenta desactivada deja de tener acceso aunque todavía posea un JWT no expirado.

---

### RBAC

El control de acceso se realiza mediante:

```python
require_roles(...)
```

Ejemplo conceptual:

```python
current_user = Depends(
    require_roles(
        "Administrador",
        "Analista",
    )
)
```

El rol se consulta nuevamente en PostgreSQL.

Esto evita depender exclusivamente del rol almacenado dentro del JWT.

---

## 8. Auditoría

El backend puede registrar eventos como el inicio de sesión.

Los registros de auditoría pueden conservar información como:

- usuario;
- acción;
- fecha;
- IP;
- ciudad;
- región;
- país;
- coordenadas aproximadas;
- User-Agent.

Estos datos alimentan el módulo **Seguridad y accesos** del frontend.

> La geolocalización basada en IP es aproximada y no representa necesariamente la ubicación física exacta del usuario.

---

## 9. Flujo de una operación matemática

El flujo sigue el patrón definido por el Plan Maestro:

```text
React
  ↓
POST /operations
  ↓
FastAPI Router
  ↓
Pydantic
  ↓
Operation Service
  ↓
NumPy
  ↓
Guardar historial
  ↓
JSON
  ↓
React
```

Esto mantiene separados:

- transporte HTTP;
- validación;
- lógica del servicio;
- cálculo matemático;
- persistencia.

---

## 10. Endpoints principales

El Plan Maestro define como base:

| Método | Endpoint             | Propósito          |
| ------ | -------------------- | ------------------ |
| POST   | `/api/v1/auth/login` | Autenticación      |
| GET    | `/api/v1/companies`  | Empresas           |
| GET    | `/api/v1/branches`   | Sucursales         |
| GET    | `/api/v1/products`   | Productos          |
| GET    | `/api/v1/sales`      | Ventas             |
| GET    | `/api/v1/inventory`  | Inventario         |
| POST   | `/api/v1/vectors`    | Crear vector       |
| POST   | `/api/v1/matrices`   | Crear matriz       |
| POST   | `/api/v1/operations` | Ejecutar operación |
| GET    | `/api/v1/operations` | Historial          |
| GET    | `/api/v1/reports`    | Reportes           |

La implementación actual extiende estos recursos con las operaciones necesarias para los módulos administrativos y empresariales.

---

## 11. Requerimientos funcionales relacionados

| Código | Requerimiento                    | Estado en backend                                              |
| ------ | -------------------------------- | -------------------------------------------------------------- |
| RF-01  | Iniciar sesión                   | Implementado                                                   |
| RF-02  | Gestionar usuarios y roles       | Implementado                                                   |
| RF-03  | Gestionar empresas y sucursales  | Implementado                                                   |
| RF-04  | Gestionar productos y categorías | Productos implementados; categorías dependen del alcance final |
| RF-05  | Registrar ventas                 | Implementado                                                   |
| RF-06  | Gestionar inventario             | Implementado                                                   |
| RF-07  | Registrar metas                  | No forma parte del flujo principal actualmente expuesto        |
| RF-08  | Crear y consultar vectores       | Implementado                                                   |
| RF-09  | Crear y consultar matrices       | Implementado                                                   |
| RF-10  | Ejecutar operaciones vectoriales | Implementado                                                   |
| RF-11  | Ejecutar operaciones matriciales | Implementado                                                   |
| RF-12  | Ejecutar combinaciones lineales  | Implementado                                                   |
| RF-13  | Conservar historial              | Implementado                                                   |
| RF-14  | Generar reportes                 | Implementado                                                   |
| RF-15  | Registrar eventos de auditoría   | Implementado para accesos y trazabilidad de seguridad          |

---

## 12. Requerimientos no funcionales respetados

### Seguridad y control de acceso

- JWT;
- contraseñas con hash;
- RBAC;
- validación del usuario activo;
- secretos mediante variables de entorno.

### Arquitectura modular

Separación entre:

```text
routers
schemas
services
repositories
models
algorithms
core
```

### Separación frontend/backend

El frontend consume una API REST; no existe acceso directo desde React a PostgreSQL.

### Validación

Pydantic valida estructuras recibidas por la API y el motor matemático verifica datos y dimensiones.

### Persistencia estructurada

SQLAlchemy gestiona la interacción con PostgreSQL.

### Trazabilidad

Las operaciones matemáticas pueden conservar entradas, resultados, usuario, fecha y tiempo de ejecución.

### Escalabilidad y mantenibilidad

La organización por capas reduce el acoplamiento entre rutas, lógica, persistencia y algoritmos.

### Rendimiento matemático

NumPy se utiliza para ejecutar operaciones vectoriales y matriciales.

---

## 13. Criterios de aceptación relacionados

| Código | Criterio                                                    | Cobertura backend                              |
| ------ | ----------------------------------------------------------- | ---------------------------------------------- |
| CA-01  | El usuario puede autenticarse según su rol                  | Sí                                             |
| CA-02  | El administrador puede registrar sucursales y productos     | Sí                                             |
| CA-03  | El usuario autorizado puede registrar ventas                | Sí                                             |
| CA-04  | El sistema permite representar datos como vectores          | Sí                                             |
| CA-05  | El sistema permite representar datos como matrices          | Sí                                             |
| CA-06  | Las dimensiones incompatibles son rechazadas                | Sí                                             |
| CA-07  | Las operaciones producen resultados matemáticamente válidos | Sí, mediante NumPy                             |
| CA-08  | Cada operación queda almacenada en el historial             | Sí                                             |
| CA-09  | El resultado puede visualizarse en el frontend              | El backend devuelve el resultado mediante JSON |
| CA-10  | Los reportes utilizan datos persistidos                     | Sí                                             |

---

## 14. Instalación

### Crear entorno virtual

Windows:

```bash
# Crear entorno virtual.
python -m venv .venv

# Activar en Git Bash.
source .venv/Scripts/activate
```

PowerShell:

```powershell
# Activar el entorno virtual.
.venv\Scripts\Activate.ps1
```

Linux/macOS:

```bash
# Crear y activar el entorno virtual.
python3 -m venv .venv
source .venv/bin/activate
```

---

### Instalar dependencias

```bash
# Instalar las dependencias del backend.
pip install -r requirements.txt
```

---

## 15. Ejecutar el servidor

```bash
# Iniciar FastAPI con recarga automática.
uvicorn app.main:app --reload
```

Servidor local:

```text
http://127.0.0.1:8000
```

Swagger:

```text
http://127.0.0.1:8000/docs
```

OpenAPI:

```text
http://127.0.0.1:8000/openapi.json
```

---

## 16. Pruebas

El Plan Maestro define la **Fase 8 — Pruebas** con las siguientes categorías:

- unitarias;
- integración;
- API;
- UI;
- seguridad;
- aceptación.

En el backend se pueden ejecutar las pruebas mediante:

```bash
# Ejecutar la suite de pruebas.
pytest
```

Las pruebas deben cubrir especialmente:

- algoritmos NumPy;
- dimensiones incompatibles;
- autenticación;
- JWT;
- RBAC;
- endpoints protegidos;
- persistencia;
- respuestas HTTP.

---

## 17. Relación con los sprints del Plan Maestro

El backend participa principalmente en:

- **Sprint 4:** FastAPI, endpoints y servicios.
- **Sprint 5:** PostgreSQL, modelos y migraciones.
- **Sprint 6:** Python + NumPy y pruebas unitarias.
- **Sprint 7:** integración completa.
- **Sprint 8:** JWT, roles, permisos y trazabilidad.
- **Sprint 9:** reportes.
- **Sprint 10:** pruebas y documentación.

---

## 18. Dependencias principales

El proyecto utiliza, entre otras:

```text
fastapi
uvicorn[standard]
sqlalchemy
psycopg[binary]
pydantic
python-dotenv
numpy
alembic
python-jose[cryptography]
passlib==1.7.4
bcrypt==4.0.1
python-multipart
pytest
httpx
pydantic-settings
email-validator
```

---

## 19. Producción

En el entorno de producción deben definirse al menos:

```text
DATABASE_URL
SECRET_KEY
```

Para producción se recomienda que `SECRET_KEY` sea:

- larga;
- aleatoria;
- distinta a la utilizada en desarrollo;
- almacenada únicamente como variable segura del proveedor de despliegue.

Un cambio de `SECRET_KEY` invalida los JWT firmados con la clave anterior, por lo que los usuarios deberán iniciar sesión nuevamente.

---

## 20. Alcance respecto al Plan Maestro

La implementación conserva el núcleo propuesto por el documento:

```text
Ventas / Inventario
        ↓
Vectores / Matrices
        ↓
Python + NumPy
        ↓
Resultados
        ↓
Historial / Reportes
```

Elementos contemplados por el Plan Maestro que pueden permanecer como ampliaciones futuras o fuera del flujo principal actual:

- metas empresariales;
- exportaciones avanzadas;
- gestión independiente de categorías;
- ampliación del sistema de auditoría a más acciones.

---

## 21. Documento de referencia

Este backend se desarrolló tomando como referencia:

**MatrixFlow Enterprise — Plan Maestro de Desarrollo**  
Versión 1.0 — Septiembre de 2026

Fases especialmente relacionadas:

- Fase 2 — Backend Python + FastAPI
- Fase 3 — PostgreSQL y modelo de datos
- Fase 4 — Motor matemático Python + NumPy
- Fase 5 — Integración
- Fase 6 — Seguridad y auditoría
- Fase 7 — Dashboard y reportes
- Fase 8 — Pruebas

---

## 22. Proyecto académico

MatrixFlow Enterprise aplica álgebra lineal dentro de un contexto empresarial realista.

El backend representa la capa central del sistema:

```text
FastAPI
├── Seguridad
├── Servicios empresariales
├── Persistencia PostgreSQL
├── Auditoría
└── Motor NumPy
```

Su objetivo es garantizar que los cálculos, reglas de negocio, permisos y datos persistidos puedan ser consumidos de forma segura y estructurada por el frontend.
