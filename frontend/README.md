# MatrixFlow Enterprise — Frontend

Frontend web de **MatrixFlow Enterprise**, una aplicación empresarial orientada a la gestión de ventas, inventario, usuarios y análisis matemático mediante vectores y matrices.

Este módulo implementa la capa de presentación definida en el **Plan Maestro de Desarrollo — MatrixFlow Enterprise v1.0 (septiembre de 2026)** y se integra con el backend FastAPI mediante HTTP/JSON.

---

## 1. Propósito

El frontend permite al usuario interactuar con los módulos empresariales y matemáticos del sistema desde una interfaz responsive.

La solución no funciona como una calculadora matricial aislada. Los vectores y matrices pueden representar información empresarial, como productos, sucursales, ventas e inventario, de acuerdo con el enfoque establecido en el Plan Maestro.

### Flujo general

```text
Usuario
  ↓
React + TypeScript
  ↓
Servicios HTTP
  ↓
FastAPI
  ↓
PostgreSQL / NumPy
  ↓
JSON
  ↓
React
```

---

## 2. Tecnologías utilizadas

| Tecnología   | Uso                              |
| ------------ | -------------------------------- |
| React        | Construcción de la interfaz      |
| TypeScript   | Tipado del frontend              |
| Vite         | Entorno de desarrollo y build    |
| React Router | Navegación y rutas protegidas    |
| Tailwind CSS | Estilos y diseño responsive      |
| Lucide React | Iconografía                      |
| Recharts     | Gráficos de Dashboard y Reportes |
| Fetch API    | Comunicación HTTP con FastAPI    |

> El Plan Maestro propone herramientas adicionales como TanStack Query, Axios, React Hook Form, Zod y shadcn/ui. La implementación final conserva el objetivo arquitectónico de la Fase 1, pero utiliza una solución más directa basada en servicios TypeScript, `fetch`, Tailwind CSS y componentes propios.

---

## 3. Fases del Plan Maestro relacionadas

### Fase 1 — Frontend React + TypeScript

El frontend implementa el objetivo principal de la **Fase 1: Frontend empresarial**:

- interfaz empresarial;
- navegación;
- layout responsive;
- formularios;
- tablas;
- Dashboard;
- pantallas de análisis;
- módulos de ventas e inventario;
- gestión visual de vectores y matrices;
- historial;
- reportes;
- configuración.

La navegación implementada incluye:

```text
MatrixFlow Enterprise
├── Login
├── Dashboard
├── Empresa
│   ├── Información de empresa
│   ├── Sucursales
│   └── Productos
├── Ventas
├── Inventario
├── Análisis Matemático
│   ├── Vectores
│   ├── Matrices
│   ├── Operaciones
│   └── Combinaciones lineales
├── Historial
├── Reportes
├── Usuarios
├── Seguridad y accesos
└── Configuración
```

### Fase 5 — Integración

El frontend cumple la separación indicada por el Plan Maestro:

```text
React
  ↓ HTTP / JSON
FastAPI
```

El frontend **no accede directamente a PostgreSQL**.

La comunicación se centraliza mediante los servicios definidos en:

```text
src/services/api.ts
```

### Fase 6 — Seguridad y auditoría

La interfaz adapta la navegación según el rol autenticado:

- **Administrador**
- **Analista**
- **Consulta**

El frontend utiliza el JWT entregado por FastAPI y lo adjunta a las peticiones protegidas.

La ocultación de opciones de navegación mejora la experiencia del usuario, pero la autorización real se valida en el backend.

### Fase 7 — Dashboard y reportes

La interfaz implementa visualizaciones empresariales mediante Recharts:

- ventas por período;
- ventas por sucursal;
- ventas por producto;
- estado del inventario;
- indicadores generales;
- actividad reciente.

### Fase 8 — Pruebas y validación

El frontend ha sido validado mediante:

- compilación TypeScript;
- `npm run build`;
- pruebas manuales de navegación;
- validación de formularios;
- pruebas responsive;
- pruebas de tema claro/oscuro;
- pruebas con diferentes roles;
- pruebas de integración con la API.

---

## 4. Páginas principales

### Login

Permite autenticar usuarios contra FastAPI.

Flujo:

```text
Login React
  ↓
POST /api/v1/auth/login
  ↓
FastAPI
  ↓
PostgreSQL
  ↓
JWT
  ↓
Sesión del frontend
```

La aplicación contempla tres roles:

| Rol           | Acceso general                                                |
| ------------- | ------------------------------------------------------------- |
| Administrador | Acceso completo                                               |
| Analista      | Ventas, Inventario, Análisis Matemático, Historial y Reportes |
| Consulta      | Dashboard, Reportes y Configuración                           |

---

### Dashboard

Presenta indicadores generales y visualizaciones empresariales:

- ventas acumuladas;
- inventario total;
- ventas registradas;
- ventas por período;
- ventas por sucursal;
- ventas por producto;
- actividad reciente.

También incorpora saludo personalizado según la sesión del usuario.

