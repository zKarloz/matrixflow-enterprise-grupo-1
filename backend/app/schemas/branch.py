# Este archivo define los datos que la API acepta y devuelve
# cuando trabajamos con las sucursales de MatrixFlow Enterprise.

from pydantic import BaseModel


class BranchBase(BaseModel):
    """
    Datos básicos de una sucursal.
    """

    # Nombre de la sucursal.
    name: str

    # Identificador de la empresa a la que pertenece.
    company_id: int


class BranchCreate(BranchBase):
    """
    Datos necesarios para crear una sucursal.
    """

    pass


class BranchResponse(BranchBase):
    """
    Datos que la API devuelve cuando consulta una sucursal.
    """

    # Identificador único de la sucursal.
    id: int

    class Config:
        # Permite convertir objetos de SQLAlchemy
        # en respuestas compatibles con Pydantic.
        from_attributes = True