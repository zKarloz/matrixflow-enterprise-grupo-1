# ============================================================
# MatrixFlow Enterprise
# Schemas de ventas
# ============================================================

from datetime import datetime

from pydantic import BaseModel, Field


class SaleDetailCreate(BaseModel):
    """
    Producto incluido en una nueva venta.

    El precio no lo envía React: se obtiene del producto
    registrado en PostgreSQL para evitar manipulaciones.
    """

    product_id: int = Field(gt=0)
    quantity: int = Field(gt=0)


class SaleCreate(BaseModel):
    """
    Datos necesarios para registrar una venta completa.
    """

    company_id: int = Field(gt=0)
    branch_id: int = Field(gt=0)
    user_id: int = Field(gt=0)

    # Una venta debe contener como mínimo un producto.
    details: list[SaleDetailCreate] = Field(
        min_length=1,
    )


class SaleResponse(BaseModel):
    id: int
    company_id: int
    branch_id: int
    user_id: int
    total: float
    created_at: datetime

    class Config:
        from_attributes = True


class SaleDetailResponse(BaseModel):
    id: int
    sale_id: int
    product_id: int
    quantity: int
    unit_price: float
    subtotal: float

    class Config:
        from_attributes = True


class SaleCreatedResponse(BaseModel):
    """
    Respuesta de una venta recién registrada.
    """

    sale: SaleResponse
    details: list[SaleDetailResponse]