---

### Empresa

Funciona como punto central para la estructura empresarial.

Permite:

- consultar la empresa seleccionada;
- registrar empresas;
- acceder a Sucursales;
- acceder a Productos.

---

### Sucursales

Permite administrar las sedes vinculadas a una empresa.

---

### Productos

Gestiona el catálogo de productos utilizado por ventas, inventario y análisis matemático.

---

### Ventas

Permite registrar y consultar operaciones comerciales.

Los datos registrados alimentan otros módulos como:

- Dashboard;
- Reportes;
- vectores empresariales;
- análisis matemático.

---

### Inventario

Permite consultar y administrar existencias por producto y sucursal.

Incluye información como:

- stock;
- stock mínimo;
- costo unitario;
- valorización;
- alertas de stock.

---

### Vectores

Permite crear y consultar vectores.

Además de vectores manuales, el sistema puede representar información empresarial, por ejemplo:

- stock total por producto;
- precio por producto;
- unidades vendidas por producto;
- importe vendido por producto.

---

### Matrices

Permite registrar y consultar matrices.

Las matrices empresariales pueden utilizar:

```text
Filas    → sucursales
Columnas → productos
```

Ejemplos:

- stock por sucursal y producto;
- stock mínimo por sucursal y producto;
- valor del inventario por sucursal y producto.

---

### Operaciones

Permite seleccionar vectores o matrices y ejecutar operaciones matemáticas mediante el backend.

Entre las operaciones contempladas se encuentran:

- suma de vectores;
- resta de vectores;
- producto punto;
- multiplicación por escalar;
- suma de matrices;
- resta de matrices;
- multiplicación matricial;
- transposición;
- multiplicación matricial por escalar.

---

### Combinaciones lineales

Permite ejecutar combinaciones lineales de vectores:

```text
aU + bV
```

Los cálculos se realizan en el backend con Python y NumPy.

---

### Historial

Muestra la trazabilidad de las operaciones matemáticas.

Cada registro puede incluir:

- fecha;
- operación;
- tipo;
- entradas;
- resultado;
- tiempo de ejecución.

El detalle desplegable reutiliza información de Vectores y Matrices para facilitar la interpretación de los datos.

---

### Reportes

Consolida información persistida de ventas e inventario.

Incluye:

- ventas acumuladas;
- venta promedio;
- unidades en inventario;
- valor del inventario;
- stock bajo;
- ventas por sucursal;
- estado del inventario.

---

### Usuarios

Módulo administrativo para gestionar cuentas y roles.

Permite:

- consultar usuarios;
- crear usuarios;
- editar usuarios;
- activar/desactivar cuentas;
- asignar roles.

---

### Seguridad y accesos

Permite visualizar información de auditoría relacionada con accesos al sistema.

Puede mostrar:

- fecha y hora;
- usuario;
- dirección IP;
- ubicación aproximada;
- navegador / User-Agent;
- mapa referencial;
- historial de accesos.

---

### Configuración

Incluye preferencias visuales y de experiencia:

- tema claro/oscuro;
- saludo del Dashboard;
- accesibilidad visual;
- persistencia de preferencias en el navegador.

---

## 5. Requerimientos funcionales relacionados

Según el Plan Maestro, el frontend participa en los siguientes requerimientos:

| Código | Requerimiento                    | Estado en frontend                                                          |
| ------ | -------------------------------- | --------------------------------------------------------------------------- |
| RF-01  | Iniciar sesión                   | Implementado                                                                |
| RF-02  | Gestionar usuarios y roles       | Implementado                                                                |
| RF-03  | Gestionar empresas y sucursales  | Implementado                                                                |
| RF-04  | Gestionar productos y categorías | Productos implementados; categorías no se exponen como módulo independiente |
| RF-05  | Registrar ventas                 | Implementado                                                                |
| RF-06  | Gestionar inventario             | Implementado                                                                |
| RF-07  | Registrar metas                  | No se expone actualmente como módulo independiente                          |
| RF-08  | Crear y consultar vectores       | Implementado                                                                |
| RF-09  | Crear y consultar matrices       | Implementado                                                                |
| RF-10  | Ejecutar operaciones vectoriales | Implementado                                                                |
| RF-11  | Ejecutar operaciones matriciales | Implementado                                                                |
| RF-12  | Ejecutar combinaciones lineales  | Implementado                                                                |
| RF-13  | Conservar historial              | Visualización implementada                                                  |
| RF-14  | Generar reportes                 | Implementado                                                                |
| RF-15  | Registrar eventos de auditoría   | Visualización implementada; registro gestionado por backend                 |

---

## 6. Requerimientos no funcionales respetados

La implementación del frontend se alinea con los requerimientos no funcionales definidos en el Plan Maestro:

