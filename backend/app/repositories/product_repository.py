# Este archivo contiene las consultas relacionadas con los productos.
# Se encarga de acceder a la tabla products sin mezclar esta tarea
# con la lógica de negocio de MatrixFlow.

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.category import Category
from app.models.inventory import Inventory
from app.models.product import Product


def get_all_products(db: Session):
    """
    Obtiene todos los productos junto con su categoría
    y el stock total disponible.
    """

    # Consultamos los productos y relacionamos:
    #
    # 1. categories para obtener el nombre de la categoría.
    # 2. inventory para calcular el stock total.
    #
    # outerjoin permite que el producto aparezca incluso
    # cuando todavía no tenga registros de inventario.
    return (
        db.query(
            Product.id,
            Product.name,
            Category.name.label("category"),
            Product.price,

            # Sumamos el stock existente en todas las sucursales.
            # COALESCE convierte NULL en 0 cuando no existe inventario.
            func.coalesce(
                func.sum(Inventory.quantity),
                0,
            ).label("stock"),

            Product.active,
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
            Product.name,
            Category.name,
            Product.price,
            Product.active,
        )
        .all()
    )


def get_product_by_id(db: Session, product_id: int):
    """
    Obtiene un producto mediante su identificador.
    """

    # Buscamos el producto por su ID.
    return (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )


def get_active_products(db: Session):
    """
    Obtiene únicamente los productos activos.
    """

    # Filtramos los productos que tienen active = 1.
    return (
        db.query(Product)
        .filter(Product.active == 1)
        .all()
    )


def create_product(
    db: Session,
    name: str,
    category_id: int | None,
    price: float,
):
    """
    Crea un nuevo producto.
    """

    # Creamos el producto.
    product = Product(
        name=name,
        category_id=category_id,
        price=price,
        active=1,
    )

    # Agregamos el producto a la sesión.
    db.add(product)

    # Guardamos los cambios.
    db.commit()

    # Obtenemos el ID generado.
    db.refresh(product)

    return product