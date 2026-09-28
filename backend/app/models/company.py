# Este archivo define el modelo de la tabla "companies".
# Representa las empresas registradas en MatrixFlow Enterprise.

from sqlalchemy import Column, Integer, String

from app.core.database import Base


class Company(Base):
    """
    Modelo SQLAlchemy correspondiente a la tabla companies.
    """

    # Nombre de la tabla en PostgreSQL.
    __tablename__ = "companies"

    # Identificador único de la empresa.
    id = Column(Integer, primary_key=True, index=True)

    # Nombre de la empresa.
    name = Column(String(150), nullable=False)

    # Identificador fiscal o documento de la empresa.
    tax_id = Column(String(50), unique=True, nullable=True)