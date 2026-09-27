# Este archivo contiene las consultas relacionadas con las operaciones.
# Permite guardar la operación ejecutada, sus entradas y sus resultados.

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

    # Consultamos las operaciones.
    return db.query(Operation).all()


def get_operation_by_id(
    db: Session,
    operation_id: int,
):
    """
    Obtiene una operación mediante su identificador.
    """

    # Buscamos la operación por ID.
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
    Obtiene las entradas almacenadas de una operación.
    """

    # Consultamos las entradas de la operación.
    return (
        db.query(OperationInput)
        .filter(OperationInput.operation_id == operation_id)
        .order_by(OperationInput.position)
        .all()
    )


def get_operation_results(
    db: Session,
    operation_id: int,
):
    """
    Obtiene los resultados almacenados de una operación.
    """

    # Consultamos los resultados de la operación.
    return (
        db.query(OperationResult)
        .filter(OperationResult.operation_id == operation_id)
        .order_by(OperationResult.position)
        .all()
    )


def create_operation(
    db: Session,
    operation_type: str,
    user_id: int | None = None,
):
    """
    Crea el registro principal de una operación.
    """

    # Creamos la operación indicando el tipo de cálculo realizado.
    operation = Operation(
        operation_type=operation_type,
        user_id=user_id,
    )

    # Agregamos la operación.
    db.add(operation)

    # Guardamos los cambios.
    db.commit()

    # Obtenemos el ID generado.
    db.refresh(operation)

    return operation


def create_operation_input(
    db: Session,
    operation_id: int,
    position: int,
    value: float,
):
    """
    Guarda un valor de entrada de una operación.
    """

    # Creamos la entrada.
    operation_input = OperationInput(
        operation_id=operation_id,
        position=position,
        value=value,
    )

    # Agregamos la entrada.
    db.add(operation_input)

    # Guardamos los cambios.
    db.commit()

    # Actualizamos el objeto.
    db.refresh(operation_input)

    return operation_input


def create_operation_result(
    db: Session,
    operation_id: int,
    position: int,
    value: float,
):
    """
    Guarda un valor del resultado de una operación.
    """

    # Creamos el resultado.
    operation_result = OperationResult(
        operation_id=operation_id,
        position=position,
        value=value,
    )

    # Agregamos el resultado.
    db.add(operation_result)

    # Guardamos los cambios.
    db.commit()

    # Actualizamos el objeto.
    db.refresh(operation_result)

    return operation_result