# Este archivo define el modelo de la tabla "targets".
# Los objetivos permiten almacenar valores de referencia que posteriormente
# pueden compararse con los datos reales mediante las operaciones del sistema.

from sqlalchemy import Column, Float, ForeignKey, Integer, String

from app.core.database import Base


class Target(Base):
    """
    Modelo SQLAlchemy correspondiente a la tabla targets.
    """

    # Nombre de la tabla en PostgreSQL.
    __tablename__ = "targets"

    # Identificador único del objetivo.
    id = Column(Integer, primary_key=True, index=True)

    # Nombre del objetivo.
    name = Column(String(150), nullable=False)

    # Sucursal relacionada con el objetivo.
    branch_id = Column(
        Integer,
        ForeignKey("branches.id"),
        nullable=True,
    )

    # Producto relacionado con el objetivo.
    product_id = Column(
        Integer,
        ForeignKey("products.id"),
        nullable=True,
    )

    # Valor numérico objetivo.
    value = Column(Float, nullable=False)