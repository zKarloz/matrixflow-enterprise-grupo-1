# MatrixFlow Enterprise — Semestre IV — Grupo 1

**MatrixFlow Enterprise** es un sistema web empresarial para la gestión y análisis de **ventas, inventario, productos y sucursales**, integrando operaciones de **álgebra lineal con vectores y matrices**.

El proyecto utiliza:

- **Frontend:** React + TypeScript + Vite
- **Backend:** Python + FastAPI
- **Base de datos:** PostgreSQL / Supabase
- **Motor matemático:** NumPy
- **Autenticación:** JWT + control de acceso por roles

---

## Requisitos previos

Antes de ejecutar el proyecto debes tener instalado:

- Node.js
- npm
- Python
- Git Bash
- Acceso a una base de datos PostgreSQL

Para ejecutar el proyecto localmente se recomienda utilizar **2 terminales de Git Bash**.

---

## Primera terminal — Frontend

### 1. Entrar a la carpeta frontend

```bash
cd frontend
```

### 2. Instalar las dependencias

```bash
npm install
```

### 3. Iniciar Vite

```bash
npm run dev
```

El frontend estará disponible normalmente en:

```text
http://localhost:5173
```

---

## Segunda terminal — Backend

### 1. Entrar a la carpeta backend

```bash
cd backend
```

### 2. Crear el entorno virtual

```bash
python -m venv .venv
```

### 3. Activar el entorno virtual

```bash
source .venv/Scripts/activate
```

### 4. Instalar las dependencias

```bash
pip install -r requirements.txt
```

### 5. Configurar las variables de entorno

Crear o configurar el archivo:

```text
backend/.env
```

Variables requeridas:

```env
DATABASE_URL=TU_URL_DE_POSTGRESQL
SECRET_KEY=TU_CLAVE_SECRETA
```

> El archivo `.env` contiene información sensible y no debe subirse al repositorio.

### 6. Iniciar FastAPI

```bash
uvicorn app.main:app --reload
```

El backend estará disponible en:

```text
http://127.0.0.1:8000
```

Documentación Swagger:

```text
http://127.0.0.1:8000/docs
```

---

## Roles del sistema

MatrixFlow Enterprise utiliza tres niveles de acceso:

| Rol               | Acceso general                                                |
| ----------------- | ------------------------------------------------------------- |
| **Administrador** | Acceso completo al sistema                                    |
| **Analista**      | Ventas, inventario, análisis matemático, historial y reportes |
| **Consulta**      | Dashboard, reportes y configuración                           |

Los permisos se validan tanto en el frontend como en el backend mediante **JWT y RBAC**.

---

## Módulos principales

```text
MatrixFlow Enterprise
├── Login
├── Dashboard
├── Empresa
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

---

## Estructura general del proyecto

Actualizada al **03/10/2026**.

```text
matrixflow-enterprise-grupo-1-definitivo/
│
├── backend/
│   ├── alembic/
│   ├── app/
│   │   ├── algorithms/
│   │   ├── api/routes/
│   │   ├── core/
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   ├── alembic.ini
│   ├── requirements.txt
│   └── README.md
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── data/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   ├── vercel.json
│   └── README.md
│
├── docker-compose.yml
├── package.json
└── README.md
```

---

## Documentación adicional

Para información técnica más detallada consulta:

- [`frontend/README.md`](frontend/README.md) — interfaz, páginas, integración y módulos del frontend.
- [`backend/README.md`](backend/README.md) — FastAPI, PostgreSQL, NumPy, JWT, RBAC y endpoints.

---

## Arquitectura general

```text
Usuario
   ↓
React + TypeScript
   ↓ HTTP / JSON
FastAPI + Python
   ↓
├── Servicios empresariales
├── Seguridad JWT / RBAC
├── Motor matemático NumPy
└── PostgreSQL / Supabase
   ↓
Dashboard / Historial / Reportes
```

MatrixFlow Enterprise fue desarrollado siguiendo el **Plan Maestro de Desarrollo**, organizando el proyecto en frontend, backend, persistencia, motor matemático, integración, seguridad, reportes y pruebas.
