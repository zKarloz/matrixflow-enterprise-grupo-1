# Este archivo define los modelos de las tablas "inventory"
# e "inventory_movements".
# Permiten controlar las existencias y los movimientos del inventario.

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.sql import func

from app.core.database import Base


class Inventory(Base):
    """
    Modelo SQLAlchemy correspondiente a la tabla inventory.
    """

    # Nombre de la tabla en PostgreSQL.
    __tablename__ = "inventory"

    # Identificador único del registro de inventario.
    id = Column(Integer, primary_key=True, index=True)

    # Sucursal donde se encuentra el inventario.
    branch_id = Column(
        Integer,
        ForeignKey("branches.id"),
        nullable=False,
    )

    # Producto al que corresponde el inventario.
    product_id = Column(
        Integer,
        ForeignKey("products.id"),
        nullable=False,
    )

    # Cantidad disponible.
    quantity = Column(Integer, nullable=False, default=0)


class InventoryMovement(Base):
    """
    Modelo SQLAlchemy correspondiente a la tabla inventory_movements.
    """

    # Nombre de la tabla en PostgreSQL.
    __tablename__ = "inventory_movements"

    # Identificador único del movimiento.
    id = Column(Integer, primary_key=True, index=True)

    # Producto afectado por el movimiento.
    product_id = Column(
        Integer,
        ForeignKey("products.id"),
        nullable=False,
    )

    # Sucursal donde ocurre el movimiento.
    branch_id = Column(
        Integer,
        ForeignKey("branches.id"),
        nullable=False,
    )

    # Tipo de movimiento.
    # Por ejemplo: entrada, salida o ajuste.
    movement_type = Column(String(30), nullable=False)

    # Cantidad involucrada en el movimiento.
    quantity = Column(Integer, nullable=False)

    # Fecha y hora del movimiento.
    created_at = Column(
        DateTime,
        nullable=False,
        server_default=func.now(),
    )