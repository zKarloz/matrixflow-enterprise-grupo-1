# ============================================================
# MatrixFlow Enterprise
# Schemas de productos
# ============================================================
#
# Define los datos que la API recibe y devuelve para products.
#
# IMPORTANTE:
# El stock pertenece a inventory y nunca se modifica desde
# los schemas del catálogo de productos.
# ============================================================

from pydantic import BaseModel


class ProductBase(BaseModel):
    """
    Datos principales del catálogo de productos.
    """

    name: str
    category_id: int
    price: float
    sku: str
    description: str | None = None


class ProductCreate(ProductBase):
    """
    Datos utilizados para registrar un producto.
    """

    pass


class ProductUpdate(ProductBase):
    """
    Datos que pueden modificarse en un producto existente.

    is_active también forma parte de la actualización para
    permitir activar o desactivar productos sin eliminarlos.
    """

    is_active: bool


class ProductResponse(ProductBase):
    """
    Información del producto devuelta por la API.
    """

    id: int
    is_active: bool

    class Config:
        # Permite convertir modelos SQLAlchemy directamente
        # en respuestas Pydantic.
        from_attributes = True