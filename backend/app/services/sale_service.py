# ============================================================
# MatrixFlow Enterprise
# Service de ventas
# ============================================================

from sqlalchemy.orm import Session

from app.repositories.branch_repository import (
    get_branch_by_id,
)
from app.repositories.product_repository import (
    get_product_by_id,
)
from app.repositories.sale_repository import (
    create_sale_with_details,
    get_all_sales,
    get_sale_by_id,
    get_sales_by_branch,
)
from app.repositories.user_repository import (
    get_user_by_id,
)


def list_sales(db: Session):
    return get_all_sales(db)


def get_sale(
    db: Session,
    sale_id: int,
):
    sale = get_sale_by_id(
        db,
        sale_id,
    )

    if sale is None:
        raise ValueError(
            "La venta no existe."
        )

    return sale


def list_sales_by_branch(
    db: Session,
    branch_id: int,
):
    if branch_id <= 0:
        raise ValueError(
            "El identificador de sucursal no es válido."
        )

    return get_sales_by_branch(
        db,
        branch_id,
    )


def register_sale(
    db: Session,
    company_id: int,
    branch_id: int,
    user_id: int,
    details,
):
    """
    Registra una venta completa.

    El backend obtiene los precios reales de PostgreSQL
    y calcula subtotales y total.
    """

    # --------------------------------------------------------
    # Validar sucursal
    # --------------------------------------------------------

    branch = get_branch_by_id(
        db,
        branch_id,
    )

    if branch is None:
        raise ValueError(
            "La sucursal seleccionada no existe."
        )

    if not branch.is_active:
        raise ValueError(
            "La sucursal seleccionada está inactiva."
        )

    if branch.company_id != company_id:
        raise ValueError(
            "La sucursal no pertenece a la empresa seleccionada."
        )

    # --------------------------------------------------------
    # Validar usuario
    # --------------------------------------------------------

    user = get_user_by_id(
        db,
        user_id,
    )

    if user is None:
        raise ValueError(
            "El usuario no existe."
        )

    if not user.is_active:
        raise ValueError(
            "El usuario está inactivo."
        )

    # --------------------------------------------------------
    # Validar productos y calcular importes
    # --------------------------------------------------------

    processed_details = []
    total = 0.0
    product_ids = set()

    for detail in details:
        # Evitamos ingresar el mismo producto dos veces
        # dentro de una misma venta.
        if detail.product_id in product_ids:
            raise ValueError(
                "Un producto no puede repetirse en la misma venta."
            )

        product_ids.add(
            detail.product_id,
        )

        product = get_product_by_id(
            db,
            detail.product_id,
        )

        if product is None:
            raise ValueError(
                f"El producto {detail.product_id} no existe."
            )

        if not product.is_active:
            raise ValueError(
                f'El producto "{product.name}" está inactivo.'
            )

        # El precio sale de PostgreSQL y no del navegador.
        unit_price = float(product.price)

        subtotal = (
            detail.quantity
            * unit_price
        )

        total += subtotal

        processed_details.append(
            {
                "product_id": product.id,
                "quantity": detail.quantity,
                "unit_price": unit_price,
                "subtotal": subtotal,
            }
        )

    return create_sale_with_details(
        db=db,
        company_id=company_id,
        branch_id=branch_id,
        user_id=user_id,
        total=total,
        details=processed_details,
    )