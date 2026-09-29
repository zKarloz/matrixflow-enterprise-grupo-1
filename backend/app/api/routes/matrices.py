# ============================================================
# MatrixFlow Enterprise
# Rutas de matrices
# ============================================================
# Este archivo define los endpoints HTTP utilizados para
# crear, consultar y reconstruir matrices.
# ============================================================

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require_roles
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
    current_user=Depends(
        require_roles("Administrador", "Analista")
    ),
):
    """
    Obtiene todas las matrices registradas.
    """

    # Delegamos la consulta al servicio.
    return list_matrices(db)


@router.get("/{matrix_id}")
def get_matrix_by_id(
    matrix_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Administrador", "Analista")
    ),
):
    """
    Obtiene una matriz y reconstruye sus valores
    en una estructura bidimensional.
    """

    try:
        # Obtenemos la matriz y sus valores almacenados.
        matrix, values = get_matrix(
            db,
            matrix_id,
        )

        # Diccionario temporal utilizado para reconstruir
        # la matriz utilizando fila y columna.
        result = {}

        for item in values:

            # Creamos la fila si todavía no existe.
            result.setdefault(
                item.row,
                {},
            )

            # Guardamos el valor en su posición.
            result[item.row][item.column] = item.value

        # Lista final que representará la matriz.
        matrix_values = []

        # Recorremos las filas en orden.
        for row_index in sorted(result):

            # Creamos una fila vacía.
            row = []

            # Recorremos las columnas en orden.
            for column_index in sorted(
                result[row_index]
            ):
                row.append(
                    result[row_index][column_index]
                )

            # Agregamos la fila completa.
            matrix_values.append(row)

        # Devolvemos los datos de la matriz.
        return {
            "id": matrix.id,
            "company_id": matrix.company_id,
            "name": matrix.name,
            "description": matrix.description,
            "rows": matrix.rows,
            "columns": matrix.columns,
            "values": matrix_values,
        }

    except ValueError as error:
        # Si la matriz no existe, devolvemos HTTP 404.
        raise HTTPException(
            status_code=404,
            detail=str(error),
        )


@router.post("")
def create_matrix(
    data: MatrixCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Administrador", "Analista")
    ),
):
    """
    Registra una nueva matriz.
    """

    try:
        # Enviamos al servicio todos los datos necesarios.
        matrix = register_matrix(
            db=db,
            company_id=data.company_id,
            name=data.name,
            description=data.description,
            values=data.values,
        )

        # Devolvemos la matriz recién creada.
        return {
            "id": matrix.id,
            "company_id": matrix.company_id,
            "name": matrix.name,
            "description": matrix.description,
            "rows": matrix.rows,
            "columns": matrix.columns,
            "values": data.values,
        }

    except ValueError as error:
        # Los errores de validación del servicio
        # se convierten en respuestas HTTP 400.
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )