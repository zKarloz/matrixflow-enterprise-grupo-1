# ============================================================
# MatrixFlow Enterprise
# Service de ventas
# ============================================================
#
# Contiene la lógica de negocio relacionada con:
#
# - Encabezados de venta.
# - Detalles de venta.
# - Cálculo de subtotales.
# ============================================================

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

    # Delegamos la consulta al repository.
    return get_all_sales(db)


def get_sale(
    db: Session,
    sale_id: int,
):
    """
    Obtiene una venta por ID.
    """

    # Buscamos la venta.
    sale = get_sale_by_id(
        db,
        sale_id,
    )

    # Si no existe, informamos al endpoint.
    if sale is None:
        raise ValueError(
            "La venta no existe."
        )

    return sale


def list_sales_by_branch(
    db: Session,
    branch_id: int,
):
    """
    Obtiene las ventas de una sucursal.
    """

    # Validamos el identificador.
    if branch_id <= 0:
        raise ValueError(
            "El identificador de sucursal no es válido."
        )

    # Consultamos las ventas.
    return get_sales_by_branch(
        db,
        branch_id,
    )


def register_sale(
    db: Session,
    company_id: int,
    branch_id: int,
    user_id: int,
    total: float,
):
    """
    Registra el encabezado de una venta.
    """

    # Validamos la empresa.
    if company_id <= 0:
        raise ValueError(
            "El identificador de empresa no es válido."
        )

    # Validamos la sucursal.
    if branch_id <= 0:
        raise ValueError(
            "El identificador de sucursal no es válido."
        )

    # Validamos el usuario.
    if user_id <= 0:
        raise ValueError(
            "El identificador de usuario no es válido."
        )

    # Una venta no puede tener un total negativo.
    if total < 0:
        raise ValueError(
            "El total de la venta no puede ser negativo."
        )

    # Creamos el encabezado mediante el repository.
    return create_sale(
        db=db,
        company_id=company_id,
        branch_id=branch_id,
        user_id=user_id,
        total=total,
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

    El subtotal se calcula automáticamente:
        subtotal = quantity * unit_price
    """

    # Validamos el ID de la venta.
    if sale_id <= 0:
        raise ValueError(
            "El identificador de venta no es válido."
        )

    # Validamos el producto.
    if product_id <= 0:
        raise ValueError(
            "El identificador de producto no es válido."
        )

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

    # Calculamos el subtotal del detalle.
    subtotal = quantity * unit_price

    # Guardamos el detalle completo.
    return create_sale_detail(
        db=db,
        sale_id=sale_id,
        product_id=product_id,
        quantity=quantity,
        unit_price=unit_price,
        subtotal=subtotal,
    )