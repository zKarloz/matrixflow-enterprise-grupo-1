# Matrixflow Enterprise - Semestre IV - Grupo 1

## Estructura del proyecto (26/09)

```
matrixflow-enterprise-grupo-1
├─ .env.example
├─ backend
│  ├─ alembic.ini
│  ├─ app
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
│  │  └─ main.py
│  └─ requirements.txt
├─ docker-compose.yml
├─ frontend
│  ├─ dist
│  │  ├─ assets
│  │  │  ├─ index-B6pYJYuy.js
│  │  │  └─ index-BYiqhIfq.css
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
│  │  ├─ components
│  │  │  ├─ company
│  │  │  │  └─ CompanyInfoCard.tsx
│  │  │  ├─ dashboard
│  │  │  │  ├─ RecentActivity.tsx
│  │  │  │  ├─ SalesByBranchChart.tsx
│  │  │  │  ├─ SalesByProductChart.tsx
│  │  │  │  ├─ SalesChart.tsx
│  │  │  │  └─ StatCard.tsx
│  │  │  └─ layout
│  │  │     ├─ Header.tsx
│  │  │     └─ Sidebar.tsx
│  │  ├─ data
│  │  │  ├─ company.ts
│  │  │  ├─ dashboard.ts
│  │  │  └─ users.ts
│  │  ├─ index.css
│  │  ├─ main.tsx
│  │  ├─ pages
│  │  │  ├─ CombinacionesLineales.tsx
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
│  │  └─ services
│  │     └─ api.ts
│  ├─ tsconfig.app.json
│  ├─ tsconfig.json
│  ├─ tsconfig.node.json
│  └─ vite.config.ts
└─ README.md

```
