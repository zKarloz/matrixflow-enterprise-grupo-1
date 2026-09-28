# Este archivo contiene las consultas relacionadas con las sucursales.
# Separa el acceso a la tabla branches de los servicios y las rutas.

from sqlalchemy.orm import Session

from app.models.branch import Branch


def get_all_branches(db: Session):
    """
    Obtiene todas las sucursales registradas.
    """

    # Consultamos todas las sucursales.
    return db.query(Branch).all()


def get_branch_by_id(db: Session, branch_id: int):
    """
    Obtiene una sucursal mediante su identificador.
    """

    # Buscamos la sucursal correspondiente al ID.
    return (
        db.query(Branch)
        .filter(Branch.id == branch_id)
        .first()
    )


def get_branches_by_company(db: Session, company_id: int):
    """
    Obtiene las sucursales pertenecientes a una empresa.
    """

    # Filtramos las sucursales por empresa.
    return (
        db.query(Branch)
        .filter(Branch.company_id == company_id)
        .all()
    )


def create_branch(
    db: Session,
    name: str,
    company_id: int,
    city: str | None = None,
):
    """
    Crea una nueva sucursal.
    """

    # Creamos el objeto de la sucursal.
    branch = Branch(
        name=name,
        company_id=company_id,
        city=city,
    )

    # Agregamos el objeto a la sesión.
    db.add(branch)

    # Guardamos los cambios.
    db.commit()

    # Actualizamos el objeto con el ID generado.
    db.refresh(branch)

    return branch