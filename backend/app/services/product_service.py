# ============================================================
# MatrixFlow Enterprise
# Servicio de productos
# ============================================================
#
# Contiene la lógica de negocio relacionada con productos.
#
# El producto se administra en "products".
# El stock pertenece exclusivamente a "inventory".
# ============================================================

from sqlalchemy.orm import Session

from app.repositories.product_repository import (
    create_product,
    get_active_products,
    get_all_products,
    get_product_by_id,
    get_product_by_sku,
    update_product,
)


def list_products(db: Session):
    """
    Obtiene los productos junto con su categoría y stock.
    """

    rows = get_all_products(db)

    return [
        {
            "id": product.id,
            "name": product.name,
            "category_id": product.category_id,
            "category": category_name,
            "price": float(product.price),
            "sku": product.sku,
            "description": product.description,
            "is_active": product.is_active,
            "stock": int(stock),
        }
        for product, category_name, stock in rows
    ]


def list_active_products(db: Session):
    """
    Obtiene solamente los productos activos.
    """

    return get_active_products(db)


def get_product(
    db: Session,
    product_id: int,
):
    """
    Obtiene un producto mediante su identificador.
    """

    product = get_product_by_id(
        db,
        product_id,
    )

    if product is None:
        raise ValueError(
            "El producto no existe."
        )

    return product


def validate_product_data(
    db: Session,
    name: str,
    category_id: int,
    price: float,
    sku: str,
    product_id: int | None = None,
):
    """
    Valida los datos comunes de creación y edición.

    product_id se utiliza durante la edición para permitir
    conservar el mismo SKU del producto actual.
    """

    if not name or not name.strip():
        raise ValueError(
            "El nombre del producto es obligatorio."
        )

    if category_id <= 0:
        raise ValueError(
            "La categoría del producto no es válida."
        )

    if price < 0:
        raise ValueError(
            "El precio no puede ser negativo."
        )

    if not sku or not sku.strip():
        raise ValueError(
            "El SKU del producto es obligatorio."
        )

    # Comprobamos si el SKU ya pertenece a otro producto.
    product_with_sku = get_product_by_sku(
        db,
        sku.strip(),
    )

    if (
        product_with_sku is not None
        and product_with_sku.id != product_id
    ):
        raise ValueError(
            "El SKU ya está registrado en otro producto."
        )


def register_product(
    db: Session,
    name: str,
    category_id: int,
    price: float,
    sku: str,
    description: str | None = None,
):
    """
    Registra un nuevo producto.
    """

    validate_product_data(
        db=db,
        name=name,
        category_id=category_id,
        price=price,
        sku=sku,
    )

    return create_product(
        db=db,
        name=name.strip(),
        category_id=category_id,
        price=price,
        sku=sku.strip(),
        description=(
            description.strip()
            if description and description.strip()
            else None
        ),
    )


def modify_product(
    db: Session,
    product_id: int,
    name: str,
    category_id: int,
    price: float,
    sku: str,
    description: str | None,
    is_active: bool,
):
    """
    Actualiza un producto existente.
    """

    product = get_product_by_id(
        db,
        product_id,
    )

    if product is None:
        raise ValueError(
            "El producto no existe."
        )

    validate_product_data(
        db=db,
        name=name,
        category_id=category_id,
        price=price,
        sku=sku,
        product_id=product_id,
    )

    return update_product(
        db=db,
        product=product,
        name=name.strip(),
        category_id=category_id,
        price=price,
        sku=sku.strip(),
        description=(
            description.strip()
            if description and description.strip()
            else None
        ),
        is_active=is_active,
    )