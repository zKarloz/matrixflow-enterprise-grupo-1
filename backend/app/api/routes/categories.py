# ============================================================
# MatrixFlow Enterprise
# Rutas de categorías
# ============================================================
# Este archivo expone mediante FastAPI las operaciones
# relacionadas con las categorías.
# ============================================================

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require_roles

from app.schemas.category import (
    CategoryCreate,
    CategoryResponse,
    CategoryUpdate,
)

from app.services.category_service import (
    get_category,
    list_active_categories,
    list_categories,
    modify_category,
    register_category,
)


# Creamos el router de categorías.
router = APIRouter(
    prefix="/categories",
    tags=["Categorías"],
)


@router.get(
    "",
    response_model=list[CategoryResponse],
)
def get_categories(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Administrador")
    ),
):
    # Devuelve todas las categorías registradas.
    return list_categories(db)


@router.get(
    "/active",
    response_model=list[CategoryResponse],
)
def get_active_category_list(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Administrador")
    ),
):
    # Devuelve solamente las categorías activas.
    return list_active_categories(db)


@router.get(
    "/{category_id}",
    response_model=CategoryResponse,
)
def get_category_by_id(
    category_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Administrador")
    ),
):
    # Busca una categoría específica.
    try:
        return get_category(
            db,
            category_id,
        )

    # Si no existe, devolvemos HTTP 404.
    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        )


@router.post(
    "",
    response_model=CategoryResponse,
)
def create_category(
    data: CategoryCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Administrador")
    ),
):
    # Crea una nueva categoría.
    try:
        return register_category(
            db=db,
            name=data.name,
            description=data.description,
        )

    # Los errores de validación de negocio
    # se convierten en HTTP 400.
    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

# ------------------------------------------------------------
# ACTUALIZAR CATEGORÍA
# ------------------------------------------------------------

@router.patch(
    "/{category_id}",
    response_model=CategoryResponse,
)
def update_existing_category(
    category_id: int,
    data: CategoryUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Administrador")
    ),
):
    """
    Actualiza una categoría existente.

    Permite modificar:
    - nombre
    - descripción
    - estado activo/inactivo

    La categoría no se elimina físicamente para conservar
    las relaciones con productos existentes.
    """

    # Primero comprobamos que la categoría exista para
    # devolver HTTP 404 de forma clara.
    try:
        get_category(
            db,
            category_id,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        )

    # Las demás validaciones de negocio, como un nombre
    # duplicado, se consideran solicitudes inválidas.
    try:
        return modify_category(
            db=db,
            category_id=category_id,
            name=data.name,
            description=data.description,
            is_active=data.is_active,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )