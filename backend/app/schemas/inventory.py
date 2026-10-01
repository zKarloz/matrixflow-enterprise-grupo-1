# ============================================================
# MatrixFlow Enterprise
# Schemas de inventario
# ============================================================
# Define los datos que la API recibe y devuelve para:
#
# - inventory
# - inventory_movements
#
# Los nombres coinciden con la estructura real de PostgreSQL.
# ============================================================

from pydantic import BaseModel


# ============================================================
# Inventario
# ============================================================

class InventoryBase(BaseModel):
    # Identificador de la sucursal.
    branch_id: int

    # Identificador del producto.
    product_id: int

    # Cantidad actual disponible.
    stock: int

    # Cantidad mínima permitida antes de considerar
    # que el producto necesita reposición.
    minimum_stock: int

    # Costo unitario opcional.
    unit_cost: float | None = None


class InventoryCreate(InventoryBase):
    # No necesita campos adicionales por ahora.
    pass

class InventoryUpdate(BaseModel):
    """
    Datos administrables de un registro de inventario.

    branch_id y product_id no se modifican porque identifican
    la combinación física producto-sucursal.
    """

    stock: int
    minimum_stock: int
    unit_cost: float | None = None

class InventoryResponse(InventoryBase):
    # Identificador único del inventario.
    id: int

    class Config:
        # Permite convertir objetos SQLAlchemy
        # directamente en respuestas Pydantic.
        from_attributes = True


# ============================================================
# Movimientos de inventario
# ============================================================

class InventoryMovementCreate(BaseModel):
    # Identificador del registro de inventory afectado.
    inventory_id: int

    # Tipo de movimiento.
    # Ejemplos: entrada, salida, ajuste.
    movement_type: str

    # Cantidad del movimiento.
    quantity: int

    # Descripción opcional del movimiento.
    description: str | None = None


class InventoryMovementResponse(InventoryMovementCreate):
    # Identificador del movimiento.
    id: int

    # Fecha de creación.
    created_at: object

    class Config:
        # Permite convertir el modelo SQLAlchemy
        # en una respuesta Pydantic.
        from_attributes = True