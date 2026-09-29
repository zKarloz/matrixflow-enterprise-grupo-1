# ============================================================
# MatrixFlow Enterprise
# Repository de vectores
# ============================================================
# Este archivo contiene las consultas relacionadas con los
# vectores y sus valores.
#
# La estructura utilizada corresponde al esquema actual
# de PostgreSQL.
# ============================================================

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

    # Buscamos el vector por su ID.
    return (
        db.query(Vector)
        .filter(Vector.id == vector_id)
        .first()
    )


def get_vector_values(db: Session, vector_id: int):
    """
    Obtiene los valores que pertenecen a un vector.
    """

    # Consultamos los valores asociados al vector.
    # "position" es una columna válida de PostgreSQL.
    return (
        db.query(VectorValue)
        .filter(VectorValue.vector_id == vector_id)
        .order_by(VectorValue.position)
        .all()
    )


def create_vector(
    db: Session,
    company_id: int,
    name: str,
    description: str | None,
    dimension: int,
):
    """
    Crea el registro principal de un vector.
    """

    # Creamos el vector utilizando las columnas reales
    # de la tabla "vectors".
    vector = Vector(
        company_id=company_id,
        name=name,
        description=description,
        dimension=dimension,
    )

    # Agregamos el vector a la sesión.
    db.add(vector)

    # Guardamos los cambios en PostgreSQL.
    db.commit()

    # Recuperamos el ID generado por la base de datos.
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

    # "position" y "value" sí existen en vector_values,
    # por lo que se mantienen sin cambios.
    vector_value = VectorValue(
        vector_id=vector_id,
        position=position,
        value=value,
    )

    # Agregamos el valor a la sesión.
    db.add(vector_value)

    # Guardamos el valor en PostgreSQL.
    db.commit()

    # Actualizamos el objeto con los datos persistidos.
    db.refresh(vector_value)

    return vector_value