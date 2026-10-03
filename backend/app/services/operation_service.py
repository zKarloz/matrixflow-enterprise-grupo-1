# ============================================================
# MatrixFlow Enterprise
# Servicio de operaciones matemáticas
# ============================================================

# Este archivo contiene la lógica de negocio para:
#
# 1. Validar la operación solicitada.
# 2. Ejecutar el cálculo utilizando los algoritmos matemáticos.
# 3. Registrar la operación.
# 4. Registrar sus matrices o vectores de entrada.
# 5. Crear y registrar automáticamente el resultado.
#
# Los algoritmos matemáticos permanecen en app/algorithms/.
# ============================================================

from time import perf_counter

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

from app.repositories.matrix_repository import (
    create_matrix,
    create_matrix_value,
    get_matrix_by_id,
    get_matrix_values,
)

from app.repositories.vector_repository import (
    create_vector,
    create_vector_value,
    get_vector_by_id,
    get_vector_values,
)

from app.repositories.operation_repository import (
    create_operation,
    create_operation_input,
    create_operation_result,
    get_all_operations,
    get_operation_inputs,
    get_operation_results,
)


# ============================================================
# Ejecutar una operación matemática
# ============================================================

def execute_operation(
    db: Session,
    company_id: int,
    operation_name: str,
    operation_type: str,
    first_values: list[list[float]],
    second_values: list[list[float]] | None = None,
    scalar: float | None = None,
    second_scalar: float | None = None,  # Segundo coeficiente para combinaciones lineales.
    first_matrix_id: int | None = None,
    second_matrix_id: int | None = None,
    first_vector_id: int | None = None,
    second_vector_id: int | None = None,
    result_matrix_id: int | None = None,
    result_vector_id: int | None = None,
):
    """
    Ejecuta una operación matemática y registra su ejecución.

    Si no se proporciona un ID para el resultado, el servicio
    crea automáticamente una matriz o vector para almacenarlo.
    """

    # --------------------------------------------------------
    # Validaciones básicas
    # --------------------------------------------------------

    # Normalizamos el tipo de operación.
    operation = operation_type.strip().lower()

    if not operation:
        raise ValueError("El tipo de operación es obligatorio.")

    if not operation_name or not operation_name.strip():
        raise ValueError("El nombre de la operación es obligatorio.")

    if company_id <= 0:
        raise ValueError("El company_id debe ser válido.")

    # --------------------------------------------------------
    # Validación de combinación lineal
    # --------------------------------------------------------

    # Una combinación lineal necesita:
    # a) Un primer vector.
    # b) Un segundo vector.
    # c) Un coeficiente para cada vector.
    if operation == "linear_combination":
        if second_values is None:
            raise ValueError(
                "La combinación lineal requiere un segundo vector."
            )

        if scalar is None or second_scalar is None:
            raise ValueError(
                "La combinación lineal requiere dos coeficientes."
            )

    # --------------------------------------------------------
    # Operaciones que necesitan dos entradas
    # --------------------------------------------------------

    operations_with_second_value = {
        "sum_vector",
        "subtract_vector",
        "dot_product",
        "linear_combination",
        "add_matrix",
        "subtract_matrix",
        "multiply_matrix",
    }

    # Validamos que exista el segundo valor cuando sea necesario.
    if (
        operation in operations_with_second_value
        and second_values is None
    ):
        raise ValueError(
            "Esta operación requiere un segundo valor."
        )

    # --------------------------------------------------------
    # Operaciones que necesitan un escalar
    # --------------------------------------------------------

    operations_with_scalar = {
        "scalar_multiply",
        "scalar_multiply_matrix",
    }

    # Validamos que exista el escalar cuando sea necesario.
    if (
        operation in operations_with_scalar
        and scalar is None
    ):
        raise ValueError(
            "Esta operación requiere un escalar."
        )

    # --------------------------------------------------------
    # Ejecutar operación matemática
    # --------------------------------------------------------

    # Iniciamos el cronómetro para medir el tiempo de ejecución.
    start_time = perf_counter()

    # --------------------------------------------------------
    # Operaciones de vectores
    # --------------------------------------------------------

    if operation == "sum_vector":
        # Sumamos los dos vectores.
        result = sum_vector(
            first_values[0],
            second_values[0],
        )

    elif operation == "subtract_vector":
        # Restamos el segundo vector al primero.
        result = subtract_vector(
            first_values[0],
            second_values[0],
        )

    elif operation == "scalar_multiply":
        # Multiplicamos el vector por un escalar.
        result = scalar_multiply(
            first_values[0],
            scalar,
        )

    elif operation == "dot_product":
        # Calculamos el producto punto.
        result = dot_product(
            first_values[0],
            second_values[0],
        )

    elif operation == "linear_combination":
        # Multiplicamos el primer vector por su coeficiente.
        first_scaled = scalar_multiply(
            first_values[0],
            scalar,
        )

        # Multiplicamos el segundo vector por su coeficiente.
        second_scaled = scalar_multiply(
            second_values[0],
            second_scalar,
        )

        # Sumamos ambos resultados para obtener:
        # aU + bV
        result = sum_vector(
            first_scaled,
            second_scaled,
        )

    # --------------------------------------------------------
    # Operaciones de matrices
    # --------------------------------------------------------

    elif operation == "add_matrix":
        # Sumamos las dos matrices.
        result = add_matrix(
            first_values,
            second_values,
        )

    elif operation == "subtract_matrix":
        # Restamos las dos matrices.
        result = subtract_matrix(
            first_values,
            second_values,
        )

    elif operation == "multiply_matrix":
        # Multiplicamos las dos matrices.
        result = multiply_matrix(
            first_values,
            second_values,
        )

    elif operation == "transpose_matrix":
        # Calculamos la matriz transpuesta.
        result = transpose_matrix(
            first_values,
        )

    elif operation == "scalar_multiply_matrix":
        # Multiplicamos la matriz por un escalar.
        result = scalar_multiply_matrix(
            first_values,
            scalar,
        )

    else:
        # Rechazamos cualquier operación que el backend
        # todavía no tenga implementada.
        raise ValueError(
            f"Operación no soportada: {operation_type}"
        )

    # Calculamos el tiempo total de ejecución matemática.
    execution_time = perf_counter() - start_time

    # --------------------------------------------------------
    # Registrar operación principal
    # --------------------------------------------------------

    # Guardamos la operación en la base de datos.
    operation_record = create_operation(
        db=db,
        company_id=company_id,
        name=operation_name.strip(),
        operation_type=operation,
        description="Operación matemática ejecutada mediante NumPy.",
    )

    # --------------------------------------------------------
    # Registrar primera entrada
    # --------------------------------------------------------

    if first_vector_id is not None:
        # Relacionamos el primer vector con la operación.
        create_operation_input(
            db=db,
            operation_id=operation_record.id,
            vector_id=first_vector_id,
            input_name="first",
            input_type="vector",
        )

    elif first_matrix_id is not None:
        # Relacionamos la primera matriz con la operación.
        create_operation_input(
            db=db,
            operation_id=operation_record.id,
            matrix_id=first_matrix_id,
            input_name="first",
            input_type="matrix",
        )

    # --------------------------------------------------------
    # Registrar segunda entrada
    # --------------------------------------------------------

    if second_vector_id is not None:
        # Relacionamos el segundo vector con la operación.
        create_operation_input(
            db=db,
            operation_id=operation_record.id,
            vector_id=second_vector_id,
            input_name="second",
            input_type="vector",
        )

    elif second_matrix_id is not None:
        # Relacionamos la segunda matriz con la operación.
        create_operation_input(
            db=db,
            operation_id=operation_record.id,
            matrix_id=second_matrix_id,
            input_name="second",
            input_type="matrix",
        )

    # --------------------------------------------------------
    # Guardar resultado
    # --------------------------------------------------------

    # --------------------------------------------------------
    # Caso 1: el resultado ya existe como matriz
    # --------------------------------------------------------

    if result_matrix_id is not None:
        # Relacionamos la matriz existente con la operación.
        create_operation_result(
            db=db,
            operation_id=operation_record.id,
            matrix_id=result_matrix_id,
            execution_time=execution_time,
        )

    # --------------------------------------------------------
    # Caso 2: el resultado ya existe como vector
    # --------------------------------------------------------

    elif result_vector_id is not None:
        # Relacionamos el vector existente con la operación.
        create_operation_result(
            db=db,
            operation_id=operation_record.id,
            vector_id=result_vector_id,
            execution_time=execution_time,
        )

    # --------------------------------------------------------
    # Caso 3: resultado escalar
    # --------------------------------------------------------

    elif isinstance(result, (int, float)):
        # Algunas operaciones, como el producto punto,
        # devuelven un único número en lugar de un vector
        # o una matriz.
        #
        # Ahora podemos persistir ese resultado directamente
        # en operation_results.scalar_value.
        create_operation_result(
            db=db,
            operation_id=operation_record.id,

            # Guardamos el valor numérico calculado.
            scalar_value=float(result),

            # Conservamos también el tiempo empleado
            # exclusivamente por el cálculo matemático.
            execution_time=execution_time,
        )

    # --------------------------------------------------------
    # Caso 4: resultado matricial
    # --------------------------------------------------------

    elif (
        isinstance(result, list)
        and result
        and isinstance(result[0], list)
    ):
        # Creamos una matriz para almacenar el resultado.
        result_matrix = create_matrix(
            db=db,
            company_id=company_id,
            name=f"Resultado - {operation_name.strip()}",
            description=(
                "Matriz generada automáticamente "
                "por una operación matemática."
            ),
            rows=len(result),
            columns=len(result[0]),
        )

        # Guardamos cada valor utilizando su posición.
        for row_index, row in enumerate(result):
            for column_index, value in enumerate(row):
                create_matrix_value(
                    db=db,
                    matrix_id=result_matrix.id,
                    row=row_index,
                    column=column_index,
                    value=value,
                )

        # Relacionamos la matriz resultado con la operación.
        create_operation_result(
            db=db,
            operation_id=operation_record.id,
            matrix_id=result_matrix.id,
            execution_time=execution_time,
        )

    # --------------------------------------------------------
    # Caso 5: resultado vectorial
    # --------------------------------------------------------

    elif isinstance(result, list):
        # Creamos un vector para almacenar el resultado.
        result_vector = create_vector(
            db=db,
            company_id=company_id,
            name=f"Resultado - {operation_name.strip()}",
            description=(
                "Vector generado automáticamente "
                "por una operación matemática."
            ),
            dimension=len(result),
        )

        # Guardamos cada componente del vector.
        for position, value in enumerate(result):
            create_vector_value(
                db=db,
                vector_id=result_vector.id,
                position=position,
                value=value,
            )

        # Relacionamos el vector resultado con la operación.
        create_operation_result(
            db=db,
            operation_id=operation_record.id,
            vector_id=result_vector.id,
            execution_time=execution_time,
        )

    # --------------------------------------------------------
    # Devolver información al endpoint
    # --------------------------------------------------------

    # El endpoint recibe tanto el registro como el resultado.
    return operation_record, result

