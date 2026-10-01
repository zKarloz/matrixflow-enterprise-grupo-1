# ============================================================
# MatrixFlow Enterprise
# Rutas de inventario
# ============================================================
# Define los endpoints HTTP relacionados con:
#
# - Consulta de inventario.
# - Registro de inventario.
# - Registro de movimientos.
# ============================================================

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require_roles

from app.schemas.inventory import (
    InventoryCreate,
    InventoryMovementCreate,
    InventoryMovementResponse,
    InventoryResponse,
    InventoryUpdate,
)

from app.services.inventory_service import (
    list_inventory,
    list_inventory_by_branch,
    list_inventory_by_product,
    modify_inventory,
    register_inventory,
    register_inventory_movement,
)


# Router principal del módulo.
router = APIRouter(
    prefix="/inventory",
    tags=["Inventario"],
)


# ============================================================
# Consultar todo el inventario
# ============================================================

@router.get(
    "",
    response_model=list[InventoryResponse],
)
def get_inventory(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Administrador", "Analista")
    ),
):
    # Devuelve todas las existencias registradas.
    return list_inventory(db)


# ============================================================
# Consultar inventario por sucursal
# ============================================================

@router.get(
    "/branch/{branch_id}",
    response_model=list[InventoryResponse],
)
def get_branch_inventory(
    branch_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Administrador", "Analista")
    ),
):
    # Devuelve las existencias de una sucursal específica.
    return list_inventory_by_branch(
        db,
        branch_id,
    )


# ============================================================
# Consultar inventario por producto
# ============================================================

@router.get(
    "/product/{product_id}",
    response_model=list[InventoryResponse],
)
def get_product_inventory(
    product_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Administrador", "Analista")
    ),
):
    # Devuelve las existencias del producto solicitado.
    return list_inventory_by_product(
        db,
        product_id,
    )


# ============================================================
# Crear inventario
# ============================================================

@router.post(
    "",
    response_model=InventoryResponse,
)
def create_inventory(
    data: InventoryCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Administrador", "Analista")
    ),
):
    # Registra una nueva existencia de inventario.
    try:
        return register_inventory(
            db=db,
            branch_id=data.branch_id,
            product_id=data.product_id,
            stock=data.stock,
            minimum_stock=data.minimum_stock,
            unit_cost=data.unit_cost,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

# ============================================================
# Actualizar inventario
# ============================================================

@router.patch(
    "/{inventory_id}",
    response_model=InventoryResponse,
)
def update_existing_inventory(
    inventory_id: int,
    data: InventoryUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Administrador", "Analista")
    ),
):
    """
    Actualiza manualmente un registro de inventario.

    Permite modificar:
    - stock actual
    - stock mínimo
    - costo unitario

    La sucursal y el producto no cambian porque identifican
    la combinación física del registro de inventario.
    """

    try:
        return modify_inventory(
            db=db,
            inventory_id=inventory_id,
            stock=data.stock,
            minimum_stock=data.minimum_stock,
            unit_cost=data.unit_cost,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

# ============================================================
# Registrar movimiento de inventario
# ============================================================

@router.post(
    "/movements",
    response_model=InventoryMovementResponse,
)
def create_inventory_movement(
    data: InventoryMovementCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Administrador", "Analista")
    ),
):
    # Registra un movimiento relacionado con un registro
    # específico de inventory.
    try:
        return register_inventory_movement(
            db=db,
            inventory_id=data.inventory_id,
            movement_type=data.movement_type,
            quantity=data.quantity,
            description=data.description,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )