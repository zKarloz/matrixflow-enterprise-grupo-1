# ============================================================
# MatrixFlow Enterprise
# Configuración de la base de datos
# ============================================================

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import settings


# ------------------------------------------------------------
# Motor de conexión
# ------------------------------------------------------------
# SQLAlchemy utilizará esta URL para conectarse a PostgreSQL.
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
)


# ------------------------------------------------------------
# Fábrica de sesiones
# ------------------------------------------------------------
# Cada operación con la base de datos podrá obtener una sesión
# independiente utilizando SessionLocal().
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


# ------------------------------------------------------------
# Base de los modelos
# ------------------------------------------------------------
# Todos los modelos SQLAlchemy de MatrixFlow heredarán de esta
# clase.
Base = declarative_base()


# ------------------------------------------------------------
# Dependencia para FastAPI
# ------------------------------------------------------------
def get_db():
    """
    Crea una sesión de base de datos para una petición HTTP.

    La sesión se cierra automáticamente cuando termina
    la petición.
    """

    # Creamos una nueva sesión.
    db = SessionLocal()

    try:
        # Entregamos la sesión al endpoint o servicio.
        yield db

    finally:
        # Cerramos la conexión al terminar la operación.
        db.close()