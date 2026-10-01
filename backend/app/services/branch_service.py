# ============================================================
# MatrixFlow Enterprise
# Servicio de sucursales
# ============================================================
#
# Contiene la lógica de negocio relacionada con branches.
# ============================================================

from sqlalchemy.orm import Session

from app.repositories.branch_repository import (
    create_branch,
    get_all_branches,
    get_branch_by_id,
    get_branches_by_company,
    update_branch,
)


def list_branches(db: Session):
    """
    Obtiene todas las sucursales.
    """

    return get_all_branches(db)


def get_branch(
    db: Session,
    branch_id: int,
):
    """
    Obtiene una sucursal específica.
    """

    branch = get_branch_by_id(
        db,
        branch_id,
    )

    if branch is None:
        raise ValueError(
            "La sucursal no existe."
        )

    return branch


def list_branches_by_company(
    db: Session,
    company_id: int,
):
    """
    Obtiene las sucursales pertenecientes a una empresa.
    """

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
    """
    Registra una nueva sucursal.
    """

    if not name or not name.strip():
        raise ValueError(
            "El nombre de la sucursal es obligatorio."
        )

    if company_id <= 0:
        raise ValueError(
            "El identificador de empresa no es válido."
        )

    return create_branch(
        db=db,
        name=name.strip(),
        company_id=company_id,
        address=address,
        phone=phone,
    )


def modify_branch(
    db: Session,
    branch_id: int,
    name: str,
    address: str | None,
    phone: str | None,
    is_active: bool,
):
    """
    Actualiza una sucursal existente.
    """

    # Primero comprobamos que la sucursal exista.
    branch = get_branch_by_id(
        db,
        branch_id,
    )

    if branch is None:
        raise ValueError(
            "La sucursal no existe."
        )

    # El nombre continúa siendo obligatorio al editar.
    if not name or not name.strip():
        raise ValueError(
            "El nombre de la sucursal es obligatorio."
        )

    return update_branch(
        db=db,
        branch=branch,
        name=name.strip(),
        address=address,
        phone=phone,
        is_active=is_active,
    )