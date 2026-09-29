# ============================================================
# MatrixFlow Enterprise
# Modelos de matrices
# ============================================================
#
# Este archivo contiene los modelos correspondientes a:
#
# 1. matrices
# 2. matrix_values
#
# La estructura se basa directamente en las tablas reales
# de PostgreSQL.
# ============================================================

from sqlalchemy import Column, ForeignKey, Integer, Numeric, String

from app.core.database import Base


class Matrix(Base):
    """
    Representa una matriz matemática perteneciente a una empresa.
    """

    # Nombre exacto de la tabla en PostgreSQL.
    __tablename__ = "matrices"

    # Identificador único de la matriz.
    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # Empresa propietaria de la matriz.
    # Relación: matrices.company_id -> companies.id
    company_id = Column(
        Integer,
        ForeignKey("companies.id"),
        nullable=False,
    )

    # Nombre utilizado para identificar la matriz.
    name = Column(
        String(150),
        nullable=False,
    )

    # Descripción opcional de la matriz.
    description = Column(
        String(255),
        nullable=True,
    )

    # Cantidad de filas de la matriz.
    rows = Column(
        Integer,
        nullable=False,
    )

    # Cantidad de columnas de la matriz.
    columns = Column(
        Integer,
        nullable=False,
    )


class MatrixValue(Base):
    """
    Representa un valor individual dentro de una matriz.
    """

    # Nombre exacto de la tabla en PostgreSQL.
    __tablename__ = "matrix_values"

    # Identificador único del valor.
    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # Matriz a la que pertenece este valor.
    # Relación: matrix_values.matrix_id -> matrices.id
    matrix_id = Column(
        Integer,
        ForeignKey("matrices.id"),
        nullable=False,
    )

    # Número de fila donde se encuentra el valor.
    row = Column(
        Integer,
        nullable=False,
    )

    # Número de columna donde se encuentra el valor.
    column = Column(
        Integer,
        nullable=False,
    )

    # Valor numérico almacenado en la matriz.
    #
    # PostgreSQL utiliza NUMERIC(15,4), por lo que usamos
    # Numeric para conservar precisión decimal.
    value = Column(
        Numeric(15, 4),
        nullable=False,
    )