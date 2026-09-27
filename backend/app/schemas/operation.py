# Este archivo define los datos utilizados para ejecutar y devolver
# las operaciones matemáticas de vectores y matrices de MatrixFlow.

from typing import List, Optional

from pydantic import BaseModel


class OperationCreate(BaseModel):
    """
    Datos necesarios para solicitar una operación matemática.
    """

    # Tipo de operación que se desea ejecutar.
    # Ejemplos: suma, resta, multiplicación, producto punto, etc.
    operation_type: str

    # Primer conjunto de valores de la operación.
    first_values: List[List[float]]

    # Segundo conjunto de valores de la operación.
    # Puede no ser necesario en operaciones como la transpuesta.
    second_values: Optional[List[List[float]]] = None

    # Valor escalar utilizado en operaciones de multiplicación
    # por un número.
    scalar: Optional[float] = None


class OperationResponse(BaseModel):
    """
    Resultado que devuelve la API después de ejecutar una operación.
    """

    # Identificador de la operación realizada.
    id: int

    # Tipo de operación ejecutada.
    operation_type: str

    # Resultado numérico de la operación.
    result: List[List[float]]

    class Config:
        # Permite convertir objetos SQLAlchemy
        # en respuestas compatibles con Pydantic.
        from_attributes = True