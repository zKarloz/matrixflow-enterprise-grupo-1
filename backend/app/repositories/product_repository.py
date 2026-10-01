# ============================================================
# MatrixFlow Enterprise
# Repositorio de productos
# ============================================================
#
# Contiene las operaciones de persistencia relacionadas con
# la tabla "products".
#
# El stock NO se modifica desde este repositorio.
# Para consultar existencias utilizamos la tabla inventory.
# ============================================================

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.category import Category
from app.models.inventory import Inventory
from app.models.product import Product


def get_all_products(db: Session):
    """
    Obtiene todos los productos junto con:
    - nombre de categoría
    - stock total disponible
    """

    return (
        db.query(
            Product,
            Category.name.label("category_name"),
            func.coalesce(
                func.sum(Inventory.stock),
                0,
            ).label("stock"),
        )
        .outerjoin(
            Category,
            Product.category_id == Category.id,
        )
        .outerjoin(
            Inventory,
            Product.id == Inventory.product_id,
        )
        .group_by(
            Product.id,
            Category.name,
        )
        .all()
    )


def get_product_by_id(
    db: Session,
    product_id: int,
):
    """
    Busca un producto por su identificador.
    """

    return (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )


def get_product_by_sku(
    db: Session,
    sku: str,
):
    """
    Busca un producto mediante su SKU único.

    Se utiliza para impedir registros duplicados antes
    de ejecutar INSERT o UPDATE.
    """

    return (
        db.query(Product)
        .filter(Product.sku == sku)
        .first()
    )


def get_active_products(db: Session):
    """
    Obtiene únicamente los productos activos.
    """

    return (
        db.query(Product)
        .filter(Product.is_active == True)
        .all()
    )


def create_product(
    db: Session,
    name: str,
    category_id: int,
    price: float,
    sku: str,
    description: str | None = None,
):
    """
    Registra un producto nuevo.

    El stock no se guarda aquí porque pertenece
    a la tabla inventory.
    """

    product = Product(
        name=name,
        category_id=category_id,
        price=price,
        sku=sku,
        description=description,
        is_active=True,
    )

    db.add(product)
    db.commit()
    db.refresh(product)

    return product


def update_product(
    db: Session,
    product: Product,
    name: str,
    category_id: int,
    price: float,
    sku: str,
    description: str | None,
    is_active: bool,
):
    """
    Actualiza la información comercial de un producto.

    El stock queda fuera de esta operación porque pertenece
    exclusivamente al módulo de inventario.
    """

    product.name = name
    product.category_id = category_id
    product.price = price
    product.sku = sku
    product.description = description
    product.is_active = is_active

    db.commit()
    db.refresh(product)

    return product