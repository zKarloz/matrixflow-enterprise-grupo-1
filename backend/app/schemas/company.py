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
    # En nuestra BD es obligatorio y único.
    tax_id: str

    # Datos corporativos opcionales.
    # address representa el domicilio fiscal de la empresa,
    # no la dirección de una sucursal específica.
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
# Datos utilizados para actualizar una empresa
# ------------------------------------------------------------
class CompanyUpdate(CompanyBase):
    # Para editar una empresa enviamos nuevamente sus datos
    # corporativos principales. El ID se recibe por la URL.
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
