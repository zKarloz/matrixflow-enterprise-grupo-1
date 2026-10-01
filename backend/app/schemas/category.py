# ============================================================
# MatrixFlow Enterprise
# Schemas de categorías
# ============================================================
#
# Define los datos que FastAPI recibe y devuelve
# para las operaciones relacionadas con categorías.
# ============================================================

from pydantic import BaseModel


class CategoryBase(BaseModel):
    """
    Datos principales de una categoría.
    """

    name: str
    description: str | None = None


class CategoryCreate(CategoryBase):
    """
    Datos utilizados para registrar una nueva categoría.
    """

    pass


class CategoryUpdate(CategoryBase):
    """
    Datos que pueden modificarse en una categoría existente.

    is_active permite activar o desactivar la categoría
    sin eliminarla físicamente de PostgreSQL.
    """

    is_active: bool


class CategoryResponse(CategoryBase):
    """
    Información de la categoría devuelta por la API.
    """

    id: int
    is_active: bool

    class Config:
        # Permite convertir modelos SQLAlchemy directamente
        # en respuestas Pydantic.
        from_attributes = True