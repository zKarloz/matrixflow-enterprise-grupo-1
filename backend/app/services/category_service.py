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
    # Validamos que el nombre exista.
    if not name or not name.strip():
        raise ValueError(
            "El nombre de la categoría es obligatorio."
        )

    # Creamos la categoría mediante el repository.
    return create_category(
        db=db,
        name=name.strip(),
        description=description,
    )