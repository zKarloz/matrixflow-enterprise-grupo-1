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
    get_company_by_tax_id,
    update_company as update_company_repository,
)


# ------------------------------------------------------------
# Utilidad para limpiar campos opcionales
# ------------------------------------------------------------
def _clean_optional_text(value: str | None):
    # Los textos vacíos se almacenan como NULL para evitar
    # valores como "" en los datos corporativos.
    if value is None:
        return None

    cleaned_value = value.strip()
    return cleaned_value or None


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
    # Normalizamos los campos obligatorios antes de validarlos.
    clean_name = name.strip() if name else ""
    clean_tax_id = tax_id.strip() if tax_id else ""

    # Validamos que el nombre no esté vacío.
    if not clean_name:
        raise ValueError("El nombre de la empresa es obligatorio")

    # Validamos que el RUC/identificador tributario no esté vacío.
    if not clean_tax_id:
        raise ValueError("El RUC de la empresa es obligatorio")

    # La columna tax_id es UNIQUE en PostgreSQL.
    if get_company_by_tax_id(db, clean_tax_id) is not None:
        raise ValueError("Ya existe una empresa registrada con ese RUC")

    # Creamos la empresa utilizando los datos normalizados.
    return create_company(
        db=db,
        name=clean_name,
        tax_id=clean_tax_id,
        address=_clean_optional_text(address),
        phone=_clean_optional_text(phone),
        email=_clean_optional_text(email),
    )


# ------------------------------------------------------------
# Actualizar una empresa
# ------------------------------------------------------------
def update_company(
    db: Session,
    company_id: int,
    name: str,
    tax_id: str,
    address: str | None = None,
    phone: str | None = None,
    email: str | None = None,
):
    # Comprobamos que la empresa que se desea editar exista.
    company = get_company_by_id(db, company_id)

    if company is None:
        raise ValueError("Empresa no encontrada")

    # Normalizamos los campos obligatorios.
    clean_name = name.strip() if name else ""
    clean_tax_id = tax_id.strip() if tax_id else ""

    if not clean_name:
        raise ValueError("El nombre de la empresa es obligatorio")

    if not clean_tax_id:
        raise ValueError("El RUC de la empresa es obligatorio")

    # Permitimos conservar el mismo RUC de la empresa actual,
    # pero impedimos utilizar el RUC perteneciente a otra empresa.
    company_with_same_tax_id = get_company_by_tax_id(
        db,
        clean_tax_id,
    )

    if (
        company_with_same_tax_id is not None
        and company_with_same_tax_id.id != company_id
    ):
        raise ValueError("Ya existe una empresa registrada con ese RUC")

    # Enviamos los datos ya validados al repositorio.
    return update_company_repository(
        db=db,
        company=company,
        name=clean_name,
        tax_id=clean_tax_id,
        address=_clean_optional_text(address),
        phone=_clean_optional_text(phone),
        email=_clean_optional_text(email),
    )
