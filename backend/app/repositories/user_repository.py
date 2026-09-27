# Este archivo contiene las consultas relacionadas con los usuarios.
# Se utilizará posteriormente para autenticación y control de roles.

from sqlalchemy.orm import Session

from app.models.user import User


def get_user_by_id(db: Session, user_id: int):
    """
    Obtiene un usuario mediante su identificador.
    """

    # Buscamos el usuario por ID.
    return (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )


def get_user_by_email(db: Session, email: str):
    """
    Obtiene un usuario mediante su correo electrónico.
    """

    # El correo será utilizado durante el inicio de sesión.
    return (
        db.query(User)
        .filter(User.email == email)
        .first()
    )


def get_all_users(db: Session):
    """
    Obtiene todos los usuarios registrados.
    """

    # Consultamos todos los usuarios.
    return db.query(User).all()


def create_user(
    db: Session,
    name: str,
    email: str,
    password_hash: str,
    role_id: int,
):
    """
    Crea un nuevo usuario.
    """

    # Creamos el usuario utilizando la contraseña ya convertida
    # previamente a un hash seguro.
    user = User(
        name=name,
        email=email,
        password_hash=password_hash,
        role_id=role_id,
    )

    # Agregamos el usuario a la sesión.
    db.add(user)

    # Guardamos los cambios.
    db.commit()

    # Actualizamos el objeto con el ID generado.
    db.refresh(user)

    return user