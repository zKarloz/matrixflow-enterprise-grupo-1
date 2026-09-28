# Este archivo contiene las validaciones matemáticas de MatrixFlow Enterprise.
# Su objetivo es comprobar que los vectores y matrices tengan dimensiones
# compatibles antes de ejecutar una operación.

from typing import List

import numpy as np


def validate_vector(vector: List[float]) -> np.ndarray:
    """
    Valida que el dato recibido tenga formato de vector.

    Devuelve un arreglo NumPy de una dimensión.
    """

    # Convertimos la lista recibida en un arreglo NumPy.
    array = np.asarray(vector, dtype=float)

    # Un vector debe tener exactamente una dimensión.
    if array.ndim != 1:
        raise ValueError(
            "El dato proporcionado no tiene formato de vector."
        )

    return array


def validate_matrix(matrix: List[List[float]]) -> np.ndarray:
    """
    Valida que el dato recibido tenga formato de matriz.

    Devuelve un arreglo NumPy de dos dimensiones.
    """

    # Convertimos la lista recibida en un arreglo NumPy.
    array = np.asarray(matrix, dtype=float)

    # Una matriz debe tener exactamente dos dimensiones.
    if array.ndim != 2:
        raise ValueError(
            "El dato proporcionado no tiene formato de matriz."
        )

    return array


def validate_same_vector_dimensions(
    first: np.ndarray,
    second: np.ndarray,
) -> None:
    """
    Comprueba que dos vectores tengan la misma dimensión.
    """

    # Para sumar o restar vectores deben tener la misma cantidad
    # de elementos.
    if first.shape != second.shape:
        raise ValueError(
            "Los vectores deben tener la misma dimensión."
        )


def validate_same_matrix_dimensions(
    first: np.ndarray,
    second: np.ndarray,
) -> None:
    """
    Comprueba que dos matrices tengan las mismas dimensiones.
    """

    # Para sumar o restar matrices deben coincidir
    # tanto las filas como las columnas.
    if first.shape != second.shape:
        raise ValueError(
            "Las matrices deben tener las mismas dimensiones."
        )


def validate_matrix_multiplication(
    first: np.ndarray,
    second: np.ndarray,
) -> None:
    """
    Comprueba que dos matrices puedan multiplicarse.

    Para A × B:
    columnas de A = filas de B.
    """

    # Comprobamos la condición matemática para la multiplicación.
    if first.shape[1] != second.shape[0]:
        raise ValueError(
            "Las dimensiones no son compatibles para multiplicación de matrices."
        )