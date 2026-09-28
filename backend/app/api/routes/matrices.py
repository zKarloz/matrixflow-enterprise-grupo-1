# Este archivo contiene los endpoints relacionados con matrices.
# Permite registrar y consultar matrices utilizadas por MatrixFlow.

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.matrix import MatrixCreate
from app.services.matrix_service import (
    get_matrix,
    list_matrices,
    register_matrix,
)

# Router del módulo de matrices.
router = APIRouter(
    prefix="/matrices",
    tags=["Matrices"],
)


@router.get("")
def get_matrices(
    db: Session = Depends(get_db),
):
    """
    Obtiene todas las matrices.
    """

    return list_matrices(db)


@router.get("/{matrix_id}")
def get_matrix_by_id(
    matrix_id: int,
    db: Session = Depends(get_db),
):
    """
    Obtiene una matriz y sus valores.
    """

    try:
        matrix, values = get_matrix(
            db,
            matrix_id,
        )

        # Reconstruimos la matriz a partir de sus valores.
        result = {}

        for item in values:
            result.setdefault(
                item.row_index,
                {},
            )

            result[
                item.row_index
            ][item.column_index] = item.value

        # Ordenamos las filas y columnas para reconstruir
        # la estructura original.
        matrix_values = []

        for row_index in sorted(result):
            row = []

            for column_index in sorted(
                result[row_index]
            ):
                row.append(
                    result[row_index][column_index]
                )

            matrix_values.append(row)

        return {
            "id": matrix.id,
            "name": matrix.name,
            "values": matrix_values,
        }

    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        )


@router.post("")
def create_matrix(
    data: MatrixCreate,
    db: Session = Depends(get_db),
):
    """
    Registra una nueva matriz.
    """

    try:
        matrix = register_matrix(
            db=db,
            name=data.name,
            values=data.values,
        )

        return {
            "id": matrix.id,
            "name": matrix.name,
            "values": data.values,
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )