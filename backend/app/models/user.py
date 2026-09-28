# Este archivo define el modelo SQLAlchemy de la tabla "users".
# La estructura debe coincidir con la BD oficial de MatrixFlow Enterprise.

from sqlalchemy import Boolean, Column, ForeignKey, Integer, String

from app.core.database import Base


class User(Base):
    """
    Modelo SQLAlchemy correspondiente a la tabla users.
    """

    # Nombre real de la tabla en PostgreSQL/Supabase.
    __tablename__ = "users"

    # Identificador único del usuario.
    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # Nombre de usuario único dentro del sistema.
    username = Column(
        String(100),
        unique=True,
        nullable=False,
    )

    # Correo electrónico utilizado para iniciar sesión.
    email = Column(
        String(150),
        unique=True,
        nullable=False,
        index=True,
    )

    # Contraseña almacenada como HASH seguro.
    #
    # IMPORTANTE:
    # Aunque la columna de la BD se llama "password",
    # aquí nunca debemos guardar la contraseña en texto plano.
    password = Column(
        String(255),
        nullable=False,
    )

    # Nombre completo que se mostrará en el sistema.
    full_name = Column(
        String(150),
        nullable=False,
    )

    # Indica si el usuario está habilitado para iniciar sesión.
    is_active = Column(
        Boolean,
        nullable=False,
        default=True,
    )

    # Identificador del rol asociado al usuario.
    #
    # La clave foránea apunta a:
    # roles.id
    role_id = Column(
        Integer,
        ForeignKey("roles.id"),
        nullable=False,
    )