# Este archivo define el modelo SQLAlchemy de la tabla "roles".
# Los roles permiten determinar los permisos de los usuarios
# dentro de MatrixFlow Enterprise.

from sqlalchemy import Column, Integer, String

from app.core.database import Base


class Role(Base):
    """
    Modelo SQLAlchemy correspondiente a la tabla roles.
    """

    # Nombre real de la tabla en PostgreSQL/Supabase.
    __tablename__ = "roles"

    # Identificador único del rol.
    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # Nombre único del rol.
    #
    # Actualmente existe en la BD:
    # "Administrador"
    name = Column(
        String(50),
        unique=True,
        nullable=False,
    )

    # Descripción opcional del rol.
    description = Column(
        String(255),
        nullable=True,
    )