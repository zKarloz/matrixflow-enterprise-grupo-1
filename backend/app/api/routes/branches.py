# Este archivo contiene los endpoints relacionados con sucursales.
# Las rutas delegan la lógica de negocio al branch_service.

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.branch import BranchCreate, BranchResponse
from app.services.branch_service import (
    get_branch,
    list_branches,
    list_branches_by_company,
    register_branch,
)

# Router del módulo de sucursales.
router = APIRouter(
    prefix="/branches",
    tags=["Sucursales"],
)


@router.get(
    "",
    response_model=list[BranchResponse],
)
def get_branches(
    db: Session = Depends(get_db),
):
    """
    Obtiene todas las sucursales.
    """

    # Consultamos mediante el service.
    return list_branches(db)


@router.get(
    "/company/{company_id}",
    response_model=list[BranchResponse],
)
def get_company_branches(
    company_id: int,
    db: Session = Depends(get_db),
):
    """
    Obtiene las sucursales pertenecientes a una empresa.
    """

    # El service realiza el filtrado.
    return list_branches_by_company(
        db,
        company_id,
    )


@router.get(
    "/{branch_id}",
    response_model=BranchResponse,
)
def get_branch_by_id(
    branch_id: int,
    db: Session = Depends(get_db),
):
    """
    Obtiene una sucursal mediante su ID.
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


@router.post(
    "",
    response_model=BranchResponse,
)
def create_branch(
    data: BranchCreate,
    db: Session = Depends(get_db),
):
    """
    Registra una nueva sucursal.
    """

    try:
        return register_branch(
            db=db,
            name=data.name,
            company_id=data.company_id,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )