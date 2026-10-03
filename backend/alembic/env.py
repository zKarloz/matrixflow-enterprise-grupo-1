# ============================================================
# MatrixFlow Enterprise
# Configuración de Alembic
# ============================================================

from logging.config import fileConfig

from alembic import context
from sqlalchemy import pool

# Reutilizamos la configuración real de SQLAlchemy utilizada
# por FastAPI. De esta forma Alembic apunta a la misma base
# PostgreSQL / Supabase que el resto del backend.
from app.core.database import Base, engine

# ============================================================
# IMPORTAR MODELOS
# ============================================================
#
# Estos imports son necesarios para que SQLAlchemy registre
# todas las tablas dentro de Base.metadata.
#
# Aunque algunos nombres no se utilicen directamente aquí,
# Alembic necesita que los módulos hayan sido importados antes
# de ejecutar --autogenerate.
# ============================================================

from app.models import audit  # noqa: F401
from app.models import branch  # noqa: F401
from app.models import category  # noqa: F401
from app.models import company  # noqa: F401
from app.models import inventory  # noqa: F401
from app.models import matrix  # noqa: F401
from app.models import operation  # noqa: F401
from app.models import product  # noqa: F401
from app.models import role  # noqa: F401
from app.models import sale  # noqa: F401
from app.models import target  # noqa: F401
from app.models import user  # noqa: F401
from app.models import vector  # noqa: F401


# ============================================================
# CONFIGURACIÓN GENERAL
# ============================================================

# Objeto de configuración creado por Alembic.
config = context.config

# Configuramos el sistema de logs utilizando alembic.ini.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Alembic comparará PostgreSQL contra todos los modelos
# registrados dentro de Base.metadata.
target_metadata = Base.metadata


# ============================================================
# MIGRACIONES OFFLINE
# ============================================================

def run_migrations_offline() -> None:
    """
    Ejecuta migraciones sin abrir una conexión permanente.

    Utilizamos la URL del mismo engine configurado por
    MatrixFlow para evitar mantener dos configuraciones
    independientes de la base de datos.
    """

    # Ocultamos la contraseña al convertir la URL a texto
    # únicamente para evitar exponerla accidentalmente.
    url = engine.url.render_as_string(
        hide_password=False,
    )

    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={
            "paramstyle": "named",
        },

        # Permite detectar cambios de tipos de columnas.
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


# ============================================================
# MIGRACIONES ONLINE
# ============================================================

def run_migrations_online() -> None:
    """
    Ejecuta migraciones utilizando la conexión real
    configurada por MatrixFlow.
    """

    # No creamos otro engine.
    # Utilizamos exactamente el mismo engine del backend.
    connectable = engine

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,

            # Permite detectar cambios de tipos.
            compare_type=True,
        )

        with context.begin_transaction():
            context.run_migrations()


# ============================================================
# EJECUCIÓN
# ============================================================

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()