# ============================================================
# HISTORIAL DE OPERACIONES
# ============================================================

def list_operation_history(db: Session):
    """
    Construye el historial matemático completo.

    Cada registro incluye:
    - información principal de la operación,
    - vectores o matrices utilizados como entrada,
    - resultado calculado,
    - tiempo de ejecución,
    - fecha de creación.
    """

    # Recuperamos todas las operaciones registradas.
    operations = get_all_operations(db)

    # Aquí construiremos la respuesta final para React.
    history = []

    for operation in operations:
        # ----------------------------------------------------
        # ENTRADAS
        # ----------------------------------------------------

        stored_inputs = get_operation_inputs(
            db,
            operation.id,
        )

        inputs = []

        for operation_input in stored_inputs:
            # ----------------------------------------------
            # Entrada vectorial
            # ----------------------------------------------

            if (
                operation_input.input_type == "vector"
                and operation_input.vector_id is not None
            ):
                vector = get_vector_by_id(
                    db,
                    operation_input.vector_id,
                )

                # La referencia podría haber sido eliminada
                # en el futuro, por eso comprobamos que exista.
                if vector is not None:
                    inputs.append(
                        {
                            "name": operation_input.input_name,
                            "type": "vector",
                            "id": vector.id,
                            "source_name": vector.name,
                        }
                    )

            # ----------------------------------------------
            # Entrada matricial
            # ----------------------------------------------

            elif (
                operation_input.input_type == "matrix"
                and operation_input.matrix_id is not None
            ):
                matrix = get_matrix_by_id(
                    db,
                    operation_input.matrix_id,
                )

                if matrix is not None:
                    inputs.append(
                        {
                            "name": operation_input.input_name,
                            "type": "matrix",
                            "id": matrix.id,
                            "source_name": matrix.name,
                        }
                    )

        # ----------------------------------------------------
        # RESULTADO
        # ----------------------------------------------------

        stored_results = get_operation_results(
            db,
            operation.id,
        )

        result = None
        result_type = None
        execution_time = None

        # Actualmente cada operación genera como máximo
        # un resultado principal.
        if stored_results:
            stored_result = stored_results[0]

            # Convertimos NUMERIC de PostgreSQL a float.
            if stored_result.execution_time is not None:
                execution_time = float(
                    stored_result.execution_time
                )

            # ----------------------------------------------
            # Resultado escalar
            # ----------------------------------------------

            if stored_result.scalar_value is not None:
                result_type = "scalar"

                result = float(
                    stored_result.scalar_value
                )

            # ----------------------------------------------
            # Resultado vectorial
            # ----------------------------------------------

            elif stored_result.vector_id is not None:
                result_type = "vector"

                vector = get_vector_by_id(
                    db,
                    stored_result.vector_id,
                )

                vector_values = get_vector_values(
                    db,
                    stored_result.vector_id,
                )

                result = {
                    "id": stored_result.vector_id,
                    "name": (
                        vector.name
                        if vector is not None
                        else "Vector resultado"
                    ),
                    "values": [
                        float(item.value)
                        for item in vector_values
                    ],
                }

            # ----------------------------------------------
            # Resultado matricial
            # ----------------------------------------------

            elif stored_result.matrix_id is not None:
                result_type = "matrix"

                matrix = get_matrix_by_id(
                    db,
                    stored_result.matrix_id,
                )

                matrix_values = get_matrix_values(
                    db,
                    stored_result.matrix_id,
                )

                # Reconstruimos la matriz utilizando
                # fila y columna.
                values_by_position = {}

                for item in matrix_values:
                    values_by_position.setdefault(
                        item.row,
                        {},
                    )

                    values_by_position[
                        item.row
                    ][item.column] = float(
                        item.value
                    )

                values = []

                for row_index in sorted(
                    values_by_position
                ):
                    row = []

                    for column_index in sorted(
                        values_by_position[row_index]
                    ):
                        row.append(
                            values_by_position[
                                row_index
                            ][column_index]
                        )

                    values.append(row)

                result = {
                    "id": stored_result.matrix_id,
                    "name": (
                        matrix.name
                        if matrix is not None
                        else "Matriz resultado"
                    ),
                    "values": values,
                }

        # ----------------------------------------------------
        # REGISTRO FINAL
        # ----------------------------------------------------

        history.append(
            {
                "id": operation.id,
                "company_id": operation.company_id,
                "name": operation.name,
                "operation_type": operation.operation_type,
                "description": operation.description,
                "created_at": operation.created_at,
                "inputs": inputs,
                "result_type": result_type,
                "result": result,
                "execution_time": execution_time,
            }
        )

    return history