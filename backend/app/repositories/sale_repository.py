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

def create_sale_with_details(
    db: Session,
    company_id: int,
    branch_id: int,
    user_id: int,
    total: float,
    details: list[dict],
):
    """
    Guarda la cabecera y todos los detalles de una venta
    dentro de una única transacción.
    """

    try:
        sale = Sale(
            company_id=company_id,
            branch_id=branch_id,
            user_id=user_id,
            total=total,
        )

        db.add(sale)

        # flush() obtiene el ID sin confirmar todavía
        # definitivamente la transacción.
        db.flush()

        sale_details = []

        for detail in details:
            sale_detail = SaleDetail(
                sale_id=sale.id,
                product_id=detail["product_id"],
                quantity=detail["quantity"],
                unit_price=detail["unit_price"],
                subtotal=detail["subtotal"],
            )

            db.add(sale_detail)
            sale_details.append(sale_detail)

        # Cabecera y detalles se confirman juntos.
        db.commit()

        db.refresh(sale)

        for detail in sale_details:
            db.refresh(detail)

        return sale, sale_details

    except Exception:
        # Si cualquier parte falla, no debe quedar
        # una venta incompleta en PostgreSQL.
        db.rollback()
        raise