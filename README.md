# Matrixflow Enterprise - Semestre IV - Grupo 1

Hola, para correr el proyecto, abrirás 2 terminales de Git Bash

## Primera terminal (Para frontend)

1. Entrar a la carpeta frontend
   `cd frontend`

2. Instalar los node modules
   `npm install`

3. Correr el servidor de Vite (Para ver la página)
   `npm run dev`

## Segunda terminal (Para backend)

1. Entrar a la carpeta backend
   `cd backend`

2. Crear el entorno virtual de Python
   `python -m venv .venv`

3. Activar el entorno virtual de Python
   `source .venv/Scripts/activate`

4. Instalar librerías de requirements.txt
   `pip install -r requirements.txt`

5. Correr el servidor del backend
   `uvicorn app.main:app --reload`

## Estructura del proyecto (28/09)

```
matrixflow-enterprise-grupo-1-definitivo
├─ backend
│  ├─ alembic
│  │  ├─ env.py
│  │  ├─ README
│  │  ├─ script.py.mako
│  │  └─ versions
│  ├─ alembic.ini
│  ├─ app
│  │  ├─ algorithms
│  │  │  ├─ matrix_operations.py
│  │  │  ├─ validation.py
│  │  │  ├─ vector_operations.py
│  │  │  └─ __init__.py
│  │  ├─ api
│  │  │  └─ routes
│  │  │     ├─ audit.py
│  │  │     ├─ auth.py
│  │  │     ├─ branches.py
│  │  │     ├─ categories.py
│  │  │     ├─ companies.py
│  │  │     ├─ inventory.py
│  │  │     ├─ matrices.py
│  │  │     ├─ operations.py
│  │  │     ├─ products.py
│  │  │     ├─ reports.py
│  │  │     ├─ sales.py
│  │  │     ├─ users.py
│  │  │     ├─ vectors.py
│  │  │     └─ __init__.py
│  │  ├─ core
│  │  │  ├─ config.py
│  │  │  ├─ database.py
│  │  │  └─ security.py
│  │  ├─ main.py
│  │  ├─ models
│  │  │  ├─ audit.py
│  │  │  ├─ branch.py
│  │  │  ├─ category.py
│  │  │  ├─ company.py
│  │  │  ├─ inventory.py
│  │  │  ├─ matrix.py
│  │  │  ├─ operation.py
│  │  │  ├─ product.py
│  │  │  ├─ role.py
│  │  │  ├─ sale.py
│  │  │  ├─ target.py
│  │  │  ├─ user.py
│  │  │  ├─ vector.py
│  │  │  └─ __init__.py
│  │  ├─ repositories
│  │  │  ├─ audit_repository.py
│  │  │  ├─ branch_repository.py
│  │  │  ├─ category_repository.py
│  │  │  ├─ company_repository.py
│  │  │  ├─ inventory_repository.py
│  │  │  ├─ matrix_repository.py
│  │  │  ├─ operation_repository.py
│  │  │  ├─ product_repository.py
│  │  │  ├─ sale_repository.py
│  │  │  ├─ user_repository.py
│  │  │  ├─ vector_repository.py
│  │  │  └─ __init__.py
│  │  ├─ schemas
│  │  │  ├─ auth.py
│  │  │  ├─ branch.py
│  │  │  ├─ category.py
│  │  │  ├─ company.py
│  │  │  ├─ inventory.py
│  │  │  ├─ matrix.py
│  │  │  ├─ operation.py
│  │  │  ├─ product.py
│  │  │  ├─ report.py
│  │  │  ├─ sale.py
│  │  │  ├─ user.py
│  │  │  ├─ vector.py
│  │  │  └─ __init__.py
│  │  └─ services
│  │     ├─ audit_service.py
│  │     ├─ auth_service.py
│  │     ├─ branch_service.py
│  │     ├─ category_service.py
│  │     ├─ company_service.py
│  │     ├─ inventory_service.py
│  │     ├─ matrix_service.py
│  │     ├─ operation_service.py
│  │     ├─ product_service.py
│  │     ├─ report_service.py
│  │     ├─ sale_service.py
│  │     ├─ vector_service.py
│  │     └─ __init__.py
│  ├─ README.md
│  ├─ requirements.txt
│  ├─ schema_audit.py
│  └─ schema_constraints_audit.py
├─ docker-compose.yml
├─ frontend
│  ├─ eslint.config.js
│  ├─ index.html
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ public
│  │  ├─ favicon.svg
│  │  └─ icons.svg
│  ├─ README.md
│  ├─ src
│  │  ├─ App.css
│  │  ├─ App.tsx
│  │  ├─ components
│  │  │  ├─ auth
│  │  │  │  └─ ProtectedRoute.tsx
│  │  │  ├─ company
│  │  │  │  └─ CompanyInfoCard.tsx
│  │  │  ├─ dashboard
│  │  │  │  ├─ RecentActivity.tsx
│  │  │  │  ├─ SalesByBranchChart.tsx
│  │  │  │  ├─ SalesByProductChart.tsx
│  │  │  │  ├─ SalesChart.tsx
│  │  │  │  └─ StatCard.tsx
│  │  │  ├─ layout
│  │  │  │  ├─ Header.tsx
│  │  │  │  └─ Sidebar.tsx
│  │  │  └─ security
│  │  │     └─ PeruAccessMap.tsx
│  │  ├─ data
│  │  │  └─ peru-departments.json
│  │  ├─ index.css
│  │  ├─ main.tsx
│  │  ├─ pages
│  │  │  ├─ CombinacionesLineales.tsx
│  │  │  ├─ Configuracion.tsx
│  │  │  ├─ Dashboard.tsx
│  │  │  ├─ Empresa.tsx
│  │  │  ├─ Historial.tsx
│  │  │  ├─ Inventario.tsx
│  │  │  ├─ Login.tsx
│  │  │  ├─ Matrices.tsx
│  │  │  ├─ Operaciones.tsx
│  │  │  ├─ Productos.tsx
│  │  │  ├─ Reportes.tsx
│  │  │  ├─ Seguridad.tsx
│  │  │  ├─ Sucursales.tsx
│  │  │  ├─ Usuarios.tsx
│  │  │  ├─ Vectores.tsx
│  │  │  └─ Ventas.tsx
│  │  └─ services
│  │     └─ api.ts
│  ├─ tsconfig.app.json
│  ├─ tsconfig.json
│  ├─ tsconfig.node.json
│  ├─ vercel.json
│  ├─ vite-env.d.ts
│  └─ vite.config.ts
├─ package-lock.json
├─ package.json
└─ README.md

```
