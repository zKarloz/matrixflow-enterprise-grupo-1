# ============================================================
# MatrixFlow Enterprise
# Repositorio de sucursales
# ============================================================
# Este archivo contiene las operaciones de acceso a la tabla
# "branches" de PostgreSQL.
# ============================================================

from sqlalchemy.orm import Session

from app.models.branch import Branch


def get_all_branches(db: Session):
    # Obtiene todas las sucursales registradas.
    return db.query(Branch).all()


def get_branch_by_id(db: Session, branch_id: int):
    # Busca una sucursal por su identificador.
    return (
        db.query(Branch)
        .filter(Branch.id == branch_id)
        .first()
    )


def get_branches_by_company(
    db: Session,
    company_id: int,
):
    # Obtiene las sucursales pertenecientes a una empresa.
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
    # La tabla branches utiliza address y phone.
    # is_active se establece inicialmente como True.
    branch = Branch(
        name=name,
        company_id=company_id,
        address=address,
        phone=phone,
        is_active=True,
    )

    # Agregamos la sucursal a la sesión.
    db.add(branch)

    # Guardamos los cambios.
    db.commit()

    # Recuperamos el ID generado por PostgreSQL.
    db.refresh(branch)

    return branch