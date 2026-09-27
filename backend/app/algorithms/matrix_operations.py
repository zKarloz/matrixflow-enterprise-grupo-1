# Este archivo contiene las operaciones matemáticas de matrices
# utilizadas por MatrixFlow Enterprise.
#
# Las operaciones utilizan NumPy y validan previamente
# las dimensiones necesarias para cada cálculo.

from typing import List

import numpy as np

from app.algorithms.validation import (
    validate_matrix,
    validate_matrix_multiplication,
    validate_same_matrix_dimensions,
)


def add_matrix(
    first: List[List[float]],
    second: List[List[float]],
) -> List[List[float]]:
    """
    Suma dos matrices.

    Ambas matrices deben tener las mismas dimensiones.
    """

    # Convertimos ambas listas en matrices NumPy.
    first_array = validate_matrix(first)
    second_array = validate_matrix(second)

    # Validamos que tengan las mismas filas y columnas.
    validate_same_matrix_dimensions(
        first_array,
        second_array,
    )

    # Realizamos la suma.
    result = first_array + second_array

    # Convertimos el resultado a listas.
    return result.tolist()


def subtract_matrix(
    first: List[List[float]],
    second: List[List[float]],
) -> List[List[float]]:
    """
    Resta dos matrices.

    Ambas matrices deben tener las mismas dimensiones.
    """

    # Convertimos los datos a matrices NumPy.
    first_array = validate_matrix(first)
    second_array = validate_matrix(second)

    # Validamos las dimensiones.
    validate_same_matrix_dimensions(
        first_array,
        second_array,
    )

    # Realizamos la resta.
    result = first_array - second_array

    # Convertimos el resultado a listas.
    return result.tolist()


def multiply_matrix(
    first: List[List[float]],
    second: List[List[float]],
) -> List[List[float]]:
    """
    Multiplica dos matrices.

    Las columnas de la primera matriz deben coincidir
    con las filas de la segunda.
    """

    # Convertimos ambas matrices a NumPy.
    first_array = validate_matrix(first)
    second_array = validate_matrix(second)

    # Validamos que puedan multiplicarse.
    validate_matrix_multiplication(
        first_array,
        second_array,
    )

    # Realizamos la multiplicación matricial.
    result = np.matmul(first_array, second_array)

    # Convertimos el resultado a listas.
    return result.tolist()


def transpose_matrix(
    matrix: List[List[float]],
) -> List[List[float]]:
    """
    Calcula la matriz transpuesta.
    """

    # Convertimos la matriz a NumPy.
    matrix_array = validate_matrix(matrix)

    # Intercambiamos filas por columnas.
    result = matrix_array.T

    # Convertimos el resultado a listas.
    return result.tolist()


def scalar_multiply_matrix(
    matrix: List[List[float]],
    scalar: float,
) -> List[List[float]]:
    """
    Multiplica una matriz por un escalar.
    """

    # Convertimos la matriz a NumPy.
    matrix_array = validate_matrix(matrix)

    # Multiplicamos todos los elementos por el escalar.
    result = matrix_array * scalar

    # Convertimos el resultado a listas.
    return result.tolist()