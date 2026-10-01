# ============================================================
# MatrixFlow Enterprise
# Repositorio de categorías
# ============================================================
# Este archivo contiene las operaciones de persistencia
# relacionadas con la tabla "categories".
# ============================================================

from sqlalchemy.orm import Session

from app.models.category import Category


def get_all_categories(db: Session):
    # Obtiene todas las categorías registradas.
    return db.query(Category).all()


def get_category_by_id(
    db: Session,
    category_id: int,
):
    # Busca una categoría mediante su identificador.
    return (
        db.query(Category)
        .filter(Category.id == category_id)
        .first()
    )


def get_active_categories(db: Session):
    # Obtiene únicamente las categorías activas.
    return (
        db.query(Category)
        .filter(Category.is_active == True)
        .all()
    )

def get_category_by_name(
    db: Session,
    name: str,
):
    """
    Busca una categoría mediante su nombre.

    Se utiliza para evitar nombres duplicados antes
    de intentar guardar el registro en PostgreSQL.
    """

    return (
        db.query(Category)
        .filter(Category.name == name)
        .first()
    )

def create_category(
    db: Session,
    name: str,
    description: str | None = None,
):
    # Creamos la categoría.
    #
    # is_active se establece como True porque una categoría
    # nueva debe comenzar disponible para utilizarse.
    category = Category(
        name=name,
        description=description,
        is_active=True,
    )

    # Agregamos la categoría a la sesión.
    db.add(category)

    # Guardamos el registro en PostgreSQL.
    db.commit()

    # Recuperamos el ID generado.
    db.refresh(category)

    return category

def update_category(
    db: Session,
    category: Category,
    name: str,
    description: str | None,
    is_active: bool,
):
    """
    Actualiza los datos de una categoría existente.

    La categoría no se elimina físicamente. El campo
    is_active permite activarla o desactivarla.
    """

    category.name = name
    category.description = description
    category.is_active = is_active

    db.commit()
    db.refresh(category)

    return category