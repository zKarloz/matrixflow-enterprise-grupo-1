# ============================================================
# MatrixFlow Enterprise
# Router de ventas
# ============================================================
#
# Este archivo contiene los endpoints relacionados con:
#
# - Consulta de ventas.
# - Consulta de ventas por sucursal.
# - Consulta de una venta por ID.
# - Registro de una venta y su detalle.
#
# La ruta delega la lógica de negocio al sale_service.
# ============================================================

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db

# Dependencia que valida el JWT y obtiene
# el usuario autenticado.
from app.core.security import require_roles

from app.schemas.sale import (
    SaleCreate,
    SaleCreatedResponse,
    SaleDetailResponse,
    SaleResponse,
)

from app.services.sale_service import (
    get_sale,
    list_sales,
    list_sales_by_branch,
    register_sale,
)


# ============================================================
# Router
# ============================================================

# Router principal del módulo de ventas.
router = APIRouter(
    prefix="/sales",
    tags=["Ventas"],
)


# ============================================================
# Obtener todas las ventas
# ============================================================

@router.get("")
def get_sales(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Administrador", "Analista")
    ),
):
    """
    Obtiene todas las ventas registradas.
    """

    # Delegamos la consulta al servicio.
    return list_sales(db)


# ============================================================
# Obtener ventas por sucursal
# ============================================================

@router.get("/branch/{branch_id}")
def get_branch_sales(
    branch_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Administrador", "Analista")
    ),
):
    """
    Obtiene las ventas de una sucursal.
    """

    try:
        # Delegamos la búsqueda al servicio.
        return list_sales_by_branch(
            db,
            branch_id,
        )

    except ValueError as error:
        # Convertimos el error de validación en HTTP 400.
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


# ============================================================
# Obtener una venta por ID
# ============================================================

@router.get(
    "/{sale_id}",
    response_model=SaleResponse,
)
def get_sale_by_id(
    sale_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Administrador", "Analista")
    ),
):
    """
    Obtiene una venta mediante su ID.

    El endpoint requiere un JWT válido.
    """

    try:
        # Buscamos la venta mediante el servicio.
        return get_sale(
            db,
            sale_id,
        )

    except ValueError as error:
        # Si no existe, devolvemos HTTP 404.
        raise HTTPException(
            status_code=404,
            detail=str(error),
        )


# ============================================================
# Crear venta y detalle
# ============================================================

@router.post(
    "",
    response_model=SaleCreatedResponse,
    status_code=201,
)
def create_sale(
    data: SaleCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "Administrador",
            "Analista",
        )
    ),
):
    """
    Registra una venta completa con uno o más productos.
    """

    try:
        sale, details = register_sale(
            db=db,
            company_id=data.company_id,
            branch_id=data.branch_id,
            user_id=data.user_id,
            details=data.details,
        )

        return {
            "sale": SaleResponse.model_validate(
                sale
            ),
            "details": [
                SaleDetailResponse.model_validate(
                    detail
                )
                for detail in details
            ],
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )