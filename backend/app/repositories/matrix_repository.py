# Este archivo contiene las consultas relacionadas con las matrices.
# Permite guardar una matriz y consultar cada uno de sus valores.

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

    # Buscamos la matriz por ID.
    return (
        db.query(Matrix)
        .filter(Matrix.id == matrix_id)
        .first()
    )


def get_matrix_values(db: Session, matrix_id: int):
    """
    Obtiene todos los valores de una matriz.
    """

    # Consultamos los valores de la matriz.
    # Primero ordenamos por fila y después por columna.
    return (
        db.query(MatrixValue)
        .filter(MatrixValue.matrix_id == matrix_id)
        .order_by(
            MatrixValue.row_index,
            MatrixValue.column_index,
        )
        .all()
    )


def create_matrix(
    db: Session,
    name: str,
    user_id: int | None = None,
):
    """
    Crea el registro principal de una matriz.
    """

    # Creamos la matriz.
    matrix = Matrix(
        name=name,
        user_id=user_id,
    )

    # Agregamos la matriz.
    db.add(matrix)

    # Guardamos los cambios.
    db.commit()

    # Obtenemos el ID generado.
    db.refresh(matrix)

    return matrix


def create_matrix_value(
    db: Session,
    matrix_id: int,
    row_index: int,
    column_index: int,
    value: float,
):
    """
    Guarda un valor individual de una matriz.
    """

    # Creamos el valor indicando fila y columna.
    matrix_value = MatrixValue(
        matrix_id=matrix_id,
        row_index=row_index,
        column_index=column_index,
        value=value,
    )

    # Agregamos el valor.
    db.add(matrix_value)

    # Guardamos los cambios.
    db.commit()

    # Actualizamos el objeto.
    db.refresh(matrix_value)

    return matrix_value