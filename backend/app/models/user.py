# Este archivo define el modelo de la tabla "users".
# Aquí se almacenan los usuarios que utilizan MatrixFlow Enterprise.

from sqlalchemy import Column, ForeignKey, Integer, String

from app.core.database import Base


class User(Base):
    """
    Modelo SQLAlchemy correspondiente a la tabla users.
    """

    # Nombre de la tabla en PostgreSQL.
    __tablename__ = "users"

    # Identificador único del usuario.
    id = Column(Integer, primary_key=True, index=True)

    # Nombre completo del usuario.
    name = Column(String(100), nullable=False)

    # Correo utilizado para iniciar sesión.
    email = Column(String(150), unique=True, nullable=False, index=True)

    # Contraseña almacenada de forma segura mediante hash.
    password_hash = Column(String(255), nullable=False)

    # Relación del usuario con un rol.
    role_id = Column(
        Integer,
        ForeignKey("roles.id"),
        nullable=False,
    )