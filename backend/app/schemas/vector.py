# ============================================================
# MatrixFlow Enterprise
# Schemas de vectores
# ============================================================
#
# Define los datos que la API recibe y devuelve para trabajar
# con vectores matemáticos.
#
# Las validaciones coinciden con los límites reales definidos
# en PostgreSQL.
# ============================================================

from typing import List

from pydantic import BaseModel, Field


# ============================================================
# DATOS BASE DEL VECTOR
# ============================================================

class VectorBase(BaseModel):
    """
    Datos básicos utilizados para representar un vector.
    """

    # Empresa propietaria del vector.
    # Debe ser un identificador positivo.
    company_id: int = Field(
        gt=0,
    )

    # Nombre utilizado para identificar el vector.
    #
    # La columna vectors.name admite hasta 150 caracteres.
    name: str = Field(
        min_length=1,
        max_length=150,
    )

    # Descripción opcional del vector.
    #
    # La columna vectors.description admite hasta
    # 255 caracteres.
    description: str | None = Field(
        default=None,
        max_length=255,
    )

    # Valores numéricos que forman el vector.
    #
    # Un vector debe contener al menos un componente.
    values: List[float] = Field(
        min_length=1,
    )


# ============================================================
# CREACIÓN DE VECTOR
# ============================================================

class VectorCreate(VectorBase):
    """
    Datos necesarios para registrar un nuevo vector.
    """

    pass


# ============================================================
# RESPUESTA DE VECTOR
# ============================================================

class VectorResponse(VectorBase):
    """
    Datos que la API devuelve al consultar un vector.
    """

    # Identificador único generado por PostgreSQL.
    id: int

    # Cantidad de componentes del vector.
    dimension: int

    class Config:
        # Permite convertir objetos SQLAlchemy
        # en respuestas Pydantic.
        from_attributes = True