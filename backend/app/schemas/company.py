# ============================================================
# MatrixFlow Enterprise
# Schemas de empresas
# ============================================================
# Define los datos que recibe y devuelve la API para
# las empresas.
# ============================================================

from pydantic import BaseModel


# ------------------------------------------------------------
# Datos comunes de una empresa
# ------------------------------------------------------------
class CompanyBase(BaseModel):
    # Nombre comercial o razón social de la empresa.
    name: str

    # Identificador tributario.
    # En nuestra BD es obligatorio.
    tax_id: str

    # Datos adicionales que permite la tabla companies.
    address: str | None = None
    phone: str | None = None
    email: str | None = None


# ------------------------------------------------------------
# Datos utilizados para crear una empresa
# ------------------------------------------------------------
class CompanyCreate(CompanyBase):
    # Hereda todos los campos de CompanyBase.
    pass


# ------------------------------------------------------------
# Datos devueltos por la API
# ------------------------------------------------------------
class CompanyResponse(CompanyBase):
    # Identificador generado por PostgreSQL.
    id: int

    # Permite convertir directamente objetos SQLAlchemy
    # en respuestas Pydantic.
    class Config:
        from_attributes = True