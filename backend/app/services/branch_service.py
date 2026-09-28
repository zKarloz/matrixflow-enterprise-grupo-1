# Este archivo contiene la lógica de negocio relacionada con las sucursales.
# Coordina las operaciones entre las rutas y el repository de sucursales.

from sqlalchemy.orm import Session

from app.repositories.branch_repository import (
    create_branch,
    get_all_branches,
    get_branch_by_id,
    get_branches_by_company,
)


def list_branches(db: Session):
    """
    Devuelve todas las sucursales.
    """

    # Consultamos las sucursales mediante el repository.
    return get_all_branches(db)


def get_branch(
    db: Session,
    branch_id: int,
):
    """
    Obtiene una sucursal por su identificador.
    """

    # Buscamos la sucursal.
    branch = get_branch_by_id(db, branch_id)

    # Validamos que exista.
    if branch is None:
        raise ValueError("La sucursal no existe.")

    return branch


def list_branches_by_company(
    db: Session,
    company_id: int,
):
    """
    Obtiene las sucursales de una empresa.
    """

    # Consultamos las sucursales pertenecientes a la empresa.
    return get_branches_by_company(db, company_id)


def register_branch(
    db: Session,
    name: str,
    company_id: int,
    city: str | None = None,
):
    """
    Registra una nueva sucursal.
    """

    # El nombre de la sucursal es obligatorio.
    if not name.strip():
        raise ValueError("El nombre de la sucursal es obligatorio.")

    # El identificador de la empresa debe ser válido.
    if company_id <= 0:
        raise ValueError("El identificador de empresa no es válido.")

    # Delegamos la creación al repository.
    return create_branch(
        db=db,
        name=name,
        company_id=company_id,
        city=city,
    )