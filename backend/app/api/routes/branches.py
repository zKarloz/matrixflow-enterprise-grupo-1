# ============================================================
# MatrixFlow Enterprise
# Rutas de sucursales
# ============================================================
#
# Define los endpoints HTTP relacionados con branches.
# El acceso administrativo continúa protegido mediante RBAC.
# ============================================================

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require_roles

from app.schemas.branch import (
    BranchCreate,
    BranchResponse,
    BranchUpdate,
)

from app.services.branch_service import (
    get_branch,
    list_branches,
    list_branches_by_company,
    modify_branch,
    register_branch,
)


router = APIRouter(
    prefix="/branches",
    tags=["Sucursales"],
)


# ------------------------------------------------------------
# OBTENER TODAS LAS SUCURSALES
# ------------------------------------------------------------

@router.get(
    "",
    response_model=list[BranchResponse],
)
def get_branches(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Administrador", "Analista")
    ),
):
    """
    Devuelve todas las sucursales registradas.
    """

    return list_branches(db)


# ------------------------------------------------------------
# OBTENER SUCURSALES DE UNA EMPRESA
# ------------------------------------------------------------

@router.get(
    "/company/{company_id}",
    response_model=list[BranchResponse],
)
def get_company_branches(
    company_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Administrador", "Analista")
    ),
):
    """
    Devuelve las sucursales pertenecientes a una empresa.
    """

    return list_branches_by_company(
        db,
        company_id,
    )


# ------------------------------------------------------------
# OBTENER UNA SUCURSAL
# ------------------------------------------------------------

@router.get(
    "/{branch_id}",
    response_model=BranchResponse,
)
def get_branch_by_id(
    branch_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Administrador", "Analista")
    ),
):
    """
    Obtiene una sucursal mediante su identificador.
    """

    try:
        return get_branch(
            db,
            branch_id,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        )


# ------------------------------------------------------------
# CREAR SUCURSAL
# ------------------------------------------------------------

@router.post(
    "",
    response_model=BranchResponse,
    status_code=201,
)
def create_branch(
    data: BranchCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Administrador")
    ),
):
    """
    Registra una nueva sucursal.
    """

    try:
        return register_branch(
            db=db,
            name=data.name,
            company_id=data.company_id,
            address=data.address,
            phone=data.phone,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


# ------------------------------------------------------------
# ACTUALIZAR SUCURSAL
# ------------------------------------------------------------

@router.patch(
    "/{branch_id}",
    response_model=BranchResponse,
)
def update_existing_branch(
    branch_id: int,
    data: BranchUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Administrador")
    ),
):
    """
    Actualiza los datos administrativos de una sucursal.

    Permite modificar:
    - nombre
    - dirección
    - teléfono
    - estado activo/inactivo

    La empresa asociada no puede cambiarse desde esta operación.
    """

    try:
        return modify_branch(
            db=db,
            branch_id=branch_id,
            name=data.name,
            address=data.address,
            phone=data.phone,
            is_active=data.is_active,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )