# ============================================================
# MatrixFlow Enterprise
# Schemas de ventas
# ============================================================
#
# Define los datos que la API recibe y devuelve para:
#
# - sales
# - sale_details
#
# IMPORTANTE:
# Los campos de la venta y los campos del detalle están
# separados porque pertenecen a tablas diferentes.
# ============================================================

from datetime import datetime

from pydantic import BaseModel


# ============================================================
# Venta
# ============================================================

class SaleCreate(BaseModel):
    """
    Datos necesarios para crear el encabezado de una venta.
    """

    # Empresa propietaria de la venta.
    company_id: int

    # Sucursal donde se realiza la venta.
    branch_id: int

    # Usuario que registra la venta.
    user_id: int

    # Total de la venta.
    total: float


class SaleResponse(BaseModel):
    """
    Datos que representa un registro de sales.
    """

    # Identificador de la venta.
    id: int

    # Empresa propietaria.
    company_id: int

    # Sucursal donde se realizó.
    branch_id: int

    # Usuario que registró la venta.
    user_id: int

    # Importe total.
    total: float

    # Fecha y hora de creación.
    created_at: datetime

    class Config:
        # Permite convertir objetos SQLAlchemy
        # directamente en respuestas Pydantic.
        from_attributes = True


# ============================================================
# Detalle de venta
# ============================================================

class SaleDetailCreate(BaseModel):
    """
    Datos necesarios para agregar un producto a una venta.
    """

    # Venta a la que pertenece el detalle.
    sale_id: int

    # Producto vendido.
    product_id: int

    # Cantidad vendida.
    quantity: int

    # Precio utilizado en el momento de la venta.
    unit_price: float


class SaleDetailResponse(BaseModel):
    """
    Datos que representa un registro de sale_details.
    """

    # Identificador del detalle.
    id: int

    # Venta relacionada.
    sale_id: int

    # Producto vendido.
    product_id: int

    # Cantidad vendida.
    quantity: int

    # Precio unitario.
    unit_price: float

    # Subtotal calculado.
    subtotal: float

    class Config:
        # Permite convertir objetos SQLAlchemy
        # directamente en respuestas Pydantic.
        from_attributes = True