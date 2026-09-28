# Este archivo define los datos que la API acepta y devuelve
# cuando trabajamos con las ventas de MatrixFlow Enterprise.

from datetime import datetime

from pydantic import BaseModel


class SaleBase(BaseModel):
    """
    Datos básicos de una venta.
    """

    # Identificador de la sucursal donde se realizó la venta.
    branch_id: int

    # Identificador del producto vendido.
    product_id: int

    # Cantidad de unidades vendidas.
    quantity: int

    # Precio aplicado por unidad en la venta.
    unit_price: float


class SaleCreate(SaleBase):
    """
    Datos necesarios para registrar una nueva venta.
    """

    pass


class SaleResponse(SaleBase):
    """
    Datos que la API devuelve después de consultar una venta.
    """

    # Identificador único de la venta.
    id: int

    # Fecha y hora en que se registró la venta.
    created_at: datetime

    class Config:
        # Permite convertir objetos de SQLAlchemy
        # en respuestas compatibles con Pydantic.
        from_attributes = True