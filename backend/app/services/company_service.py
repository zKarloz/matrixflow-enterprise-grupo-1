# ============================================================
# MatrixFlow Enterprise
# Servicio de empresas
# ============================================================
# Este archivo contiene la lógica de negocio relacionada
# con las empresas.
# ============================================================

from sqlalchemy.orm import Session

from app.repositories.company_repository import (
    create_company,
    get_all_companies,
    get_company_by_id,
)


# ------------------------------------------------------------
# Listar empresas
# ------------------------------------------------------------
def list_companies(db: Session):
    # Obtiene todas las empresas desde el repositorio.
    return get_all_companies(db)


# ------------------------------------------------------------
# Obtener una empresa
# ------------------------------------------------------------
def get_company(db: Session, company_id: int):
    # Busca una empresa por su ID.
    company = get_company_by_id(db, company_id)

    # Si no existe, informamos el error al endpoint.
    if company is None:
        raise ValueError("Empresa no encontrada")

    return company


# ------------------------------------------------------------
# Registrar una empresa
# ------------------------------------------------------------
def register_company(
    db: Session,
    name: str,
    tax_id: str,
    address: str | None = None,
    phone: str | None = None,
    email: str | None = None,
):
    # Validamos que el nombre no esté vacío.
    if not name or not name.strip():
        raise ValueError("El nombre de la empresa es obligatorio")

    # Validamos que el RUC/identificador tributario no esté vacío.
    if not tax_id or not tax_id.strip():
        raise ValueError("El tax_id de la empresa es obligatorio")

    # Creamos la empresa utilizando todos los datos disponibles.
    return create_company(
        db=db,
        name=name.strip(),
        tax_id=tax_id.strip(),
        address=address,
        phone=phone,
        email=email,
    )