# ============================================================
# MatrixFlow Enterprise
# Service de vectores
# ============================================================
# Este archivo contiene la lógica de negocio relacionada
# con el registro y consulta de vectores.
# ============================================================

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

    # Delegamos la consulta al repository.
    return get_all_vectors(db)


def get_vector(
    db: Session,
    vector_id: int,
):
    """
    Obtiene un vector y sus valores.
    """

    # Buscamos el vector principal.
    vector = get_vector_by_id(
        db,
        vector_id,
    )

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
    company_id: int,
    name: str,
    values: list[float],
    description: str | None = None,
):
    """
    Registra un vector junto con todos sus valores.
    """

    # Validamos que exista una empresa válida.
    if company_id <= 0:
        raise ValueError(
            "La empresa del vector no es válida."
        )

    # Validamos que el nombre tenga contenido.
    if not name.strip():
        raise ValueError(
            "El nombre del vector es obligatorio."
        )

    # Un vector debe contener al menos un valor.
    if not values:
        raise ValueError(
            "El vector debe contener al menos un valor."
        )

    # La dimensión corresponde a la cantidad
    # de elementos recibidos.
    dimension = len(values)

    # Creamos el registro principal del vector.
    vector = create_vector(
        db=db,
        company_id=company_id,
        name=name,
        description=description,
        dimension=dimension,
    )

    # Guardamos cada elemento junto con su posición.
    for position, value in enumerate(values):

        # "position" y "value" corresponden a las
        # columnas reales de vector_values.
        create_vector_value(
            db=db,
            vector_id=vector.id,
            position=position,
            value=value,
        )

    return vector