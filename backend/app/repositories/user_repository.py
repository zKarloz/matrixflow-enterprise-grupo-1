# Este archivo contiene las funciones que permiten consultar
# y crear usuarios en la base de datos.
#
# IMPORTANTE:
# Este repositorio trabaja únicamente con SQLAlchemy.
# El frontend nunca accede directamente a Supabase.

from sqlalchemy.orm import Session

from app.models.user import User


def get_user_by_id(
    db: Session,
    user_id: int,
):
    """
    Busca un usuario por su ID.

    Parámetros:
        db: sesión activa de SQLAlchemy.
        user_id: identificador del usuario.

    Retorna:
        El usuario encontrado o None si no existe.
    """

    return (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )


def get_user_by_email(
    db: Session,
    email: str,
):
    """
    Busca un usuario utilizando su correo electrónico.

    El correo es único en la tabla users, por lo que
    como máximo debería existir un usuario con ese email.
    """

    return (
        db.query(User)
        .filter(User.email == email)
        .first()
    )


def get_user_by_username(
    db: Session,
    username: str,
):
    """
    Busca un usuario utilizando su nombre de usuario.

    Esto será útil posteriormente si el sistema permite
    iniciar sesión también mediante username.
    """

    return (
        db.query(User)
        .filter(User.username == username)
        .first()
    )


def get_all_users(
    db: Session,
):
    """
    Obtiene todos los usuarios registrados.
    """

    return db.query(User).all()


def create_user(
    db: Session,
    username: str,
    email: str,
    password: str,
    full_name: str,
    role_id: int,
):
    """
    Crea un nuevo usuario.

    IMPORTANTE:
    El parámetro "password" debe recibir un HASH,
    nunca una contraseña en texto plano.

    El hash debe generarse previamente utilizando
    get_password_hash() del módulo de seguridad.
    """

    # Creamos el objeto User utilizando exactamente
    # los nombres de columnas de la BD oficial.
    user = User(
        username=username,
        email=email,
        password=password,
        full_name=full_name,
        role_id=role_id,
        is_active=True,
    )

    # Agregamos el usuario a la sesión.
    db.add(user)

    # Guardamos los cambios en PostgreSQL/Supabase.
    db.commit()

    # Actualizamos el objeto con el ID generado por la BD.
    db.refresh(user)

    return user