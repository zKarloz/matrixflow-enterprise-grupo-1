# ============================================================
# MatrixFlow Enterprise
# Rutas de vectores
# ============================================================
#
# Este router permite:
# - Consultar todos los vectores.
# - Consultar un vector específico.
# - Registrar nuevos vectores.
#
# Los valores de cada vector se obtienen desde la tabla
# vector_values para entregar al frontend una respuesta
# completa y consistente.
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


# ------------------------------------------------------------
# Configuración del router
# ------------------------------------------------------------

router = APIRouter(
    prefix="/vectors",
    tags=["Vectores"],
)


# ============================================================
# GET /vectors
# ============================================================

@router.get("")
def get_vectors(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Administrador", "Analista")
    ),
):
    """
    Obtiene todos los vectores registrados.

    La respuesta incluye tanto los datos principales
    como los valores numéricos de cada vector.
    """

    # Obtenemos los registros principales.
    vectors = list_vectors(db)

    # Construimos una respuesta completa para el frontend.
    response = []

    for vector in vectors:
        # Obtenemos los valores almacenados para este vector.
        _, values = get_vector(
            db,
            vector.id,
        )

        response.append(
            {
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
        )

    return response


# ============================================================
# GET /vectors/{vector_id}
# ============================================================

@router.get("/{vector_id}")
def get_vector_by_id(
    vector_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Administrador", "Analista")
    ),
):
    """
    Obtiene un vector específico junto con sus valores.
    """

    try:
        # El servicio obtiene el vector principal y
        # todos sus valores asociados.
        vector, values = get_vector(
            db,
            vector_id,
        )

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


# ============================================================
# POST /vectors
# ============================================================

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
        # Delegamos la creación al servicio.
        vector = register_vector(
            db=db,
            company_id=data.company_id,
            name=data.name,
            description=data.description,
            values=data.values,
        )

        # Devolvemos el mismo contrato que utiliza GET.
        return {
            "id": vector.id,
            "company_id": vector.company_id,
            "name": vector.name,
            "description": vector.description,
            "dimension": vector.dimension,
            "values": data.values,
        }

    except ValueError as error:
        # Los errores de validación se convierten en HTTP 400.
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )
