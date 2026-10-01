# ============================================================
# MatrixFlow Enterprise
# Repositorio de sucursales
# ============================================================
#
# Contiene las operaciones de acceso a la tabla "branches".
# Esta capa trabaja directamente con SQLAlchemy.
# ============================================================

from sqlalchemy.orm import Session

from app.models.branch import Branch


def get_all_branches(db: Session):
    """
    Obtiene todas las sucursales registradas.
    """

    return db.query(Branch).all()


def get_branch_by_id(
    db: Session,
    branch_id: int,
):
    """
    Busca una sucursal por su identificador.
    """

    return (
        db.query(Branch)
        .filter(Branch.id == branch_id)
        .first()
    )


def get_branches_by_company(
    db: Session,
    company_id: int,
):
    """
    Obtiene las sucursales pertenecientes a una empresa.
    """

    return (
        db.query(Branch)
        .filter(Branch.company_id == company_id)
        .all()
    )


def create_branch(
    db: Session,
    name: str,
    company_id: int,
    address: str | None = None,
    phone: str | None = None,
):
    """
    Registra una nueva sucursal.
    """

    branch = Branch(
        name=name,
        company_id=company_id,
        address=address,
        phone=phone,
        is_active=True,
    )

    db.add(branch)
    db.commit()
    db.refresh(branch)

    return branch


def update_branch(
    db: Session,
    branch: Branch,
    name: str,
    address: str | None,
    phone: str | None,
    is_active: bool,
):
    """
    Actualiza los datos administrativos de una sucursal.

    La empresa asociada no se modifica para conservar
    la coherencia con los registros históricos.
    """

    branch.name = name
    branch.address = address
    branch.phone = phone
    branch.is_active = is_active

    db.commit()
    db.refresh(branch)

    return branch