# ============================================================
# MatrixFlow Enterprise
# Repository de empresas
# ============================================================
# Este archivo contiene las operaciones de persistencia
# relacionadas con la tabla "companies".
# ============================================================

from sqlalchemy.orm import Session

from app.models.company import Company


# ------------------------------------------------------------
# Obtener todas las empresas
# ------------------------------------------------------------
def get_all_companies(db: Session):
    # Devuelve todas las empresas registradas.
    return db.query(Company).all()


# ------------------------------------------------------------
# Obtener una empresa por ID
# ------------------------------------------------------------
def get_company_by_id(db: Session, company_id: int):
    # Busca una empresa utilizando su identificador.
    return (
        db.query(Company)
        .filter(Company.id == company_id)
        .first()
    )


# ------------------------------------------------------------
# Obtener una empresa por RUC / tax_id
# ------------------------------------------------------------
def get_company_by_tax_id(db: Session, tax_id: str):
    # Esta consulta permite comprobar la restricción UNIQUE
    # antes de intentar guardar los cambios en PostgreSQL.
    return (
        db.query(Company)
        .filter(Company.tax_id == tax_id)
        .first()
    )


# ------------------------------------------------------------
# Crear una empresa
# ------------------------------------------------------------
def create_company(
    db: Session,
    name: str,
    tax_id: str,
    address: str | None = None,
    phone: str | None = None,
    email: str | None = None,
):
    # La tabla companies exige tax_id e is_active.
    # Por eso enviamos ambos valores explícitamente.
    company = Company(
        name=name,
        tax_id=tax_id,
        address=address,
        phone=phone,
        email=email,
        is_active=True,
    )

    # Agregamos la empresa a la sesión.
    db.add(company)

    # Guardamos los cambios en PostgreSQL.
    db.commit()

    # Actualizamos el objeto con el ID generado por PostgreSQL.
    db.refresh(company)

    # Devolvemos la empresa creada.
    return company


# ------------------------------------------------------------
# Actualizar una empresa
# ------------------------------------------------------------
def update_company(
    db: Session,
    company: Company,
    name: str,
    tax_id: str,
    address: str | None = None,
    phone: str | None = None,
    email: str | None = None,
):
    # Modificamos únicamente los datos corporativos.
    # El estado de la empresa no se altera desde este formulario.
    company.name = name
    company.tax_id = tax_id
    company.address = address
    company.phone = phone
    company.email = email

    # Persistimos los cambios realizados.
    db.commit()

    # Recargamos el objeto para devolver exactamente
    # los valores almacenados en PostgreSQL.
    db.refresh(company)

    return company
