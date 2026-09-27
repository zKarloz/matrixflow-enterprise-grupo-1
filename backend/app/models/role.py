# Este archivo define el modelo de la tabla "roles".
# Los roles permiten controlar los permisos de los usuarios
# dentro de MatrixFlow Enterprise.

from sqlalchemy import Column, Integer, String

from app.core.database import Base


class Role(Base):
    """
    Modelo SQLAlchemy correspondiente a la tabla roles.
    """

    # Nombre de la tabla en PostgreSQL.
    __tablename__ = "roles"

    # Identificador único del rol.
    id = Column(Integer, primary_key=True, index=True)

    # Nombre del rol.
    # Ejemplos definidos en el proyecto: Administrador,
    # Analista y Consulta.
    name = Column(String(50), unique=True, nullable=False)