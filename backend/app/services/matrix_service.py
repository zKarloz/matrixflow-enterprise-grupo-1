# ============================================================
# MatrixFlow Enterprise
# Service de matrices
# ============================================================
# Este archivo contiene la lógica de negocio relacionada
# con el registro y consulta de matrices.
# ============================================================

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

    # Delegamos la consulta al repository.
    return get_all_matrices(db)


def get_matrix(
    db: Session,
    matrix_id: int,
):
    """
    Obtiene una matriz y todos sus valores.
    """

    # Buscamos la matriz principal.
    matrix = get_matrix_by_id(
        db,
        matrix_id,
    )

    # Validamos que la matriz exista.
    if matrix is None:
        raise ValueError("La matriz no existe.")

    # Consultamos los valores asociados.
    values = get_matrix_values(
        db,
        matrix_id,
    )

    return matrix, values


def register_matrix(
    db: Session,
    company_id: int,
    name: str,
    values: list[list[float]],
    description: str | None = None,
):
    """
    Registra una matriz junto con todos sus valores.
    """

    # Validamos que exista un identificador de empresa válido.
    if company_id <= 0:
        raise ValueError(
            "La empresa de la matriz no es válida."
        )

    # Validamos que el nombre tenga contenido.
    if not name.strip():
        raise ValueError(
            "El nombre de la matriz es obligatorio."
        )

    # Una matriz debe tener al menos una fila.
    if not values:
        raise ValueError(
            "La matriz debe contener al menos una fila."
        )

    # Determinamos la cantidad de columnas utilizando
    # la primera fila recibida.
    column_count = len(values[0])

    # Validamos que exista al menos una columna.
    if column_count == 0:
        raise ValueError(
            "La matriz debe contener al menos una columna."
        )

    # Verificamos que todas las filas tengan
    # exactamente la misma cantidad de columnas.
    for row in values:
        if len(row) != column_count:
            raise ValueError(
                "Todas las filas de la matriz deben tener "
                "la misma cantidad de columnas."
            )

    # La cantidad de filas corresponde a la cantidad
    # de listas recibidas.
    row_count = len(values)

    # Creamos el registro principal de la matriz.
    matrix = create_matrix(
        db=db,
        company_id=company_id,
        name=name,
        description=description,
        rows=row_count,
        columns=column_count,
    )

    # Guardamos cada valor indicando su fila y columna.
    for row_index, row_values in enumerate(values):
        for column_index, value in enumerate(row_values):

            # La BD utiliza las columnas "row" y "column".
            create_matrix_value(
                db=db,
                matrix_id=matrix.id,
                row=row_index,
                column=column_index,
                value=value,
            )

    return matrix