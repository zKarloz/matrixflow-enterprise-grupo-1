# Matrixflow Enterprise - Semestre IV - Grupo 1

## Estructura del proyecto (26/09)

```
matrixflow-enterprise
├─ .env.example
├─ backend
│  ├─ alembic.ini
│  ├─ app
│  │  ├─ algorithms
│  │  ├─ api
│  │  │  └─ routes
│  │  │     ├─ auth.py
│  │  │     ├─ branches.py
│  │  │     ├─ companies.py
│  │  │     ├─ inventory.py
│  │  │     ├─ matrices.py
│  │  │     ├─ operations.py
│  │  │     ├─ products.py
│  │  │     ├─ reports.py
│  │  │     ├─ sales.py
│  │  │     ├─ users.py
│  │  │     └─ vectors.py
│  │  ├─ core
│  │  ├─ main.py
│  │  ├─ models
│  │  ├─ repositories
│  │  ├─ schemas
│  │  └─ services
│  └─ requirements.txt
├─ database
├─ docker-compose.yml
├─ docs
├─ frontend
│  ├─ dist
│  │  ├─ assets
│  │  │  ├─ index-B9d3Yobx.css
│  │  │  └─ index-CcxCOOhd.js
│  │  ├─ favicon.svg
│  │  ├─ icons.svg
│  │  └─ index.html
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
│  │  ├─ assets
│  │  │  ├─ hero.png
│  │  │  ├─ react.svg
│  │  │  └─ vite.svg
│  │  ├─ components
│  │  │  ├─ branches
│  │  │  │  └─ BranchTable.tsx
│  │  │  ├─ company
│  │  │  │  └─ CompanyInfoCard.tsx
│  │  │  ├─ dashboard
│  │  │  │  ├─ RecentActivity.tsx
│  │  │  │  ├─ SalesByBranchChart.tsx
│  │  │  │  ├─ SalesByProductChart.tsx
│  │  │  │  ├─ SalesChart.tsx
│  │  │  │  └─ StatCard.tsx
│  │  │  ├─ inventory
│  │  │  │  └─ InventoryTable.tsx
│  │  │  ├─ layout
│  │  │  │  ├─ Header.tsx
│  │  │  │  └─ Sidebar.tsx
│  │  │  ├─ products
│  │  │  │  └─ ProductTable.tsx
│  │  │  ├─ sales
│  │  │  │  └─ SalesTable.tsx
│  │  │  └─ ui
│  │  │     └─ PagePlaceholder.tsx
│  │  ├─ data
│  │  │  ├─ branches.ts
│  │  │  ├─ company.ts
│  │  │  ├─ dashboard.ts
│  │  │  ├─ history.ts
│  │  │  ├─ inventory.ts
│  │  │  ├─ products.ts
│  │  │  ├─ sales.ts
│  │  │  ├─ users.ts
│  │  │  └─ Vectores.tsx
│  │  ├─ hooks
│  │  ├─ index.css
│  │  ├─ main.tsx
│  │  ├─ pages
│  │  │  ├─ Configuracion.tsx
│  │  │  ├─ Dashboard.tsx
│  │  │  ├─ Empresa.tsx
│  │  │  ├─ Historial.tsx
│  │  │  ├─ Inventario.tsx
│  │  │  ├─ Matrices.tsx
│  │  │  ├─ Operaciones.tsx
│  │  │  ├─ Productos.tsx
│  │  │  ├─ Reportes.tsx
│  │  │  ├─ Sucursales.tsx
│  │  │  ├─ Usuarios.tsx
│  │  │  ├─ Vectores.tsx
│  │  │  └─ Ventas.tsx
│  │  ├─ schemas
│  │  ├─ services
│  │  └─ types
│  ├─ tsconfig.app.json
│  ├─ tsconfig.json
│  ├─ tsconfig.node.json
│  └─ vite.config.ts
└─ README.md

```
