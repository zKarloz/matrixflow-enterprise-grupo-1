# Este archivo contiene la lógica de negocio relacionada con matrices.
# Coordina el registro de la matriz y sus valores individuales.

from sqlalchemy.orm import Session

from app.repositories.matrix_repository import (
    create_matrix,
    create_matrix_value,
    get_all_matrices,
    get_matrix_by_id,
    get_matrix_values,
)


def list_matrices(db: Session):
    """
    Obtiene todas las matrices registradas.
    """

    # Consultamos todas las matrices.
    return get_all_matrices(db)


def get_matrix(
    db: Session,
    matrix_id: int,
):
    """
    Obtiene una matriz y sus valores.
    """

    # Buscamos la matriz principal.
    matrix = get_matrix_by_id(
        db,
        matrix_id,
    )

    # Validamos que exista.
    if matrix is None:
        raise ValueError("La matriz no existe.")

    # Consultamos sus valores.
    values = get_matrix_values(
        db,
        matrix_id,
    )

    return matrix, values


def register_matrix(
    db: Session,
    name: str,
    values: list[list[float]],
    user_id: int | None = None,
):
    """
    Registra una matriz junto con sus valores.
    """

    # Validamos el nombre.
    if not name.strip():
        raise ValueError(
            "El nombre de la matriz es obligatorio."
        )

    # Una matriz debe tener al menos una fila.
    if not values:
        raise ValueError(
            "La matriz debe contener al menos una fila."
        )

    # Todas las filas deben tener la misma cantidad de columnas.
    column_count = len(values[0])

    if column_count == 0:
        raise ValueError(
            "La matriz debe contener al menos una columna."
        )

    for row in values:
        if len(row) != column_count:
            raise ValueError(
                "Todas las filas de la matriz deben tener la misma cantidad de columnas."
            )

    # Creamos el registro principal.
    matrix = create_matrix(
        db=db,
        name=name,
        user_id=user_id,
    )

    # Guardamos cada elemento indicando su fila y columna.
    for row_index, row in enumerate(values):
        for column_index, value in enumerate(row):
            create_matrix_value(
                db=db,
                matrix_id=matrix.id,
                row_index=row_index,
                column_index=column_index,
                value=value,
            )

    return matrix