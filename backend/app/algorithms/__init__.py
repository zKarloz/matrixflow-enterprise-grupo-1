# Este archivo centraliza las operaciones matemáticas
# de MatrixFlow Enterprise.
#
# Permite importar las funciones desde app.algorithms
# sin tener que acceder directamente a cada archivo.

from app.algorithms.vector_operations import (
    sum_vector,
    subtract_vector,
    scalar_multiply,
    dot_product,
)

from app.algorithms.matrix_operations import (
    add_matrix,
    subtract_matrix,
    multiply_matrix,
    transpose_matrix,
    scalar_multiply_matrix,
)

from app.algorithms.validation import (
    validate_vector,
    validate_matrix,
    validate_same_vector_dimensions,
    validate_same_matrix_dimensions,
    validate_matrix_multiplication,
)