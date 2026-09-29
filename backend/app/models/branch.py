# ============================================================
# MatrixFlow Enterprise
# Modelo de sucursales
# ============================================================
#
# Este modelo representa la tabla "branches" de PostgreSQL.
# PostgreSQL es nuestra fuente de verdad, por lo que los campos
# deben coincidir con la estructura real de la base de datos.
# ============================================================

from sqlalchemy import Boolean, Column, ForeignKey, Integer, String

from app.core.database import Base


class Branch(Base):
    """
    Representa una sucursal perteneciente a una empresa.
    """

    # Nombre exacto de la tabla en PostgreSQL.
    __tablename__ = "branches"

    # Identificador único de la sucursal.
    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # Empresa a la que pertenece la sucursal.
    # Relación: branches.company_id -> companies.id
    company_id = Column(
        Integer,
        ForeignKey("companies.id"),
        nullable=False,
    )

    # Nombre de la sucursal.
    name = Column(
        String(150),
        nullable=False,
    )

    # Dirección física de la sucursal.
    address = Column(
        String(255),
        nullable=True,
    )

    # Número telefónico de la sucursal.
    phone = Column(
        String(30),
        nullable=True,
    )

    # Indica si la sucursal está activa.
    is_active = Column(
        Boolean,
        nullable=False,
    )