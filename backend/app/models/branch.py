# Este archivo define el modelo de la tabla "branches".
# Representa las sucursales pertenecientes a una empresa.

from sqlalchemy import Column, ForeignKey, Integer, String

from app.core.database import Base


class Branch(Base):
    """
    Modelo SQLAlchemy correspondiente a la tabla branches.
    """

    # Nombre de la tabla en PostgreSQL.
    __tablename__ = "branches"

    # Identificador único de la sucursal.
    id = Column(Integer, primary_key=True, index=True)

    # Nombre de la sucursal.
    name = Column(String(150), nullable=False)

    # Empresa a la que pertenece la sucursal.
    company_id = Column(
        Integer,
        ForeignKey("companies.id"),
        nullable=False,
    )

    # Ciudad donde se encuentra la sucursal.
    city = Column(String(100), nullable=True)