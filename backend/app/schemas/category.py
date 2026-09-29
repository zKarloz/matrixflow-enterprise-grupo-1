# ============================================================
# MatrixFlow Enterprise
# Schemas de categorías
# ============================================================
# Define los datos que la API recibe y devuelve para la tabla
# "categories".
# ============================================================

from pydantic import BaseModel


class CategoryBase(BaseModel):
    # Nombre de la categoría.
    name: str

    # Descripción opcional.
    description: str | None = None


class CategoryCreate(CategoryBase):
    # No necesita campos adicionales para crear
    # una categoría.
    pass


class CategoryResponse(CategoryBase):
    # Identificador generado por PostgreSQL.
    id: int

    # Estado de la categoría.
    is_active: bool

    class Config:
        # Permite convertir objetos SQLAlchemy
        # directamente en respuestas Pydantic.
        from_attributes = True