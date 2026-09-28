# Este archivo define el modelo de la tabla "products".
# Representa los productos que pueden venderse y controlarse
# mediante el inventario de MatrixFlow Enterprise.

from sqlalchemy import Column, Float, ForeignKey, Integer, String

from app.core.database import Base


class Product(Base):
    """
    Modelo SQLAlchemy correspondiente a la tabla products.
    """

    # Nombre de la tabla en PostgreSQL.
    __tablename__ = "products"

    # Identificador único del producto.
    id = Column(Integer, primary_key=True, index=True)

    # Nombre del producto.
    name = Column(String(150), nullable=False)

    # Categoría a la que pertenece el producto.
    category_id = Column(
        Integer,
        ForeignKey("categories.id"),
        nullable=True,
    )

    # Precio actual del producto.
    price = Column(Float, nullable=False)

    # Indica si el producto se encuentra activo.
    active = Column(Integer, nullable=False, default=1)