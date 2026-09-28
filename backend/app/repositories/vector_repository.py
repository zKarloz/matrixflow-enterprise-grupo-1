# Este archivo contiene las consultas relacionadas con los vectores.
# Permite guardar un vector y consultar sus valores almacenados.

from sqlalchemy.orm import Session

from app.models.vector import Vector, VectorValue


def get_all_vectors(db: Session):
    """
    Obtiene todos los vectores registrados.
    """

    # Consultamos todos los vectores.
    return db.query(Vector).all()


def get_vector_by_id(db: Session, vector_id: int):
    """
    Obtiene un vector mediante su identificador.
    """

    # Buscamos el vector por ID.
    return (
        db.query(Vector)
        .filter(Vector.id == vector_id)
        .first()
    )


def get_vector_values(db: Session, vector_id: int):
    """
    Obtiene los valores que pertenecen a un vector.
    """

    # Consultamos los valores ordenados por su posición.
    return (
        db.query(VectorValue)
        .filter(VectorValue.vector_id == vector_id)
        .order_by(VectorValue.position)
        .all()
    )


def create_vector(
    db: Session,
    name: str,
    user_id: int | None = None,
):
    """
    Crea el registro principal de un vector.
    """

    # Creamos el vector.
    vector = Vector(
        name=name,
        user_id=user_id,
    )

    # Agregamos el vector a la sesión.
    db.add(vector)

    # Guardamos los cambios.
    db.commit()

    # Obtenemos el ID generado.
    db.refresh(vector)

    return vector


def create_vector_value(
    db: Session,
    vector_id: int,
    position: int,
    value: float,
):
    """
    Guarda un valor individual de un vector.
    """

    # Creamos el valor indicando a qué vector pertenece
    # y en qué posición se encuentra.
    vector_value = VectorValue(
        vector_id=vector_id,
        position=position,
        value=value,
    )

    # Agregamos el valor.
    db.add(vector_value)

    # Guardamos los cambios.
    db.commit()

    # Actualizamos el objeto.
    db.refresh(vector_value)

    return vector_value