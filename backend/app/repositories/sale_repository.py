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

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.branch import Branch
from app.models.product import Product
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

# ============================================================
# CONSULTAS ANALÍTICAS PARA DASHBOARD
# ============================================================


def get_sales_summary_by_branch(
    db: Session,
):
    """
    Obtiene el importe total vendido por cada sucursal.

    La consulta relaciona:
        sales.branch_id -> branches.id

    De esta manera el frontend recibe el nombre real de
    la sucursal y no necesita mostrar solamente su ID.
    """

    return (
        db.query(
            Branch.id.label("branch_id"),
            Branch.name.label("branch_name"),
            func.sum(Sale.total).label("total"),
        )
        .join(
            Sale,
            Sale.branch_id == Branch.id,
        )
        .group_by(
            Branch.id,
            Branch.name,
        )
        .order_by(
            Branch.name,
        )
        .all()
    )


def get_sales_summary_by_product(
    db: Session,
):
    """
    Obtiene las ventas acumuladas por producto.

    La consulta relaciona:
        sale_details.product_id -> products.id

    Devuelve tanto las unidades vendidas como el importe
    acumulado correspondiente a cada producto.
    """

    return (
        db.query(
            Product.id.label("product_id"),
            Product.name.label("product_name"),
            func.sum(
                SaleDetail.quantity
            ).label("quantity"),
            func.sum(
                SaleDetail.subtotal
            ).label("total"),
        )
        .join(
            SaleDetail,
            SaleDetail.product_id == Product.id,
        )
        .group_by(
            Product.id,
            Product.name,
        )
        .order_by(
            func.sum(
                SaleDetail.subtotal
            ).desc(),
        )
        .all()
    )


def get_recent_sales_with_branch(
    db: Session,
    limit: int = 5,
):
    """
    Obtiene las ventas más recientes junto con el
    nombre real de la sucursal correspondiente.
    """

    return (
        db.query(
            Sale.id.label("sale_id"),
            Sale.total.label("total"),
            Sale.created_at.label("created_at"),
            Branch.id.label("branch_id"),
            Branch.name.label("branch_name"),
        )
        .join(
            Branch,
            Branch.id == Sale.branch_id,
        )
        .order_by(
            Sale.created_at.desc(),
            Sale.id.desc(),
        )
        .limit(limit)
        .all()
    )