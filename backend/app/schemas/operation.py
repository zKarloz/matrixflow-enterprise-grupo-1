# ============================================================
# MatrixFlow Enterprise
# Schemas de operaciones
# ============================================================
# Define los datos que recibe y devuelve la API para ejecutar
# operaciones matemáticas.
#
# La estructura está alineada con las tablas reales:
# - operations
# - operation_inputs
# - operation_results
# ============================================================

from typing import List

from pydantic import BaseModel


# ------------------------------------------------------------
# Datos para crear una operación
# ------------------------------------------------------------
class OperationCreate(BaseModel):
    # Empresa a la que pertenece la operación.
    company_id: int

    # Nombre descriptivo de la operación.
    name: str

    # Tipo de operación matemática.
    # Ejemplos:
    # add_matrix, sum_vector, transpose_matrix, etc.
    operation_type: str

    # Primera entrada matemática.
    #
    # Para una matriz:
    # [[1, 2], [3, 4]]
    #
    # Para un vector:
    # [[1, 2, 3]]
    first_values: List[List[float]]

    # Segunda entrada, necesaria solamente para operaciones
    # que trabajan con dos matrices o dos vectores.
    second_values: List[List[float]] | None = None

    # Escalar utilizado por operaciones como:
    # scalar_multiply y scalar_multiply_matrix.
    scalar: float | None = None

    # ID de la primera matriz utilizada.
    first_matrix_id: int | None = None

    # ID de la segunda matriz utilizada.
    second_matrix_id: int | None = None

    # ID del primer vector utilizado.
    first_vector_id: int | None = None

    # ID del segundo vector utilizado.
    second_vector_id: int | None = None

    # ID de la matriz que contiene el resultado.
    result_matrix_id: int | None = None

    # ID del vector que contiene el resultado.
    result_vector_id: int | None = None


# ------------------------------------------------------------
# Respuesta de una operación
# ------------------------------------------------------------
class OperationResponse(BaseModel):
    # Identificador de la operación registrada.
    id: int

    # Empresa propietaria de la operación.
    company_id: int

    # Nombre de la operación.
    name: str

    # Tipo de operación matemática.
    operation_type: str

    # Resultado matemático calculado.
    result: object

    # Permite convertir objetos SQLAlchemy en respuestas
    # Pydantic cuando corresponda.
    class Config:
        from_attributes = True