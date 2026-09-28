# Este archivo define los datos que la API utiliza para representar
# vectores matemáticos dentro de MatrixFlow Enterprise.

from typing import List

from pydantic import BaseModel


class VectorBase(BaseModel):
    """
    Datos básicos de un vector.
    """

    # Nombre utilizado para identificar el vector.
    name: str

    # Valores numéricos que forman el vector.
    values: List[float]


class VectorCreate(VectorBase):
    """
    Datos necesarios para crear un vector.
    """

    pass


class VectorResponse(VectorBase):
    """
    Datos que la API devuelve al consultar un vector.
    """

    # Identificador único del vector.
    id: int

    class Config:
        # Permite convertir objetos SQLAlchemy
        # en respuestas Pydantic.
        from_attributes = True