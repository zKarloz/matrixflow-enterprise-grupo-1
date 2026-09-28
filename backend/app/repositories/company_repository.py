# Este archivo contiene las consultas relacionadas con las empresas.
# Su función es separar el acceso a los datos de la lógica de negocio.

from sqlalchemy.orm import Session

from app.models.company import Company


def get_all_companies(db: Session):
    """
    Obtiene todas las empresas registradas.
    """

    # Consultamos todas las empresas almacenadas.
    return db.query(Company).all()


def get_company_by_id(db: Session, company_id: int):
    """
    Obtiene una empresa utilizando su identificador.
    """

    # Buscamos la empresa cuyo ID coincida con el recibido.
    return (
        db.query(Company)
        .filter(Company.id == company_id)
        .first()
    )


def create_company(db: Session, name: str, tax_id: str | None = None):
    """
    Crea una nueva empresa.
    """

    # Construimos el objeto Company con los datos recibidos.
    company = Company(
        name=name,
        tax_id=tax_id,
    )

    # Agregamos la empresa a la sesión de SQLAlchemy.
    db.add(company)

    # Guardamos los cambios en la base de datos.
    db.commit()

    # Actualizamos el objeto con los datos generados por la base de datos.
    db.refresh(company)

    return company