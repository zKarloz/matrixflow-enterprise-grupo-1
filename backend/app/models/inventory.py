# ============================================================
# MatrixFlow Enterprise
# Modelos de inventario
# ============================================================
#
# Este archivo contiene los modelos correspondientes a:
#
# 1. inventory
# 2. inventory_movements
#
# Ambos modelos deben coincidir con la estructura real
# de PostgreSQL.
# ============================================================

from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
)

from sqlalchemy.sql import func

from app.core.database import Base


class Inventory(Base):
    """
    Representa las existencias de un producto en una sucursal.
    """

    # Nombre exacto de la tabla en PostgreSQL.
    __tablename__ = "inventory"

    # Una sucursal solo puede tener un registro
    # de inventario por cada producto.
    __table_args__ = (
        UniqueConstraint(
            "branch_id",
            "product_id",
            name="uq_inventory_branch_product",
        ),
    )

    # Identificador único del registro de inventario.
    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # Sucursal donde se encuentra el inventario.
    # Relación: inventory.branch_id -> branches.id
    branch_id = Column(
        Integer,
        ForeignKey("branches.id"),
        nullable=False,
    )

    # Producto al que pertenece este inventario.
    # Relación: inventory.product_id -> products.id
    product_id = Column(
        Integer,
        ForeignKey("products.id"),
        nullable=False,
    )

    # Cantidad disponible actualmente.
    # PostgreSQL utiliza el nombre "stock".
    stock = Column(
        Integer,
        nullable=False,
    )

    # Cantidad mínima permitida antes de generar una alerta.
    minimum_stock = Column(
        Integer,
        nullable=False,
    )

    # Costo unitario del producto en inventario.
    #
    # PostgreSQL utiliza NUMERIC(10,2), por lo que usamos
    # Numeric en lugar de Float para conservar precisión decimal.
    unit_cost = Column(
        Numeric(10, 2),
        nullable=True,
    )


class InventoryMovement(Base):
    """
    Representa un movimiento realizado sobre un inventario.
    """

    # Nombre exacto de la tabla en PostgreSQL.
    __tablename__ = "inventory_movements"

    # Identificador único del movimiento.
    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # Inventario sobre el cual se realizó el movimiento.
    # Relación: inventory_movements.inventory_id -> inventory.id
    inventory_id = Column(
        Integer,
        ForeignKey("inventory.id"),
        nullable=False,
    )

    # Tipo de movimiento.
    # Ejemplos: entrada, salida, ajuste, etc.
    movement_type = Column(
        String(30),
        nullable=False,
    )

    # Cantidad afectada por el movimiento.
    quantity = Column(
        Integer,
        nullable=False,
    )

    # Descripción opcional del movimiento.
    description = Column(
        String(255),
        nullable=True,
    )

    # Fecha y hora en que se registró el movimiento.
    #
    # PostgreSQL genera este valor automáticamente cuando
    # no se proporciona uno.
    created_at = Column(
        DateTime,
        nullable=False,
        server_default=func.now(),
    )