# ============================================================
# MatrixFlow Enterprise
# Repository de ventas
# ============================================================
#
# Este archivo contiene las operaciones de acceso a:
#
# - sales
# - sale_details
#
# Los campos utilizados deben coincidir con PostgreSQL.
# ============================================================

from sqlalchemy.orm import Session

from app.models.sale import Sale, SaleDetail


def get_all_sales(db: Session):
    """
    Obtiene todas las ventas registradas.
    """

    # Consultamos todos los encabezados de venta.
    return db.query(Sale).all()


def get_sale_by_id(
    db: Session,
    sale_id: int,
):
    """
    Obtiene una venta mediante su identificador.
    """

    # Buscamos la venta por su clave primaria.
    return (
        db.query(Sale)
        .filter(Sale.id == sale_id)
        .first()
    )


def get_sales_by_branch(
    db: Session,
    branch_id: int,
):
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
    company_id: int,
    branch_id: int,
    user_id: int,
    total: float,
):
    """
    Crea el encabezado de una venta.

    Estos campos corresponden directamente a la tabla
    sales de PostgreSQL.
    """

    # Creamos la venta con todos los campos obligatorios.
    sale = Sale(
        company_id=company_id,
        branch_id=branch_id,
        user_id=user_id,
        total=total,
    )

    # Agregamos el objeto a la sesión.
    db.add(sale)

    # Guardamos el registro en PostgreSQL.
    db.commit()

    # Recuperamos el ID generado.
    db.refresh(sale)

    return sale


def create_sale_detail(
    db: Session,
    sale_id: int,
    product_id: int,
    quantity: int,
    unit_price: float,
    subtotal: float,
):
    """
    Agrega un producto a una venta.

    PostgreSQL requiere:
    sale_id, product_id, quantity, unit_price y subtotal.
    """

    # Creamos el detalle completo de la venta.
    detail = SaleDetail(
        sale_id=sale_id,
        product_id=product_id,
        quantity=quantity,
        unit_price=unit_price,
        subtotal=subtotal,
    )

    # Agregamos el detalle a la sesión.
    db.add(detail)

    # Guardamos el registro.
    db.commit()

    # Recuperamos el ID generado.
    db.refresh(detail)

    return detail