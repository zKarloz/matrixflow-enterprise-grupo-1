

# ============================================================
# MatrixFlow Enterprise
# Punto de entrada principal del backend
# ============================================================

from fastapi import FastAPI
# Middleware necesario para permitir comunicación
# entre frontend y backend en diferentes dominios.
from fastapi.middleware.cors import CORSMiddleware

# Importamos la configuración general del proyecto.
from app.core.config import settings

# Importamos todos los routers de la API.
# Cada router contiene los endpoints de un módulo de MatrixFlow.
from app.api.routes import (
    auth_router,
    users_router,
    companies_router,
    branches_router,
    products_router,
    categories_router,
    sales_router,
    inventory_router,
    vectors_router,
    matrices_router,
    operations_router,
    reports_router,
    audit_router,
)


# ------------------------------------------------------------
# Creación de la aplicación FastAPI
# ------------------------------------------------------------

# Creamos la aplicación principal de FastAPI.
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "API backend de MatrixFlow Enterprise para gestión "
        "empresarial, operaciones y cálculo con vectores y matrices."
    ),
)

# ============================================================
# Configuración CORS
# Permite que el frontend local y el frontend desplegado
# en Vercel puedan comunicarse con la API de FastAPI.
# ============================================================

allow_origins = [
    # Frontend utilizado durante el desarrollo local.
    "http://localhost:5173",

    # Otra dirección habitual de Vite en desarrollo.
    "http://127.0.0.1:5173",

    # Frontend oficial desplegado en Vercel.
    "https://matrixflow-enterprise-grupo-1.vercel.app",
]

app.add_middleware(
    CORSMiddleware,

    # Orígenes autorizados para consumir nuestra API.
    allow_origins=allow_origins,

    # Permite credenciales y headers relacionados con autenticación.
    allow_credentials=True,

    # Permitimos los métodos HTTP utilizados por la API.
    allow_methods=["*"],

    # Permitimos los headers enviados por el frontend.
    allow_headers=["*"],
)


# ------------------------------------------------------------
# Prefijo general de la API
# ------------------------------------------------------------

API_PREFIX = settings.API_V1_PREFIX


# ------------------------------------------------------------
# Registro de los routers
# ------------------------------------------------------------

# Autenticación
app.include_router(
    auth_router,
    prefix=API_PREFIX,
)

# Usuarios
app.include_router(
    users_router,
    prefix=API_PREFIX,
)

# Empresas
app.include_router(
    companies_router,
    prefix=API_PREFIX,
)

# Sucursales
app.include_router(
    branches_router,
    prefix=API_PREFIX,
)

# Productos
app.include_router(
    products_router,
    prefix=API_PREFIX,
)

# Categorías de productos
app.include_router(
    categories_router,
    prefix=API_PREFIX,
)

# Ventas
app.include_router(
    sales_router,
    prefix=API_PREFIX,
)

# Inventario
app.include_router(
    inventory_router,
    prefix=API_PREFIX,
)

# Vectores
app.include_router(
    vectors_router,
    prefix=API_PREFIX,
)

# Matrices
app.include_router(
    matrices_router,
    prefix=API_PREFIX,
)

# Operaciones matemáticas
app.include_router(
    operations_router,
    prefix=API_PREFIX,
)

# Reportes
app.include_router(
    reports_router,
    prefix=API_PREFIX,
)

# Auditoría y seguridad
app.include_router(
    audit_router,
    prefix=API_PREFIX,
)

# ------------------------------------------------------------
# Endpoint raíz
# ------------------------------------------------------------

@app.get("/")
def root():
    """
    Endpoint inicial para comprobar que el backend funciona.
    """

    return {
        "message": "MatrixFlow Enterprise API funcionando",
        "version": settings.APP_VERSION,
    }


# ------------------------------------------------------------
# Endpoint de salud
# ------------------------------------------------------------

@app.get("/health")
def health_check():
    """
    Endpoint utilizado para comprobar el estado básico de la API.
    """

    return {
        "status": "ok",
        "service": settings.APP_NAME,
    }

