# Este archivo contiene los endpoints relacionados con inventario.
# Las rutas utilizan inventory_service para consultar existencias
# y registrar movimientos.

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.inventory import (
    InventoryCreate,
    InventoryResponse,
)
from app.services.inventory_service import (
    list_inventory,
    list_inventory_by_branch,
    list_inventory_by_product,
    register_inventory,
)

# Router del módulo de inventario.
router = APIRouter(
    prefix="/inventory",
    tags=["Inventario"],
)


@router.get(
    "",
    response_model=list[InventoryResponse],
)
def get_inventory(
    db: Session = Depends(get_db),
):
    """
    Obtiene todo el inventario.
    """

    return list_inventory(db)


@router.get(
    "/branch/{branch_id}",
    response_model=list[InventoryResponse],
)
def get_branch_inventory(
    branch_id: int,
    db: Session = Depends(get_db),
):
    """
    Obtiene el inventario de una sucursal.
    """

    return list_inventory_by_branch(
        db,
        branch_id,
    )


@router.get(
    "/product/{product_id}",
    response_model=list[InventoryResponse],
)
def get_product_inventory(
    product_id: int,
    db: Session = Depends(get_db),
):
    """
    Obtiene el inventario de un producto.
    """

    return list_inventory_by_product(
        db,
        product_id,
    )


@router.post(
    "",
    response_model=InventoryResponse,
)
def create_inventory(
    data: InventoryCreate,
    db: Session = Depends(get_db),
):
    """
    Registra una existencia de inventario.
    """

    try:
        return register_inventory(
            db=db,
            branch_id=data.branch_id,
            product_id=data.product_id,
            quantity=data.quantity,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )