# Este archivo contiene las operaciones matemáticas de vectores
# utilizadas por MatrixFlow Enterprise.
#
# Las operaciones se realizan utilizando NumPy, tal como establece
# la arquitectura técnica definida para el proyecto.

from typing import List

import numpy as np

from app.algorithms.validation import (
    validate_same_vector_dimensions,
    validate_vector,
)


def sum_vector(
    first: List[float],
    second: List[float],
) -> List[float]:
    """
    Suma dos vectores.

    Los dos vectores deben tener la misma dimensión.
    """

    # Convertimos ambos valores a vectores NumPy.
    first_array = validate_vector(first)
    second_array = validate_vector(second)

    # Verificamos que tengan la misma cantidad de elementos.
    validate_same_vector_dimensions(
        first_array,
        second_array,
    )

    # Realizamos la suma elemento por elemento.
    result = first_array + second_array

    # Convertimos el resultado nuevamente a una lista
    # para poder enviarlo fácilmente como JSON.
    return result.tolist()


def subtract_vector(
    first: List[float],
    second: List[float],
) -> List[float]:
    """
    Resta dos vectores.

    Los dos vectores deben tener la misma dimensión.
    """

    # Convertimos los datos a arreglos NumPy.
    first_array = validate_vector(first)
    second_array = validate_vector(second)

    # Validamos que las dimensiones sean iguales.
    validate_same_vector_dimensions(
        first_array,
        second_array,
    )

    # Realizamos la resta elemento por elemento.
    result = first_array - second_array

    # Convertimos el resultado a una lista.
    return result.tolist()


def scalar_multiply(
    vector: List[float],
    scalar: float,
) -> List[float]:
    """
    Multiplica un vector por un escalar.
    """

    # Convertimos el vector a NumPy.
    vector_array = validate_vector(vector)

    # Realizamos la multiplicación escalar.
    result = vector_array * scalar

    # Convertimos el resultado a una lista.
    return result.tolist()


def dot_product(
    first: List[float],
    second: List[float],
) -> float:
    """
    Calcula el producto punto de dos vectores.
    """

    # Convertimos ambos datos a vectores NumPy.
    first_array = validate_vector(first)
    second_array = validate_vector(second)

    # Para producto punto ambos vectores deben tener
    # la misma dimensión.
    validate_same_vector_dimensions(
        first_array,
        second_array,
    )

    # Calculamos el producto punto.
    result = np.dot(first_array, second_array)

    # Convertimos el resultado NumPy a float de Python.
    return float(result)