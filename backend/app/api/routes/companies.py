# Este archivo contiene los endpoints relacionados con empresas.
# Las rutas reciben las solicitudes HTTP y delegan la lógica
# al company_service.

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.company import CompanyCreate, CompanyResponse
from app.services.company_service import (
    get_company,
    list_companies,
    register_company,
)

# Creamos el router correspondiente al módulo de empresas.
router = APIRouter(
    prefix="/companies",
    tags=["Empresas"],
)


@router.get(
    "",
    response_model=list[CompanyResponse],
)
def get_companies(
    db: Session = Depends(get_db),
):
    """
    Obtiene todas las empresas registradas.
    """

    # El service se encarga de consultar los datos.
    return list_companies(db)


@router.get(
    "/{company_id}",
    response_model=CompanyResponse,
)
def get_company_by_id(
    company_id: int,
    db: Session = Depends(get_db),
):
    """
    Obtiene una empresa mediante su ID.
    """

    try:
        # Delegamos la búsqueda al service.
        return get_company(db, company_id)

    except ValueError as error:
        # Convertimos el error de negocio en una respuesta HTTP.
        raise HTTPException(
            status_code=404,
            detail=str(error),
        )


@router.post(
    "",
    response_model=CompanyResponse,
)
def create_company(
    data: CompanyCreate,
    db: Session = Depends(get_db),
):
    """
    Registra una nueva empresa.
    """

    try:
        # El service contiene la lógica de creación.
        return register_company(
            db=db,
            name=data.name,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )