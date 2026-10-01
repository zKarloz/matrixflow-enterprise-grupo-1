# Este archivo contiene la lógica principal del inicio de sesión.
#
# El servicio recibe los datos enviados por la ruta de autenticación,
# consulta al usuario mediante el repositorio y verifica:
#
# 1. Que el correo exista.
# 2. Que el usuario esté activo.
# 3. Que la contraseña sea correcta.
# 4. Que el usuario tenga un rol válido.


from sqlalchemy.orm import Session

from app.core.security import verify_password
from app.models.role import Role
from app.repositories.user_repository import get_user_by_email


def find_user_for_login(
    db: Session,
    email: str,
    password: str,
):
    """
    Busca y valida un usuario para iniciar sesión.

    Parámetros:
        db:
            Sesión activa de SQLAlchemy.

        email:
            Correo electrónico enviado durante el login.

        password:
            Contraseña en texto plano enviada por el usuario.
            Esta contraseña solamente se utiliza para compararla
            contra el hash almacenado en la base de datos.

    Retorna:
        Una tupla con:
            (usuario, rol)

    Lanza:
        ValueError cuando las credenciales no son válidas
        o el usuario no puede iniciar sesión.
    """

    # Comprobamos que el correo no esté vacío.
    if not email.strip():
        raise ValueError(
            "El correo electrónico es obligatorio."
        )

    # Buscamos al usuario mediante el repositorio.
    user = get_user_by_email(
        db,
        email,
    )

    # Si no existe, no revelamos información adicional.
    # Utilizamos un mensaje genérico por seguridad.
    if user is None:
        raise ValueError(
            "Las credenciales no son válidas."
        )

    # Comprobamos si la cuenta está habilitada.
    #
    # Esto permite que un administrador pueda desactivar
    # un usuario sin eliminarlo de la base de datos.
    if not user.is_active:
        raise ValueError(
            "El usuario está desactivado."
        )

    # Verificamos la contraseña recibida contra el HASH
    # almacenado en la columna users.password.
    password_valid = verify_password(
        password,
        user.password,
    )

    # Si la contraseña no coincide, rechazamos el login.
    if not password_valid:
        raise ValueError(
            "Las credenciales no son válidas."
        )

    # Buscamos el rol asociado al usuario.
    #
    # users.role_id -> roles.id
    role = (
        db.query(Role)
        .filter(Role.id == user.role_id)
        .first()
    )

    # Si el usuario tiene un role_id que no corresponde
    # con ningún registro de roles, no permitimos el login.
    if role is None:
        raise ValueError(
            "El usuario no tiene un rol válido."
        )

    # Si todas las comprobaciones fueron correctas,
    # devolvemos el usuario y su rol.
    return user, role

# ============================================================
# Geolocalización aproximada de accesos
# ============================================================

import ipaddress

import httpx


def geolocate_ip(ip_address: str) -> dict:
    """
    Obtiene una ubicación aproximada a partir de una IP pública.

    La geolocalización es complementaria:
    si el servicio externo falla, el inicio de sesión
    debe continuar funcionando normalmente.
    """

    empty_location = {
        "city": None,
        "region": None,
        "country": None,
        "latitude": None,
        "longitude": None,
    }

    try:
        # Validamos primero que realmente tengamos
        # una dirección IPv4 o IPv6.
        ip = ipaddress.ip_address(
            ip_address,
        )

        # Direcciones locales, privadas o reservadas no tienen
        # una ubicación pública útil para este módulo.
        if not ip.is_global:
            return empty_location

    except ValueError:
        return empty_location

    try:
        # Realizamos una consulta breve para no retrasar
        # demasiado el proceso de autenticación.
        response = httpx.get(
            f"https://ipwho.is/{ip_address}",
            timeout=3.0,
        )

        response.raise_for_status()

        data = response.json()

        # ipwho.is puede responder HTTP 200 incluso cuando
        # la IP no pudo localizarse.
        if data.get("success") is not True:
            return empty_location

        return {
            "city": data.get("city"),
            "region": data.get("region"),
            "country": data.get("country"),
            "latitude": data.get("latitude"),
            "longitude": data.get("longitude"),
        }

    except (
        httpx.HTTPError,
        ValueError,
        TypeError,
    ):
        # La autenticación nunca debe fallar solamente
        # porque el proveedor de geolocalización no responda.
        return empty_location