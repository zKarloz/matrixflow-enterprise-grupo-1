# ============================================================
# MatrixFlow Enterprise
# Modelos de vectores
# ============================================================
#
# Este archivo contiene los modelos correspondientes a:
#
# 1. vectors
# 2. vector_values
#
# La estructura se basa directamente en las tablas reales
# de PostgreSQL.
# ============================================================

from sqlalchemy import Column, ForeignKey, Integer, Numeric, String, Text

from app.core.database import Base


class Vector(Base):
    """
    Representa un vector matemático perteneciente a una empresa.
    """

    # Nombre exacto de la tabla en PostgreSQL.
    __tablename__ = "vectors"

    # Identificador único del vector.
    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # Empresa propietaria del vector.
    # Relación: vectors.company_id -> companies.id
    company_id = Column(
        Integer,
        ForeignKey("companies.id"),
        nullable=False,
    )

    # Nombre utilizado para identificar el vector.
    name = Column(
        String(150),
        nullable=False,
    )

    # Descripción opcional del vector.
    description = Column(
        String(255),
        nullable=True,
    )

    # Cantidad de elementos que contiene el vector.
    dimension = Column(
        Integer,
        nullable=False,
    )


class VectorValue(Base):
    """
    Representa un elemento individual de un vector.
    """

    # Nombre exacto de la tabla en PostgreSQL.
    __tablename__ = "vector_values"

    # Identificador único del valor.
    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # Vector al que pertenece este valor.
    # Relación: vector_values.vector_id -> vectors.id
    vector_id = Column(
        Integer,
        ForeignKey("vectors.id"),
        nullable=False,
    )

    # Posición del valor dentro del vector.
    position = Column(
        Integer,
        nullable=False,
    )

    # Valor numérico del elemento.
    #
    # PostgreSQL utiliza NUMERIC(15,4), por lo que usamos
    # Numeric para conservar precisión decimal.
    value = Column(
        Numeric(15, 4),
        nullable=False,
    )