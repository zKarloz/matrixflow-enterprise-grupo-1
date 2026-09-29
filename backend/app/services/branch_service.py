# ============================================================
# MatrixFlow Enterprise
# Servicio de sucursales
# ============================================================
# Contiene la lógica de negocio relacionada con las sucursales.
# ============================================================

from sqlalchemy.orm import Session

from app.repositories.branch_repository import (
    create_branch,
    get_all_branches,
    get_branch_by_id,
    get_branches_by_company,
)


def list_branches(db: Session):
    # Obtiene todas las sucursales.
    return get_all_branches(db)


def get_branch(
    db: Session,
    branch_id: int,
):
    # Busca la sucursal solicitada.
    branch = get_branch_by_id(db, branch_id)

    # Si no existe, informamos al endpoint.
    if branch is None:
        raise ValueError("La sucursal no existe.")

    return branch


def list_branches_by_company(
    db: Session,
    company_id: int,
):
    # Obtiene las sucursales de una empresa.
    return get_branches_by_company(
        db,
        company_id,
    )


def register_branch(
    db: Session,
    name: str,
    company_id: int,
    address: str | None = None,
    phone: str | None = None,
):
    # Validamos el nombre.
    if not name or not name.strip():
        raise ValueError(
            "El nombre de la sucursal es obligatorio."
        )

    # Validamos la empresa.
    if company_id <= 0:
        raise ValueError(
            "El identificador de empresa no es válido."
        )

    # Creamos la sucursal mediante el repositorio.
    return create_branch(
        db=db,
        name=name.strip(),
        company_id=company_id,
        address=address,
        phone=phone,
    )