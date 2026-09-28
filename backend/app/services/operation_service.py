# Este archivo contiene la lógica de negocio para ejecutar operaciones
# matemáticas y guardar sus resultados.
#
# El PDF establece que las operaciones pasan por FastAPI, validación,
# servicios, NumPy y finalmente se almacenan en la base de datos.

from sqlalchemy.orm import Session

from app.algorithms import (
    add_matrix,
    dot_product,
    multiply_matrix,
    scalar_multiply,
    scalar_multiply_matrix,
    subtract_matrix,
    subtract_vector,
    sum_vector,
    transpose_matrix,
)

from app.repositories.operation_repository import (
    create_operation,
    create_operation_input,
    create_operation_result,
)


def execute_operation(
    db: Session,
    operation_type: str,
    first_values: list[list[float]],
    second_values: list[list[float]] | None = None,
    scalar: float | None = None,
    user_id: int | None = None,
):
    """
    Ejecuta una operación matemática y guarda su resultado.

    La operación concreta se selecciona mediante operation_type.
    """

    # Normalizamos el nombre de la operación para evitar problemas
    # con mayúsculas o espacios innecesarios.
    operation = operation_type.strip().lower()

    # Validamos que exista un tipo de operación.
    if not operation:
        raise ValueError(
            "El tipo de operación es obligatorio."
        )

    # Algunas operaciones necesitan un segundo conjunto de datos.
    operations_with_second_value = {
        "sum_vector",
        "subtract_vector",
        "dot_product",
        "add_matrix",
        "subtract_matrix",
        "multiply_matrix",
    }

    if operation in operations_with_second_value and second_values is None:
        raise ValueError(
            "Esta operación requiere un segundo valor."
        )

    # Algunas operaciones necesitan un escalar.
    operations_with_scalar = {
        "scalar_multiply",
        "scalar_multiply_matrix",
    }

    if operation in operations_with_scalar and scalar is None:
        raise ValueError(
            "Esta operación requiere un escalar."
        )

    # ---------------------------------------------------------
    # EJECUCIÓN DE OPERACIONES DE VECTORES
    # ---------------------------------------------------------

    if operation == "sum_vector":
        result = sum_vector(
            first_values[0],
            second_values[0],
        )

    elif operation == "subtract_vector":
        result = subtract_vector(
            first_values[0],
            second_values[0],
        )

    elif operation == "scalar_multiply":
        result = scalar_multiply(
            first_values[0],
            scalar,
        )

    elif operation == "dot_product":
        result = dot_product(
            first_values[0],
            second_values[0],
        )

    # ---------------------------------------------------------
    # EJECUCIÓN DE OPERACIONES DE MATRICES
    # ---------------------------------------------------------

    elif operation == "add_matrix":
        result = add_matrix(
            first_values,
            second_values,
        )

    elif operation == "subtract_matrix":
        result = subtract_matrix(
            first_values,
            second_values,
        )

    elif operation == "multiply_matrix":
        result = multiply_matrix(
            first_values,
            second_values,
        )

    elif operation == "transpose_matrix":
        result = transpose_matrix(
            first_values,
        )

    elif operation == "scalar_multiply_matrix":
        result = scalar_multiply_matrix(
            first_values,
            scalar,
        )

    else:
        raise ValueError(
            f"Operación no soportada: {operation_type}"
        )

    # Guardamos la operación ejecutada.
    operation_record = create_operation(
        db=db,
        operation_type=operation,
        user_id=user_id,
    )

    # Guardamos las entradas.
    #
    # Por ahora almacenamos los valores de entrada de forma lineal,
    # siguiendo el modelo OperationInput que ya construimos.
    position = 0

    for row in first_values:
        for value in row:
            create_operation_input(
                db=db,
                operation_id=operation_record.id,
                position=position,
                value=value,
            )

            position += 1

    # Si existe una segunda entrada, también la almacenamos.
    if second_values is not None:
        for row in second_values:
            for value in row:
                create_operation_input(
                    db=db,
                    operation_id=operation_record.id,
                    position=position,
                    value=value,
                )

                position += 1

    # Si el resultado es un escalar, lo convertimos en una lista
    # para poder guardarlo usando el mismo modelo.
    if isinstance(result, (int, float)):
        result_values = [float(result)]

    # Si el resultado es un vector, lo convertimos en una matriz
    # de una sola fila.
    elif result and isinstance(result[0], (int, float)):
        result_values = [result]

    # Si ya es una matriz, la utilizamos directamente.
    else:
        result_values = result

    # Guardamos cada valor del resultado.
    position = 0

    for row in result_values:
        for value in row:
            create_operation_result(
                db=db,
                operation_id=operation_record.id,
                position=position,
                value=value,
            )

            position += 1

    # Devolvemos tanto el registro como el resultado matemático.
    return operation_record, result