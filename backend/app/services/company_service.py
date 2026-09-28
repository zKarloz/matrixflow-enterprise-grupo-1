# Este archivo contiene la lógica de negocio relacionada con las empresas.
# El service se encarga de coordinar la validación y el repository.

from sqlalchemy.orm import Session

from app.repositories.company_repository import (
    create_company,
    get_all_companies,
    get_company_by_id,
)


def list_companies(db: Session):
    """
    Devuelve todas las empresas registradas.
    """

    # El repository se encarga de consultar la base de datos.
    return get_all_companies(db)


def get_company(db: Session, company_id: int):
    """
    Obtiene una empresa por su identificador.
    """

    # Consultamos la empresa.
    company = get_company_by_id(db, company_id)

    # Si no existe, informamos el error para que la ruta
    # pueda convertirlo posteriormente en una respuesta HTTP.
    if company is None:
        raise ValueError("La empresa no existe.")

    return company


def register_company(
    db: Session,
    name: str,
    tax_id: str | None = None,
):
    """
    Registra una nueva empresa.
    """

    # Validamos que el nombre no esté vacío.
    if not name.strip():
        raise ValueError("El nombre de la empresa es obligatorio.")

    # Delegamos la persistencia al repository.
    return create_company(
        db=db,
        name=name,
        tax_id=tax_id,
    )