# ============================================================
# MatrixFlow Enterprise
# Servicio de productos
# ============================================================
# Contiene la lógica de negocio relacionada con los productos.
#
# El producto se registra en "products".
# El stock se administra posteriormente mediante "inventory".
# ============================================================

from sqlalchemy.orm import Session

from app.repositories.product_repository import (
    create_product,
    get_active_products,
    get_all_products,
    get_product_by_id,
)


def list_products(db: Session):
    # Obtiene los productos junto con su categoría y stock.
    rows = get_all_products(db)

    # Transformamos el resultado del repository en
    # un formato sencillo para la API.
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
    # Obtiene solamente los productos activos.
    return get_active_products(db)


def get_product(
    db: Session,
    product_id: int,
):
    # Busca el producto solicitado.
    product = get_product_by_id(
        db,
        product_id,
    )

    # Si no existe, informamos al endpoint.
    if product is None:
        raise ValueError("El producto no existe.")

    return product


def register_product(
    db: Session,
    name: str,
    category_id: int,
    price: float,
    sku: str,
    description: str | None = None,
):
    # Validamos el nombre.
    if not name or not name.strip():
        raise ValueError(
            "El nombre del producto es obligatorio."
        )

    # Validamos la categoría.
    if category_id <= 0:
        raise ValueError(
            "La categoría del producto no es válida."
        )

    # Validamos el precio.
    if price < 0:
        raise ValueError(
            "El precio no puede ser negativo."
        )

    # Validamos el SKU.
    if not sku or not sku.strip():
        raise ValueError(
            "El SKU del producto es obligatorio."
        )

    # Creamos el producto.
    #
    # El stock no se envía aquí porque pertenece
    # a la tabla inventory.
    return create_product(
        db=db,
        name=name.strip(),
        category_id=category_id,
        price=price,
        sku=sku.strip(),
        description=description,
    )