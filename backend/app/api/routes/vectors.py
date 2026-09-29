# ============================================================
# MatrixFlow Enterprise
# Rutas de vectores
# ============================================================
# Este archivo define los endpoints HTTP utilizados para
# crear y consultar vectores.
# ============================================================

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require_roles
from app.schemas.vector import VectorCreate
from app.services.vector_service import (
    get_vector,
    list_vectors,
    register_vector,
)


# Router del módulo de vectores.
router = APIRouter(
    prefix="/vectors",
    tags=["Vectores"],
)


@router.get("")
def get_vectors(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Administrador", "Analista")
    ),
):
    """
    Obtiene todos los vectores registrados.
    """

    # Delegamos la consulta al servicio.
    return list_vectors(db)


@router.get("/{vector_id}")
def get_vector_by_id(
    vector_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Administrador", "Analista")
    ),
):
    """
    Obtiene un vector junto con sus valores.
    """

    try:
        # Obtenemos el vector y sus valores almacenados.
        vector, values = get_vector(
            db,
            vector_id,
        )

        # Reconstruimos la lista de valores a partir
        # de los registros almacenados en vector_values.
        return {
            "id": vector.id,
            "company_id": vector.company_id,
            "name": vector.name,
            "description": vector.description,
            "dimension": vector.dimension,
            "values": [
                item.value
                for item in values
            ],
        }

    except ValueError as error:
        # Si el vector no existe, devolvemos HTTP 404.
        raise HTTPException(
            status_code=404,
            detail=str(error),
        )


@router.post("")
def create_vector(
    data: VectorCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Administrador", "Analista")
    ),
):
    """
    Registra un nuevo vector.
    """

    try:
        # Enviamos al servicio los datos recibidos.
        vector = register_vector(
            db=db,
            company_id=data.company_id,
            name=data.name,
            description=data.description,
            values=data.values,
        )

        # Devolvemos el vector recién creado.
        return {
            "id": vector.id,
            "company_id": vector.company_id,
            "name": vector.name,
            "description": vector.description,
            "dimension": vector.dimension,
            "values": data.values,
        }

    except ValueError as error:
        # Los errores de validación del servicio
        # se convierten en HTTP 400.
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )