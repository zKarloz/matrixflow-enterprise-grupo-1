# Este archivo define los datos que la API acepta y devuelve
# cuando trabajamos con el inventario de MatrixFlow Enterprise.

from pydantic import BaseModel


class InventoryBase(BaseModel):
    """
    Datos básicos del inventario de un producto en una sucursal.
    """

    # Identificador de la sucursal.
    branch_id: int

    # Identificador del producto.
    product_id: int

    # Cantidad disponible actualmente.
    quantity: int


class InventoryCreate(InventoryBase):
    """
    Datos necesarios para registrar un inventario.
    """

    pass


class InventoryResponse(InventoryBase):
    """
    Datos que la API devuelve al consultar el inventario.
    """

    # Identificador único del registro de inventario.
    id: int

    class Config:
        # Permite convertir objetos SQLAlchemy
        # en respuestas Pydantic.
        from_attributes = True