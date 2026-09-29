# ============================================================
# MatrixFlow Enterprise
# Schemas de sucursales
# ============================================================
# Define los datos que la API recibe y devuelve para branches.
# ============================================================

from pydantic import BaseModel


class BranchBase(BaseModel):
    # Nombre de la sucursal.
    name: str

    # Empresa a la que pertenece.
    company_id: int

    # Dirección opcional de la sucursal.
    address: str | None = None

    # Teléfono opcional.
    phone: str | None = None


class BranchCreate(BranchBase):
    # No requiere campos adicionales para crear una sucursal.
    pass


class BranchResponse(BranchBase):
    # Identificador generado por PostgreSQL.
    id: int

    # Indica si la sucursal está activa.
    is_active: bool

    class Config:
        # Permite convertir objetos SQLAlchemy
        # directamente en respuestas Pydantic.
        from_attributes = True