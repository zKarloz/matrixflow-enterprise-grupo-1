# Este archivo contiene la lógica de negocio relacionada con productos.
# Coordina las consultas y registros de productos.

from sqlalchemy.orm import Session

from app.repositories.product_repository import (
    create_product,
    get_active_products,
    get_all_products,
    get_product_by_id,
)


def list_products(db: Session):
    """
    Devuelve todos los productos.
    """

    # Consultamos los productos mediante el repository.
    return get_all_products(db)


def list_active_products(db: Session):
    """
    Devuelve únicamente los productos activos.
    """

    # Consultamos los productos activos.
    return get_active_products(db)


def get_product(
    db: Session,
    product_id: int,
):
    """
    Obtiene un producto por ID.
    """

    # Buscamos el producto.
    product = get_product_by_id(db, product_id)

    # Validamos que exista.
    if product is None:
        raise ValueError("El producto no existe.")

    return product


def register_product(
    db: Session,
    name: str,
    category_id: int | None,
    price: float,
):
    """
    Registra un nuevo producto.
    """

    # Validamos el nombre.
    if not name.strip():
        raise ValueError("El nombre del producto es obligatorio.")

    # Un precio negativo no tiene sentido para el registro
    # básico de productos.
    if price < 0:
        raise ValueError("El precio no puede ser negativo.")

    # Delegamos la persistencia al repository.
    return create_product(
        db=db,
        name=name,
        category_id=category_id,
        price=price,
    )