# ============================================================
# MatrixFlow Enterprise
# Schemas de vectores
# ============================================================
# Define los datos que la API recibe y devuelve para trabajar
# con vectores matemáticos.
# ============================================================

from typing import List

from pydantic import BaseModel


class VectorBase(BaseModel):
    """
    Datos básicos utilizados para representar un vector.
    """

    # Empresa propietaria del vector.
    # PostgreSQL exige este campo en la tabla "vectors".
    company_id: int

    # Nombre utilizado para identificar el vector.
    name: str

    # Descripción opcional del vector.
    description: str | None = None

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

    # Cantidad de elementos del vector.
    dimension: int

    class Config:
        # Permite convertir objetos SQLAlchemy
        # en respuestas Pydantic.
        from_attributes = True