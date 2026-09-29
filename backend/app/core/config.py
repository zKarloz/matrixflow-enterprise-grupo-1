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

    # --------------------------------------------------------
    # Configuración de PostgreSQL
    # --------------------------------------------------------

    # La URL completa de PostgreSQL se obtiene desde .env.
    # De esta forma no exponemos usuario, contraseña ni host
    # directamente dentro del código fuente.
    DATABASE_URL: str

    # --------------------------------------------------------
    # Configuración JWT
    # --------------------------------------------------------

    # La clave utilizada para firmar los JWT se obtiene
    # exclusivamente desde el archivo .env.
    SECRET_KEY: str

    class Config:
        # Pydantic Settings leerá las variables desde .env.
        env_file = ".env"

        # Ignoramos variables adicionales que pueda contener
        # el archivo .env, como las relacionadas con Supabase.
        extra = "ignore"


# Instancia única de configuración para toda la aplicación.
settings = Settings()