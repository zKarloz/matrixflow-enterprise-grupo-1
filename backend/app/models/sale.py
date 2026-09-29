# ============================================================
# MatrixFlow Enterprise
# Modelos de ventas
# ============================================================
#
# Este archivo contiene los modelos correspondientes a:
#
# 1. sales
# 2. sale_details
#
# Ambos modelos deben coincidir con la estructura real
# definida en PostgreSQL.
# ============================================================

from sqlalchemy import Column, DateTime, ForeignKey, Integer, Numeric

from sqlalchemy.sql import func

from app.core.database import Base


class Sale(Base):
    """
    Representa una venta realizada en una sucursal.
    """

    # Nombre exacto de la tabla en PostgreSQL.
    __tablename__ = "sales"

    # Identificador único de la venta.
    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # Empresa propietaria de la venta.
    # Relación: sales.company_id -> companies.id
    company_id = Column(
        Integer,
        ForeignKey("companies.id"),
        nullable=False,
    )

    # Sucursal donde se realizó la venta.
    # Relación: sales.branch_id -> branches.id
    branch_id = Column(
        Integer,
        ForeignKey("branches.id"),
        nullable=False,
    )

    # Usuario que registró la venta.
    # Relación: sales.user_id -> users.id
    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )

    # Importe total de la venta.
    #
    # PostgreSQL utiliza NUMERIC(10,2), por lo que usamos
    # Numeric para evitar problemas de precisión con dinero.
    total = Column(
        Numeric(10, 2),
        nullable=False,
    )

    # Fecha y hora de creación de la venta.
    created_at = Column(
        DateTime,
        nullable=False,
        server_default=func.now(),
    )


class SaleDetail(Base):
    """
    Representa un producto incluido dentro de una venta.
    """

    # Nombre exacto de la tabla en PostgreSQL.
    __tablename__ = "sale_details"

    # Identificador único del detalle.
    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # Venta a la que pertenece este detalle.
    # Relación: sale_details.sale_id -> sales.id
    sale_id = Column(
        Integer,
        ForeignKey("sales.id"),
        nullable=False,
    )

    # Producto vendido.
    # Relación: sale_details.product_id -> products.id
    product_id = Column(
        Integer,
        ForeignKey("products.id"),
        nullable=False,
    )

    # Cantidad de unidades vendidas.
    quantity = Column(
        Integer,
        nullable=False,
    )

    # Precio unitario utilizado en la venta.
    #
    # Se almacena el precio utilizado en ese momento para
    # conservar el historial aunque el precio del producto cambie.
    unit_price = Column(
        Numeric(10, 2),
        nullable=False,
    )

    # Subtotal correspondiente a este detalle.
    subtotal = Column(
        Numeric(10, 2),
        nullable=False,
    )