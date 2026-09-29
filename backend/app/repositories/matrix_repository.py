# ============================================================
# MatrixFlow Enterprise
# Repository de matrices
# ============================================================
# Este archivo contiene las consultas relacionadas con las
# matrices y sus valores.
#
# IMPORTANTE:
# La estructura sigue exactamente el modelo actual de PostgreSQL.
# ============================================================

from sqlalchemy.orm import Session

from app.models.matrix import Matrix, MatrixValue


def get_all_matrices(db: Session):
    """
    Obtiene todas las matrices registradas.
    """

    # Consultamos todas las matrices.
    return db.query(Matrix).all()


def get_matrix_by_id(db: Session, matrix_id: int):
    """
    Obtiene una matriz mediante su identificador.
    """

    # Buscamos la matriz por su ID.
    return (
        db.query(Matrix)
        .filter(Matrix.id == matrix_id)
        .first()
    )


def get_matrix_values(db: Session, matrix_id: int):
    """
    Obtiene todos los valores de una matriz.
    """

    # Consultamos los valores pertenecientes a la matriz.
    # La BD utiliza "row" y "column" para indicar su posición.
    return (
        db.query(MatrixValue)
        .filter(MatrixValue.matrix_id == matrix_id)
        .order_by(
            MatrixValue.row,
            MatrixValue.column,
        )
        .all()
    )


def create_matrix(
    db: Session,
    company_id: int,
    name: str,
    description: str | None,
    rows: int,
    columns: int,
):
    """
    Crea el registro principal de una matriz.
    """

    # Creamos la matriz utilizando exactamente las columnas
    # existentes en PostgreSQL.
    matrix = Matrix(
        company_id=company_id,
        name=name,
        description=description,
        rows=rows,
        columns=columns,
    )

    # Agregamos la matriz a la sesión.
    db.add(matrix)

    # Guardamos los cambios.
    db.commit()

    # Recuperamos los datos generados por la BD.
    db.refresh(matrix)

    return matrix


def create_matrix_value(
    db: Session,
    matrix_id: int,
    row: int,
    column: int,
    value: float,
):
    """
    Guarda un valor individual de una matriz.
    """

    # Creamos el valor utilizando los nombres reales
    # de las columnas de PostgreSQL.
    matrix_value = MatrixValue(
        matrix_id=matrix_id,
        row=row,
        column=column,
        value=value,
    )

    # Agregamos el valor a la sesión.
    db.add(matrix_value)

    # Guardamos los cambios.
    db.commit()

    # Actualizamos el objeto con los datos persistidos.
    db.refresh(matrix_value)

    return matrix_value