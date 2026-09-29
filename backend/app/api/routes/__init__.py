# Este archivo centraliza los routers de MatrixFlow Enterprise.
# El main.py podrá importar todos los routers desde este archivo.

from app.api.routes.auth import router as auth_router
from app.api.routes.users import router as users_router
from app.api.routes.companies import router as companies_router
from app.api.routes.branches import router as branches_router
from app.api.routes.products import router as products_router
from app.api.routes.sales import router as sales_router
from app.api.routes.inventory import router as inventory_router
from app.api.routes.vectors import router as vectors_router
from app.api.routes.matrices import router as matrices_router
from app.api.routes.operations import router as operations_router
from app.api.routes.reports import router as reports_router

# Ruta para consultar los registros de auditoría.
from app.api.routes.audit import router as audit_router

# Ruta para gestionar las categorías de productos.
from app.api.routes.categories import router as categories_router