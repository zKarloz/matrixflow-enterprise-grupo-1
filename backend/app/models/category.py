# ============================================================
# MatrixFlow Enterprise
# Modelo de categorías
# ============================================================
#
# Este modelo representa la tabla "categories" de PostgreSQL.
# PostgreSQL define exactamente las columnas:
#
# id
# name
# description
# is_active
#
# Además, "name" tiene una restricción UNIQUE.
# ============================================================

from sqlalchemy import Boolean, Column, Integer, String

from app.core.database import Base


class Category(Base):
    """
    Representa una categoría de productos.
    """

    # Nombre exacto de la tabla en PostgreSQL.
    __tablename__ = "categories"

    # Identificador único de la categoría.
    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # Nombre de la categoría.
    # PostgreSQL exige que sea único.
    name = Column(
        String(100),
        nullable=False,
        unique=True,
    )

    # Descripción opcional de la categoría.
    description = Column(
        String(255),
        nullable=True,
    )

    # Indica si la categoría está activa.
    is_active = Column(
        Boolean,
        nullable=False,
    )