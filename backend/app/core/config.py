# ============================================================
# MatrixFlow Enterprise
# Configuración general de la aplicación
# ============================================================

from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """Configuración central de MatrixFlow Enterprise."""

    APP_NAME: str = "MatrixFlow Enterprise"
    APP_VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"

    # Configuración de PostgreSQL.
    POSTGRES_USER: str = "matrixflow"
    POSTGRES_PASSWORD: str = "matrixflow"
    POSTGRES_DB: str = "matrixflow"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432

    DATABASE_URL: str = (
        "postgresql+psycopg2://"
        "matrixflow:matrixflow@localhost:5432/matrixflow"
    )

    # Clave utilizada para firmar los tokens JWT.
    SECRET_KEY: str = "matrixflow-clave-secreta-desarrollo"

    class Config:
        env_file = ".env"
        extra = "ignore"

# Instancia única de configuración para toda la aplicación.
settings = Settings()