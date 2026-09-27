
# ============================================================
# MatrixFlow Enterprise
# Servicio de autenticación


from sqlalchemy.orm import Session

from app.models.role import Role
from app.repositories.user_repository import get_user_by_email
from app.core.security import verify_password


def find_user_for_login(
    db: Session,
    email: str,
    password: str,
):
    """
    Busca un usuario y verifica sus credenciales.

    Parámetros:
        db:
            Sesión activa de SQLAlchemy.

        email:
            Correo electrónico utilizado para iniciar sesión.

        password:
            Contraseña enviada por el usuario.

    Retorna:
        Una tupla con:
            - usuario
            - rol

    Lanza:
        ValueError si las credenciales no son válidas.
    """

    # --------------------------------------------------------
    # 1. Validar el correo
    # --------------------------------------------------------

    # Comprobamos que el usuario haya enviado un correo.
    if not email.strip():
        raise ValueError(
            "El correo electrónico es obligatorio."
        )

    # --------------------------------------------------------
    # 2. Buscar el usuario
    # --------------------------------------------------------

    # Buscamos el usuario mediante el repository existente.
    user = get_user_by_email(
        db,
        email,
    )

    # Si no existe, no revelamos si el correo está registrado.
    # Esto evita proporcionar información innecesaria a
    # posibles atacantes.
    if user is None:
        raise ValueError(
            "Las credenciales no son válidas."
        )

    # --------------------------------------------------------
    # 3. Verificar la contraseña
    # --------------------------------------------------------

    # Comparamos la contraseña enviada por el usuario
    # contra el hash almacenado en la base de datos.
    password_valid = verify_password(
        password,
        user.password_hash,
    )

    # Si la contraseña no coincide, rechazamos el acceso.
    if not password_valid:
        raise ValueError(
            "Las credenciales no son válidas."
        )

    # --------------------------------------------------------
    # 4. Buscar el rol del usuario
    # --------------------------------------------------------

    # El usuario almacena role_id, mientras que el nombre
    # del rol está almacenado en la tabla roles.
    role = (
        db.query(Role)
        .filter(Role.id == user.role_id)
        .first()
    )

    # Si el usuario tiene un role_id que no corresponde
    # con ningún rol existente, no permitimos continuar.
    if role is None:
        raise ValueError(
            "El usuario no tiene un rol válido."
        )

    # --------------------------------------------------------
    # 5. Devolver información autenticada
    # --------------------------------------------------------

    # Devolvemos ambos objetos para que auth.py pueda
    # construir posteriormente el JWT.
    return user, role

