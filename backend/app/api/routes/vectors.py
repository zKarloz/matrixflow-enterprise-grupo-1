# Este archivo contiene los endpoints relacionados con vectores.
# Permite registrar y consultar vectores utilizados por MatrixFlow.

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.vector import (
    VectorCreate,
    VectorResponse,
)
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
):
    """
    Obtiene todos los vectores.
    """

    return list_vectors(db)


@router.get("/{vector_id}")
def get_vector_by_id(
    vector_id: int,
    db: Session = Depends(get_db),
):
    """
    Obtiene un vector junto con sus valores.
    """

    try:
        vector, values = get_vector(
            db,
            vector_id,
        )

        return {
            "id": vector.id,
            "name": vector.name,
            "values": [
                item.value
                for item in values
            ],
        }

    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        )


@router.post("")
def create_vector(
    data: VectorCreate,
    db: Session = Depends(get_db),
):
    """
    Registra un nuevo vector.
    """

    try:
        vector = register_vector(
            db=db,
            name=data.name,
            values=data.values,
        )

        return {
            "id": vector.id,
            "name": vector.name,
            "values": data.values,
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )