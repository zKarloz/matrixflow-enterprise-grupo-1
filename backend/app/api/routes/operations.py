# Este archivo contiene los endpoints para ejecutar operaciones
# de vectores y matrices.
#
# La ruta recibe los datos mediante Pydantic y delega el cálculo
# al operation_service.

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.operation import (
    OperationCreate,
    OperationResponse,
)
from app.services.operation_service import execute_operation

# Router del módulo de operaciones.
router = APIRouter(
    prefix="/operations",
    tags=["Operaciones"],
)


@router.post("")
def create_operation(
    data: OperationCreate,
    db: Session = Depends(get_db),
):
    """
    Ejecuta una operación matemática.
    """

    try:
        # Delegamos la ejecución al service.
        operation, result = execute_operation(
            db=db,
            operation_type=data.operation_type,
            first_values=data.first_values,
            second_values=data.second_values,
            scalar=data.scalar,
        )

        # Devolvemos el resultado al frontend.
        return {
            "id": operation.id,
            "operation_type": operation.operation_type,
            "result": result,
        }

    except ValueError as error:
        # Los errores de validación matemática llegan aquí.
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


@router.get("")
def get_operations(
    db: Session = Depends(get_db),
):
    """
    Obtiene el historial de operaciones.
    """

    # Importamos el repository aquí para mantener esta ruta
    # sencilla y devolver las operaciones registradas.
    from app.repositories.operation_repository import (
        get_all_operations,
    )

    return get_all_operations(db)