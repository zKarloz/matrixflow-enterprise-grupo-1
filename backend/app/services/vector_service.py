# Este archivo contiene la lógica de negocio relacionada con vectores.
# Coordina los schemas, repositories y posteriormente los algoritmos
# matemáticos utilizados por MatrixFlow Enterprise.

from sqlalchemy.orm import Session

from app.repositories.vector_repository import (
    create_vector,
    create_vector_value,
    get_all_vectors,
    get_vector_by_id,
    get_vector_values,
)


def list_vectors(db: Session):
    """
    Obtiene todos los vectores registrados.
    """

    # Consultamos los vectores mediante el repository.
    return get_all_vectors(db)


def get_vector(
    db: Session,
    vector_id: int,
):
    """
    Obtiene un vector y sus valores.
    """

    # Buscamos el vector principal.
    vector = get_vector_by_id(db, vector_id)

    # Validamos que exista.
    if vector is None:
        raise ValueError("El vector no existe.")

    # Obtenemos los valores almacenados.
    values = get_vector_values(
        db,
        vector_id,
    )

    return vector, values


def register_vector(
    db: Session,
    name: str,
    values: list[float],
    user_id: int | None = None,
):
    """
    Registra un vector junto con todos sus valores.
    """

    # Validamos el nombre.
    if not name.strip():
        raise ValueError(
            "El nombre del vector es obligatorio."
        )

    # Un vector debe contener al menos un valor.
    if not values:
        raise ValueError(
            "El vector debe contener al menos un valor."
        )

    # Primero creamos el registro principal.
    vector = create_vector(
        db=db,
        name=name,
        user_id=user_id,
    )

    # Guardamos cada elemento con su posición.
    for position, value in enumerate(values):
        create_vector_value(
            db=db,
            vector_id=vector.id,
            position=position,
            value=value,
        )

    return vector