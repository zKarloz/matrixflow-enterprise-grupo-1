# ============================================================
# MatrixFlow Enterprise
# Repositorio de productos
# ============================================================
# Este archivo contiene las operaciones de persistencia
# relacionadas con la tabla "products".
#
# El stock NO se guarda en products.
# Para consultar stock utilizamos la tabla inventory.
# ============================================================

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.category import Category
from app.models.inventory import Inventory
from app.models.product import Product


def get_all_products(db: Session):
    # Obtiene todos los productos junto con:
    # - nombre de la categoría
    # - stock total disponible
    #
    # El stock se calcula sumando inventory.stock.
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
    # Busca un producto por su identificador.
    return (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )


def get_active_products(db: Session):
    # Obtiene únicamente los productos activos.
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
    # Creamos únicamente las columnas que pertenecen
    # realmente a la tabla products.
    product = Product(
        name=name,
        category_id=category_id,
        price=price,
        sku=sku,
        description=description,
        is_active=True,
    )

    # Agregamos el producto a la sesión.
    db.add(product)

    # Guardamos el registro en PostgreSQL.
    db.commit()

    # Recuperamos el ID generado.
    db.refresh(product)

    return product