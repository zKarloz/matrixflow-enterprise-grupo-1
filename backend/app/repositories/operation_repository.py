# ============================================================
# MatrixFlow Enterprise
# Repository de operaciones
# ============================================================
# Este archivo contiene las consultas y operaciones de
# persistencia relacionadas con:
#
# - operations
# - operation_inputs
# - operation_results
#
# IMPORTANTE:
# La estructura sigue exactamente las columnas reales
# de PostgreSQL.
# ============================================================

from sqlalchemy.orm import Session

from app.models.operation import (
    Operation,
    OperationInput,
    OperationResult,
)


def get_all_operations(db: Session):
    """
    Obtiene todas las operaciones registradas.
    """

    # Consultamos la tabla principal de operaciones.
    return db.query(Operation).all()


def get_operation_by_id(
    db: Session,
    operation_id: int,
):
    """
    Obtiene una operación mediante su identificador.
    """

    # Buscamos la operación por su ID.
    return (
        db.query(Operation)
        .filter(Operation.id == operation_id)
        .first()
    )


def get_operation_inputs(
    db: Session,
    operation_id: int,
):
    """
    Obtiene las entradas asociadas a una operación.
    """

    # Las entradas ya no contienen position/value.
    # Se relacionan mediante matrix_id o vector_id.
    return (
        db.query(OperationInput)
        .filter(
            OperationInput.operation_id == operation_id
        )
        .all()
    )


def get_operation_results(
    db: Session,
    operation_id: int,
):
    """
    Obtiene los resultados asociados a una operación.
    """

    # Los resultados ya no contienen position/value.
    # Se relacionan mediante matrix_id o vector_id.
    return (
        db.query(OperationResult)
        .filter(
            OperationResult.operation_id == operation_id
        )
        .all()
    )


def create_operation(
    db: Session,
    company_id: int,
    name: str,
    operation_type: str,
    description: str | None = None,
):
    """
    Crea el registro principal de una operación.
    """

    # Creamos la operación utilizando únicamente
    # columnas existentes en PostgreSQL.
    operation = Operation(
        company_id=company_id,
        name=name,
        operation_type=operation_type,
        description=description,
    )

    # Agregamos el registro a la sesión.
    db.add(operation)

    # Guardamos los cambios.
    db.commit()

    # Recuperamos el ID generado por PostgreSQL.
    db.refresh(operation)

    return operation


def create_operation_input(
    db: Session,
    operation_id: int,
    input_name: str,
    input_type: str,
    matrix_id: int | None = None,
    vector_id: int | None = None,
):
    """
    Crea una entrada asociada a una operación.

    Una entrada puede apuntar a una matriz o a un vector.
    """

    # Creamos la entrada utilizando las columnas reales
    # de operation_inputs.
    operation_input = OperationInput(
        operation_id=operation_id,
        matrix_id=matrix_id,
        vector_id=vector_id,
        input_name=input_name,
        input_type=input_type,
    )

    # Guardamos la entrada.
    db.add(operation_input)

    # Confirmamos la transacción.
    db.commit()

    # Actualizamos el objeto con el ID generado.
    db.refresh(operation_input)

    return operation_input


def create_operation_result(
    db: Session,
    operation_id: int,
    matrix_id: int | None = None,
    vector_id: int | None = None,
    execution_time: float | None = None,
):
    """
    Crea un resultado asociado a una operación.

    El resultado apunta a una matriz o vector almacenado
    previamente.
    """

    # Creamos el resultado utilizando únicamente las
    # columnas existentes en operation_results.
    operation_result = OperationResult(
        operation_id=operation_id,
        matrix_id=matrix_id,
        vector_id=vector_id,
        execution_time=execution_time,
    )

    # Guardamos el resultado.
    db.add(operation_result)

    # Confirmamos la transacción.
    db.commit()

    # Recuperamos el ID generado.
    db.refresh(operation_result)

    return operation_result