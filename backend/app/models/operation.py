# Este archivo define los modelos de las tablas "operations",
# "operation_inputs" y "operation_results".
# Estas tablas permiten guardar las operaciones matemáticas realizadas,
# sus entradas y los resultados obtenidos.

from sqlalchemy import Column, Float, ForeignKey, Integer, String

from app.core.database import Base


class Operation(Base):
    """
    Modelo SQLAlchemy correspondiente a la tabla operations.
    """

    # Nombre de la tabla en PostgreSQL.
    __tablename__ = "operations"

    # Identificador único de la operación.
    id = Column(Integer, primary_key=True, index=True)

    # Usuario que ejecutó la operación.
    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True,
    )

    # Tipo de operación matemática.
    # Ejemplos: suma, resta, producto punto, transpuesta, etc.
    operation_type = Column(String(50), nullable=False)


class OperationInput(Base):
    """
    Modelo SQLAlchemy correspondiente a la tabla operation_inputs.
    """

    # Nombre de la tabla en PostgreSQL.
    __tablename__ = "operation_inputs"

    # Identificador único de la entrada.
    id = Column(Integer, primary_key=True, index=True)

    # Operación a la que pertenece esta entrada.
    operation_id = Column(
        Integer,
        ForeignKey("operations.id"),
        nullable=False,
    )

    # Posición de la entrada.
    position = Column(Integer, nullable=False)

    # Valor numérico de entrada.
    value = Column(Float, nullable=False)


class OperationResult(Base):
    """
    Modelo SQLAlchemy correspondiente a la tabla operation_results.
    """

    # Nombre de la tabla en PostgreSQL.
    __tablename__ = "operation_results"

    # Identificador único del resultado.
    id = Column(Integer, primary_key=True, index=True)

    # Operación que produjo este resultado.
    operation_id = Column(
        Integer,
        ForeignKey("operations.id"),
        nullable=False,
    )

    # Posición del resultado.
    position = Column(Integer, nullable=False)

    # Valor numérico obtenido.
    value = Column(Float, nullable=False)