- **Seguridad y control de acceso:** navegación condicionada por rol y uso de JWT.
- **Arquitectura modular:** páginas, componentes, servicios y utilidades separados.
- **Separación frontend/backend:** React consume FastAPI mediante HTTP/JSON.
- **Validación:** formularios y respuestas controladas antes de enviar datos.
- **Trazabilidad:** visualización del historial matemático y accesos.
- **Escalabilidad y mantenibilidad:** componentes reutilizables y servicios centralizados.
- **Interfaz responsive:** adaptación a escritorio, tablet y teléfono.
- **Rendimiento adecuado:** carga asíncrona y consultas paralelas cuando corresponde.

---

## 7. Criterios de aceptación relacionados

| Código | Criterio                                                | Cobertura frontend                                 |
| ------ | ------------------------------------------------------- | -------------------------------------------------- |
| CA-01  | El usuario puede autenticarse según su rol              | Sí                                                 |
| CA-02  | El administrador puede registrar sucursales y productos | Sí                                                 |
| CA-03  | El usuario autorizado puede registrar ventas            | Sí                                                 |
| CA-04  | El sistema permite representar datos como vectores      | Sí                                                 |
| CA-05  | El sistema permite representar datos como matrices      | Sí                                                 |
| CA-06  | Las dimensiones incompatibles son rechazadas            | La UI comunica la validación realizada por backend |
| CA-07  | Las operaciones producen resultados válidos             | Los resultados se muestran en la interfaz          |
| CA-08  | Cada operación queda almacenada en el historial         | El frontend permite consultarla                    |
| CA-09  | El resultado puede visualizarse en el frontend          | Sí                                                 |
| CA-10  | Los reportes utilizan datos persistidos                 | Sí                                                 |

---

## 8. Estructura principal

```text
frontend/
├── src/
│   ├── components/
│   │   ├── dashboard/
│   │   ├── layout/
│   │   └── ...
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Empresa.tsx
│   │   ├── Sucursales.tsx
│   │   ├── Productos.tsx
│   │   ├── Ventas.tsx
│   │   ├── Inventario.tsx
│   │   ├── Vectores.tsx
│   │   ├── Matrices.tsx
│   │   ├── Operaciones.tsx
│   │   ├── CombinacionesLineales.tsx
│   │   ├── Historial.tsx
│   │   ├── Reportes.tsx
│   │   ├── Usuarios.tsx
│   │   ├── Seguridad.tsx
│   │   └── Configuracion.tsx
│   ├── services/
│   │   └── api.ts
│   ├── utils/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env.development
├── .env.production
├── package.json
└── vite.config.ts
```

---

## 9. Variables de entorno

### Desarrollo

```env
VITE_API_URL=http://127.0.0.1:8000
```

### Producción

```env
VITE_API_URL=https://TU-BACKEND.onrender.com
```

> No deben almacenarse secretos del backend dentro de variables `VITE_*`, ya que estas variables pueden formar parte del bundle entregado al navegador.

---

## 10. Instalación

```bash
# Instalar dependencias.
npm install

# Ejecutar el servidor de desarrollo.
npm run dev
```

Por defecto, Vite suele iniciar en:

```text
http://localhost:5173
```

---

## 11. Build de producción

```bash
# Compilar TypeScript y generar el bundle de producción.
npm run build
```

La salida de producción se genera normalmente en:

```text
dist/
```

---

## 12. Relación con los sprints del Plan Maestro

El frontend participa principalmente en:

- **Sprint 1:** layout, login, navegación y Dashboard.
- **Sprint 2:** Empresa, Sucursales, Productos, Ventas e Inventario.
- **Sprint 3:** Vectores, Matrices, Operaciones e Historial.
- **Sprint 7:** integración React + FastAPI.
- **Sprint 8:** roles, permisos y trazabilidad.
- **Sprint 9:** Dashboard y gráficos.
- **Sprint 10:** validación final y documentación.

---

## 13. Alcance respecto al Plan Maestro

La implementación mantiene el objetivo central del documento:

> Utilizar una interfaz empresarial para transformar y visualizar información de ventas e inventario, conectándola con operaciones de álgebra lineal realizadas por Python y NumPy.

Algunos elementos del Plan Maestro se consideran extensiones futuras o no se exponen como módulos independientes en la versión actual, especialmente:

- metas empresariales como módulo propio;
- exportaciones de reportes;
- administración independiente de categorías.

---

## 14. Documento de referencia

Este frontend se desarrolló tomando como referencia:

**MatrixFlow Enterprise — Plan Maestro de Desarrollo**  
Versión 1.0 — Septiembre de 2026

Fases especialmente relacionadas:

- Fase 1 — Frontend React + TypeScript
- Fase 5 — Integración
- Fase 6 — Seguridad y auditoría
- Fase 7 — Dashboard y reportes
- Fase 8 — Pruebas

---

## 15. Proyecto académico

MatrixFlow Enterprise integra:

```text
React + TypeScript
        ↓
FastAPI + Python
        ↓
NumPy
        ↓
PostgreSQL
```

El frontend representa la capa de interacción del usuario y permite visualizar tanto los procesos empresariales como los resultados matemáticos generados por el sistema.
