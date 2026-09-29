# ============================================================
# MatrixFlow Enterprise
# Modelo de empresas
# ============================================================
#
# Este modelo representa la tabla "companies" de PostgreSQL.
#
# Columnas reales:
# - id
# - name
# - tax_id
# - address
# - phone
# - email
# - is_active
#
# PostgreSQL también establece que "tax_id" es UNIQUE.
# ============================================================

from sqlalchemy import Boolean, Column, Integer, String

from app.core.database import Base


class Company(Base):
    """
    Representa una empresa registrada en MatrixFlow.
    """

    # Nombre exacto de la tabla en PostgreSQL.
    __tablename__ = "companies"

    # Identificador único de la empresa.
    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # Nombre comercial o razón social de la empresa.
    name = Column(
        String(150),
        nullable=False,
    )

    # Identificador tributario de la empresa.
    # PostgreSQL lo define como obligatorio y único.
    tax_id = Column(
        String(20),
        nullable=False,
        unique=True,
    )

    # Dirección de la empresa.
    address = Column(
        String(255),
        nullable=True,
    )

    # Teléfono de contacto.
    phone = Column(
        String(30),
        nullable=True,
    )

    # Correo electrónico de contacto.
    email = Column(
        String(150),
        nullable=True,
    )

    # Indica si la empresa está activa.
    is_active = Column(
        Boolean,
        nullable=False,
    )