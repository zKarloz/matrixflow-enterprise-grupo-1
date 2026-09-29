# ============================================================
# MatrixFlow Enterprise
# Rutas de operaciones matemáticas
# ============================================================
# Este archivo define los endpoints HTTP utilizados para
# ejecutar y consultar operaciones de matrices y vectores.
#
# La ruta recibe los datos mediante Pydantic y delega toda
# la lógica matemática y de persistencia al servicio.
# ============================================================

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require_roles
from app.schemas.operation import OperationCreate
from app.services.operation_service import execute_operation


# ------------------------------------------------------------
# Configuración del router
# ------------------------------------------------------------
router = APIRouter(
    prefix="/operations",
    tags=["Operaciones"],
)


# ============================================================
# POST /operations
# ============================================================
@router.post("")
def create_operation(
    data: OperationCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Administrador", "Analista")
    ),
):
    """
    Ejecuta una operación matemática y registra su ejecución.
    """

    try:
        # Delegamos la validación, cálculo y persistencia
        # al servicio de operaciones.
        operation, result = execute_operation(
            db=db,
            company_id=data.company_id,
            operation_name=data.name,
            operation_type=data.operation_type,
            first_values=data.first_values,
            second_values=data.second_values,
            scalar=data.scalar,
            first_matrix_id=data.first_matrix_id,
            second_matrix_id=data.second_matrix_id,
            first_vector_id=data.first_vector_id,
            second_vector_id=data.second_vector_id,
            result_matrix_id=data.result_matrix_id,
            result_vector_id=data.result_vector_id,
        )

        # Devolvemos una respuesta sencilla al cliente.
        return {
            "id": operation.id,
            "company_id": operation.company_id,
            "name": operation.name,
            "operation_type": operation.operation_type,
            "result": result,
        }

    except ValueError as error:
        # Los errores de validación del servicio se convierten
        # en respuestas HTTP 400.
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


# ============================================================
# GET /operations
# ============================================================
@router.get("")
def get_operations(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Administrador", "Analista")
    ),
):
    """
    Obtiene todas las operaciones registradas.
    """

    # Importamos el repository aquí para mantener la ruta
    # sencilla y evitar lógica de persistencia en este archivo.
    from app.repositories.operation_repository import (
        get_all_operations,
    )

    # Devolvemos las operaciones almacenadas.
    return get_all_operations(db)