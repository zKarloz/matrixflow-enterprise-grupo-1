# ============================================================
# MatrixFlow Enterprise
# Modelo de productos
# ============================================================
#
# Este modelo representa la tabla "products" de PostgreSQL.
#
# Columnas reales:
# - id
# - category_id
# - name
# - description
# - sku
# - price
# - is_active
#
# PostgreSQL establece además que "sku" es UNIQUE.
# ============================================================

from sqlalchemy import Boolean, Column, ForeignKey, Integer, Numeric, String

from app.core.database import Base


class Product(Base):
    """
    Representa un producto registrado en MatrixFlow.
    """

    # Nombre exacto de la tabla en PostgreSQL.
    __tablename__ = "products"

    # Identificador único del producto.
    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # Categoría a la que pertenece el producto.
    # Relación: products.category_id -> categories.id
    category_id = Column(
        Integer,
        ForeignKey("categories.id"),
        nullable=False,
    )

    # Nombre del producto.
    name = Column(
        String(150),
        nullable=False,
    )

    # Descripción opcional del producto.
    description = Column(
        String(255),
        nullable=True,
    )

    # Código único utilizado para identificar el producto.
    # PostgreSQL lo define como VARCHAR(50) y UNIQUE.
    sku = Column(
        String(50),
        nullable=False,
        unique=True,
    )

    # Precio del producto.
    #
    # PostgreSQL utiliza NUMERIC(10,2), por lo que utilizamos
    # Numeric para conservar correctamente los valores decimales.
    price = Column(
        Numeric(10, 2),
        nullable=False,
    )

    # Indica si el producto está activo.
    is_active = Column(
        Boolean,
        nullable=False,
    )