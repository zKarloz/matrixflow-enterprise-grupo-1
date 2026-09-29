# ============================================================
# MatrixFlow Enterprise
# Modelos de operaciones matemáticas
# ============================================================
#
# Este archivo contiene los modelos correspondientes a:
#
# 1. operations
# 2. operation_inputs
# 3. operation_results
#
# La estructura se basa directamente en las tablas reales
# de PostgreSQL.
# ============================================================

from sqlalchemy import Column, ForeignKey, Integer, Numeric, String, Text

from app.core.database import Base


class Operation(Base):
    """
    Representa una operación matemática registrada.
    """

    # Nombre exacto de la tabla en PostgreSQL.
    __tablename__ = "operations"

    # Identificador único de la operación.
    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # Empresa propietaria de la operación.
    # Relación: operations.company_id -> companies.id
    company_id = Column(
        Integer,
        ForeignKey("companies.id"),
        nullable=False,
    )

    # Nombre descriptivo de la operación.
    name = Column(
        String(150),
        nullable=False,
    )

    # Tipo de operación matemática.
    # Ejemplos: suma, resta, multiplicación, etc.
    operation_type = Column(
        String(50),
        nullable=False,
    )

    # Descripción opcional de la operación.
    description = Column(
        Text,
        nullable=True,
    )


class OperationInput(Base):
    """
    Representa una entrada utilizada por una operación.
    """

    # Nombre exacto de la tabla en PostgreSQL.
    __tablename__ = "operation_inputs"

    # Identificador único de la entrada.
    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # Operación a la que pertenece esta entrada.
    # Relación: operation_inputs.operation_id -> operations.id
    operation_id = Column(
        Integer,
        ForeignKey("operations.id"),
        nullable=False,
    )

    # Matriz utilizada como entrada.
    #
    # Es opcional porque una entrada puede ser un vector.
    # Relación: operation_inputs.matrix_id -> matrices.id
    matrix_id = Column(
        Integer,
        ForeignKey("matrices.id"),
        nullable=True,
    )

    # Vector utilizado como entrada.
    #
    # También es opcional porque una entrada puede ser una matriz.
    # Relación: operation_inputs.vector_id -> vectors.id
    vector_id = Column(
        Integer,
        ForeignKey("vectors.id"),
        nullable=True,
    )

    # Nombre asignado a la entrada.
    input_name = Column(
        String(100),
        nullable=False,
    )

    # Tipo de entrada.
    # Permite distinguir, por ejemplo, matriz o vector.
    input_type = Column(
        String(30),
        nullable=False,
    )


class OperationResult(Base):
    """
    Representa el resultado asociado a una operación.
    """

    # Nombre exacto de la tabla en PostgreSQL.
    __tablename__ = "operation_results"

    # Identificador único del resultado.
    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # Operación que generó este resultado.
    # Relación: operation_results.operation_id -> operations.id
    operation_id = Column(
        Integer,
        ForeignKey("operations.id"),
        nullable=False,
    )

    # Matriz resultante, si corresponde.
    # Relación: operation_results.matrix_id -> matrices.id
    matrix_id = Column(
        Integer,
        ForeignKey("matrices.id"),
        nullable=True,
    )

    # Vector resultante, si corresponde.
    # Relación: operation_results.vector_id -> vectors.id
    vector_id = Column(
        Integer,
        ForeignKey("vectors.id"),
        nullable=True,
    )

    # Tiempo empleado durante la ejecución de la operación.
    #
    # PostgreSQL utiliza NUMERIC(10,4).
    execution_time = Column(
        Numeric(10, 4),
        nullable=True,
    )