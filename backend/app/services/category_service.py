# ============================================================
# MatrixFlow Enterprise
# Servicio de categorías
# ============================================================
# Contiene la lógica de negocio relacionada con las categorías.
#
# Las operaciones de PostgreSQL se delegan al repository.
# ============================================================

from sqlalchemy.orm import Session

from app.repositories.category_repository import (
    create_category,
    get_active_categories,
    get_all_categories,
    get_category_by_id,
    get_category_by_name,
    update_category,
)


def list_categories(db: Session):
    # Obtiene todas las categorías.
    return get_all_categories(db)


def list_active_categories(db: Session):
    # Obtiene únicamente las categorías activas.
    return get_active_categories(db)


def get_category(
    db: Session,
    category_id: int,
):
    # Busca la categoría solicitada.
    category = get_category_by_id(
        db,
        category_id,
    )

    # Si no existe, informamos al endpoint.
    if category is None:
        raise ValueError(
            "La categoría no existe."
        )

    return category


def register_category(
    db: Session,
    name: str,
    description: str | None = None,
):
    """
    Registra una nueva categoría de productos.
    """

    if not name or not name.strip():
        raise ValueError(
            "El nombre de la categoría es obligatorio."
        )

    clean_name = name.strip()

    # Evitamos que PostgreSQL tenga que rechazar directamente
    # un nombre que ya existe.
    existing_category = get_category_by_name(
        db,
        clean_name,
    )

    if existing_category is not None:
        raise ValueError(
            "Ya existe una categoría con ese nombre."
        )

    return create_category(
        db=db,
        name=clean_name,
        description=(
            description.strip()
            if description and description.strip()
            else None
        ),
    )

def modify_category(
    db: Session,
    category_id: int,
    name: str,
    description: str | None,
    is_active: bool,
):
    """
    Actualiza una categoría existente.

    Permite modificar:
    - nombre
    - descripción
    - estado activo/inactivo
    """

    # Comprobamos que la categoría exista.
    category = get_category_by_id(
        db,
        category_id,
    )

    if category is None:
        raise ValueError(
            "La categoría no existe."
        )

    # El nombre sigue siendo obligatorio al editar.
    if not name or not name.strip():
        raise ValueError(
            "El nombre de la categoría es obligatorio."
        )

    clean_name = name.strip()

    # Comprobamos si ese nombre ya pertenece
    # a otra categoría distinta.
    category_with_name = get_category_by_name(
        db,
        clean_name,
    )

    if (
        category_with_name is not None
        and category_with_name.id != category_id
    ):
        raise ValueError(
            "Ya existe una categoría con ese nombre."
        )

    return update_category(
        db=db,
        category=category,
        name=clean_name,
        description=(
            description.strip()
            if description and description.strip()
            else None
        ),
        is_active=is_active,
    )