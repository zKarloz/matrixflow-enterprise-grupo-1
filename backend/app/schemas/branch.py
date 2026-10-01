# ============================================================
# MatrixFlow Enterprise
# Schemas de sucursales
# ============================================================
#
# Define los datos que FastAPI recibe y devuelve para
# las operaciones relacionadas con sucursales.
# ============================================================

from pydantic import BaseModel


class BranchBase(BaseModel):
    """
    Datos comunes utilizados al registrar una sucursal.
    """

    name: str
    company_id: int
    address: str | None = None
    phone: str | None = None


class BranchCreate(BranchBase):
    """
    Datos requeridos para registrar una nueva sucursal.
    """

    pass


class BranchUpdate(BaseModel):
    """
    Datos administrativos que pueden modificarse después
    de crear una sucursal.

    company_id no se modifica para conservar la coherencia
    con ventas, inventario y otros registros históricos.
    """

    name: str
    address: str | None = None
    phone: str | None = None
    is_active: bool


class BranchResponse(BranchBase):
    """
    Información pública devuelta por la API.
    """

    id: int
    is_active: bool

    class Config:
        # Permite convertir modelos SQLAlchemy directamente
        # en respuestas Pydantic.
        from_attributes = True