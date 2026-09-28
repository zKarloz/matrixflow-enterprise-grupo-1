# Este archivo define los modelos de las tablas "vectors"
# y "vector_values".
# Permiten almacenar un vector y los valores numéricos que lo componen.

from sqlalchemy import Column, Float, ForeignKey, Integer, String

from app.core.database import Base


class Vector(Base):
    """
    Modelo SQLAlchemy correspondiente a la tabla vectors.
    """

    # Nombre de la tabla en PostgreSQL.
    __tablename__ = "vectors"

    # Identificador único del vector.
    id = Column(Integer, primary_key=True, index=True)

    # Nombre del vector.
    name = Column(String(150), nullable=False)

    # Usuario que creó el vector.
    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True,
    )


class VectorValue(Base):
    """
    Modelo SQLAlchemy correspondiente a la tabla vector_values.
    """

    # Nombre de la tabla en PostgreSQL.
    __tablename__ = "vector_values"

    # Identificador único del valor.
    id = Column(Integer, primary_key=True, index=True)

    # Vector al que pertenece este valor.
    vector_id = Column(
        Integer,
        ForeignKey("vectors.id"),
        nullable=False,
    )

    # Posición que ocupa el valor dentro del vector.
    position = Column(Integer, nullable=False)

    # Valor numérico almacenado.
    value = Column(Float, nullable=False)