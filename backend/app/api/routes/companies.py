# ============================================================
# MatrixFlow Enterprise
# Rutas de empresas
# ============================================================
# Este archivo define los endpoints HTTP relacionados con
# la gestión de empresas.
# ============================================================

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require_roles
from app.schemas.company import CompanyCreate, CompanyResponse
from app.services.company_service import (
    get_company,
    list_companies,
    register_company,
)


# ------------------------------------------------------------
# Configuración del router
# ------------------------------------------------------------
router = APIRouter(
    prefix="/companies",
    tags=["Empresas"],
)


# ------------------------------------------------------------
# GET /companies
# ------------------------------------------------------------
@router.get("", response_model=list[CompanyResponse])
def get_companies(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Administrador")
    ),
):
    # Devuelve todas las empresas registradas.
    return list_companies(db)


# ------------------------------------------------------------
# GET /companies/{company_id}
# ------------------------------------------------------------
@router.get("/{company_id}", response_model=CompanyResponse)
def get_company_by_id(
    company_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Administrador")
    ),
):
    try:
        # Busca la empresa solicitada.
        return get_company(db, company_id)

    except ValueError as error:
        # Si no existe, devolvemos HTTP 404.
        raise HTTPException(
            status_code=404,
            detail=str(error),
        )


# ------------------------------------------------------------
# POST /companies
# ------------------------------------------------------------
@router.post("", response_model=CompanyResponse)
def create_company(
    data: CompanyCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Administrador")
    ),
):
    try:
        # Registramos la empresa utilizando todos los datos
        # recibidos por el schema.
        return register_company(
            db=db,
            name=data.name,
            tax_id=data.tax_id,
            address=data.address,
            phone=data.phone,
            email=data.email,
        )

    except ValueError as error:
        # Los errores de validación de negocio se devuelven
        # como una respuesta HTTP 400.
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )