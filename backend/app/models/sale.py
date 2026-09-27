# Este archivo define los modelos de las tablas "sales" y "sale_details".
# "sales" representa la venta y "sale_details" representa los productos
# incluidos dentro de cada venta.

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer
from sqlalchemy.sql import func

from app.core.database import Base


class Sale(Base):
    """
    Modelo SQLAlchemy correspondiente a la tabla sales.
    """

    # Nombre de la tabla en PostgreSQL.
    __tablename__ = "sales"

    # Identificador único de la venta.
    id = Column(Integer, primary_key=True, index=True)

    # Sucursal donde se realizó la venta.
    branch_id = Column(
        Integer,
        ForeignKey("branches.id"),
        nullable=False,
    )

    # Fecha y hora de registro de la venta.
    created_at = Column(
        DateTime,
        nullable=False,
        server_default=func.now(),
    )


class SaleDetail(Base):
    """
    Modelo SQLAlchemy correspondiente a la tabla sale_details.
    """

    # Nombre de la tabla en PostgreSQL.
    __tablename__ = "sale_details"

    # Identificador único del detalle.
    id = Column(Integer, primary_key=True, index=True)

    # Venta a la que pertenece este detalle.
    sale_id = Column(
        Integer,
        ForeignKey("sales.id"),
        nullable=False,
    )

    # Producto vendido.
    product_id = Column(
        Integer,
        ForeignKey("products.id"),
        nullable=False,
    )

    # Cantidad de unidades vendidas.
    quantity = Column(Integer, nullable=False)

    # Precio unitario utilizado en la venta.
    unit_price = Column(Float, nullable=False)