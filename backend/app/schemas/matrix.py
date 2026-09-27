# Este archivo define los datos que la API utiliza para representar
# matrices matemáticas dentro de MatrixFlow Enterprise.

from typing import List

from pydantic import BaseModel


class MatrixBase(BaseModel):
    """
    Datos básicos de una matriz.
    """

    # Nombre utilizado para identificar la matriz.
    name: str

    # Filas y columnas que forman la matriz.
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

    class Config:
        # Permite convertir objetos SQLAlchemy
        # en respuestas Pydantic.
        from_attributes = True