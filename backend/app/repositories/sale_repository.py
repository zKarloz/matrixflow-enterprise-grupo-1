# Este archivo contiene las consultas relacionadas con las ventas.
# Permite registrar ventas y sus respectivos detalles.

from sqlalchemy.orm import Session

from app.models.sale import Sale, SaleDetail


def get_all_sales(db: Session):
    """
    Obtiene todas las ventas registradas.
    """

    # Consultamos todas las ventas.
    return db.query(Sale).all()


def get_sale_by_id(db: Session, sale_id: int):
    """
    Obtiene una venta mediante su identificador.
    """

    # Buscamos la venta por ID.
    return (
        db.query(Sale)
        .filter(Sale.id == sale_id)
        .first()
    )


def get_sales_by_branch(db: Session, branch_id: int):
    """
    Obtiene las ventas realizadas en una sucursal.
    """

    # Filtramos las ventas por sucursal.
    return (
        db.query(Sale)
        .filter(Sale.branch_id == branch_id)
        .all()
    )


def create_sale(
    db: Session,
    branch_id: int,
):
    """
    Crea una nueva venta.
    """

    # Creamos la venta.
    sale = Sale(
        branch_id=branch_id,
    )

    # Agregamos la venta a la sesión.
    db.add(sale)

    # Guardamos los cambios.
    db.commit()

    # Obtenemos el ID generado.
    db.refresh(sale)

    return sale


def create_sale_detail(
    db: Session,
    sale_id: int,
    product_id: int,
    quantity: int,
    unit_price: float,
):
    """
    Agrega un producto a una venta.
    """

    # Creamos el detalle de la venta.
    detail = SaleDetail(
        sale_id=sale_id,
        product_id=product_id,
        quantity=quantity,
        unit_price=unit_price,
    )

    # Agregamos el detalle.
    db.add(detail)

    # Guardamos los cambios.
    db.commit()

    # Actualizamos el objeto.
    db.refresh(detail)

    return detail