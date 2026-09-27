# Este archivo define los modelos de las tablas "matrices"
# y "matrix_values".
# Permiten almacenar una matriz y cada uno de sus valores.

from sqlalchemy import Column, Float, ForeignKey, Integer, String

from app.core.database import Base


class Matrix(Base):
    """
    Modelo SQLAlchemy correspondiente a la tabla matrices.
    """

    # Nombre de la tabla en PostgreSQL.
    __tablename__ = "matrices"

    # Identificador único de la matriz.
    id = Column(Integer, primary_key=True, index=True)

    # Nombre de la matriz.
    name = Column(String(150), nullable=False)

    # Usuario que creó la matriz.
    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True,
    )


class MatrixValue(Base):
    """
    Modelo SQLAlchemy correspondiente a la tabla matrix_values.
    """

    # Nombre de la tabla en PostgreSQL.
    __tablename__ = "matrix_values"

    # Identificador único del valor.
    id = Column(Integer, primary_key=True, index=True)

    # Matriz a la que pertenece el valor.
    matrix_id = Column(
        Integer,
        ForeignKey("matrices.id"),
        nullable=False,
    )

    # Número de fila donde se encuentra el valor.
    row_index = Column(Integer, nullable=False)

    # Número de columna donde se encuentra el valor.
    column_index = Column(Integer, nullable=False)

    # Valor numérico de la matriz.
    value = Column(Float, nullable=False)