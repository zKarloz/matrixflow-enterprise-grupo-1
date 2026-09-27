# Este archivo define los datos que la API acepta y devuelve
# cuando trabajamos con empresas en MatrixFlow Enterprise.

from pydantic import BaseModel


class CompanyBase(BaseModel):
    """
    Datos básicos de una empresa.
    """

    # Nombre de la empresa.
    name: str


class CompanyCreate(CompanyBase):
    """
    Datos necesarios para crear una empresa.
    """

    pass


class CompanyResponse(CompanyBase):
    """
    Datos que la API devuelve cuando consulta una empresa.
    """

    # Identificador único de la empresa.
    id: int

    class Config:
        # Permite convertir objetos de SQLAlchemy
        # en objetos que Pydantic pueda devolver como JSON.
        from_attributes = True