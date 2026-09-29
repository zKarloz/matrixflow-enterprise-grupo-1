# ============================================================
# MatrixFlow Enterprise
# Schemas de matrices
# ============================================================
# Define los datos que la API recibe y devuelve para trabajar
# con matrices matemáticas.
# ============================================================

from typing import List

from pydantic import BaseModel


class MatrixBase(BaseModel):
    """
    Datos básicos utilizados para representar una matriz.
    """

    # Empresa propietaria de la matriz.
    # PostgreSQL exige este campo en la tabla "matrices".
    company_id: int

    # Nombre utilizado para identificar la matriz.
    name: str

    # Descripción opcional de la matriz.
    description: str | None = None

    # Valores numéricos de la matriz.
    # El servicio calculará automáticamente filas y columnas.
    values: List[List[float]]


class MatrixCreate(MatrixBase):
    """
    Datos necesarios para crear una matriz.
    """

    pass


class MatrixResponse(MatrixBase):
    """
    Datos que la API devuelve al consultar una matriz.
    """

    # Identificador único de la matriz.
    id: int

    # Cantidad de filas almacenada en PostgreSQL.
    rows: int

    # Cantidad de columnas almacenada en PostgreSQL.
    columns: int

    class Config:
        # Permite convertir objetos SQLAlchemy
        # en respuestas Pydantic.
        from_attributes = True