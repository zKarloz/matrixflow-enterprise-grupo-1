# ============================================================
# MatrixFlow Enterprise
# Repositorio de usuarios
# ============================================================
#
# Este archivo contiene las operaciones de acceso a datos
# relacionadas con la tabla "users".
#
# Trabaja únicamente con SQLAlchemy.
# El frontend nunca accede directamente a PostgreSQL/Supabase.
# ============================================================

from sqlalchemy.orm import Session

from app.models.user import User


def get_user_by_id(
    db: Session,
    user_id: int,
):
    """
    Busca un usuario por su identificador.
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
    Busca un usuario por su correo electrónico.
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
    Busca un usuario por su nombre de usuario.
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

    El parámetro "password" debe contener un hash seguro,
    nunca una contraseña en texto plano.
    """

    # Creamos el registro con los campos definidos
    # en el modelo SQLAlchemy de users.
    user = User(
        username=username,
        email=email,
        password=password,
        full_name=full_name,
        role_id=role_id,
        is_active=True,
    )

    # Persistimos el usuario en PostgreSQL.
    db.add(user)
    db.commit()

    # Recuperamos los valores generados por la base de datos,
    # como el identificador del usuario.
    db.refresh(user)

    return user


def update_user(
    db: Session,
    user: User,
    username: str,
    email: str,
    full_name: str,
    role_id: int,
    is_active: bool,
):
    """
    Actualiza los datos administrativos de un usuario.

    La contraseña no se modifica mediante esta función.
    """

    user.username = username
    user.email = email
    user.full_name = full_name
    user.role_id = role_id
    user.is_active = is_active

    # Guardamos los cambios realizados.
    db.commit()

    # Actualizamos el objeto con el estado persistido
    # actualmente en PostgreSQL.
    db.refresh(user)

    return user