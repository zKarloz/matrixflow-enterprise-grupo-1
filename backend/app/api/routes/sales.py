# Este archivo contiene los endpoints relacionados con las ventas.
# Las rutas delegan la lógica de ventas al sale_service.

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.sale import SaleCreate, SaleResponse
from app.services.sale_service import (
    get_sale,
    list_sales,
    list_sales_by_branch,
    register_sale,
    register_sale_detail,
)

# Router del módulo de ventas.
router = APIRouter(
    prefix="/sales",
    tags=["Ventas"],
)


@router.get(
    "",
)
def get_sales(
    db: Session = Depends(get_db),
):
    """
    Obtiene todas las ventas.
    """

    # Devolvemos las ventas registradas.
    return list_sales(db)


@router.get(
    "/branch/{branch_id}",
)
def get_branch_sales(
    branch_id: int,
    db: Session = Depends(get_db),
):
    """
    Obtiene las ventas de una sucursal.
    """

    return list_sales_by_branch(
        db,
        branch_id,
    )


@router.get(
    "/{sale_id}",
)
def get_sale_by_id(
    sale_id: int,
    db: Session = Depends(get_db),
):
    """
    Obtiene una venta mediante su ID.
    """

    try:
        return get_sale(
            db,
            sale_id,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        )


@router.post("")
def create_sale(
    data: SaleCreate,
    db: Session = Depends(get_db),
):
    """
    Registra una venta.
    """

    try:
        # Primero creamos el registro principal de la venta.
        sale = register_sale(
            db=db,
            branch_id=data.branch_id,
        )

        # Después agregamos el producto de la venta.
        detail = register_sale_detail(
            db=db,
            sale_id=sale.id,
            product_id=data.product_id,
            quantity=data.quantity,
            unit_price=data.unit_price,
        )

        # Devolvemos ambos registros.
        return {
            "sale": sale,
            "detail": detail,
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )