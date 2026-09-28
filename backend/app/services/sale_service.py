# Este archivo contiene la lógica de negocio relacionada con las ventas.
# Una venta se almacena como registro principal y puede tener
# uno o varios detalles de productos.

from sqlalchemy.orm import Session

from app.repositories.sale_repository import (
    create_sale,
    create_sale_detail,
    get_all_sales,
    get_sale_by_id,
    get_sales_by_branch,
)


def list_sales(db: Session):
    """
    Obtiene todas las ventas.
    """

    # Consultamos todas las ventas.
    return get_all_sales(db)


def get_sale(
    db: Session,
    sale_id: int,
):
    """
    Obtiene una venta por ID.
    """

    # Buscamos la venta.
    sale = get_sale_by_id(db, sale_id)

    # Validamos que exista.
    if sale is None:
        raise ValueError("La venta no existe.")

    return sale


def list_sales_by_branch(
    db: Session,
    branch_id: int,
):
    """
    Obtiene las ventas de una sucursal.
    """

    # Consultamos las ventas filtradas por sucursal.
    return get_sales_by_branch(
        db,
        branch_id,
    )


def register_sale(
    db: Session,
    branch_id: int,
):
    """
    Registra el encabezado de una nueva venta.
    """

    # El ID de sucursal debe ser válido.
    if branch_id <= 0:
        raise ValueError(
            "El identificador de sucursal no es válido."
        )

    # Creamos la venta.
    return create_sale(
        db=db,
        branch_id=branch_id,
    )


def register_sale_detail(
    db: Session,
    sale_id: int,
    product_id: int,
    quantity: int,
    unit_price: float,
):
    """
    Registra un producto dentro de una venta.
    """

    # La cantidad debe ser positiva.
    if quantity <= 0:
        raise ValueError(
            "La cantidad debe ser mayor que cero."
        )

    # El precio no puede ser negativo.
    if unit_price < 0:
        raise ValueError(
            "El precio unitario no puede ser negativo."
        )

    # Guardamos el detalle de la venta.
    return create_sale_detail(
        db=db,
        sale_id=sale_id,
        product_id=product_id,
        quantity=quantity,
        unit_price=unit_price,
    )