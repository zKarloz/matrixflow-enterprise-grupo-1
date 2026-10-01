# Este archivo contiene la lógica principal del inicio de sesión.
#
# El servicio recibe los datos enviados por la ruta de autenticación,
# consulta al usuario mediante el repositorio y verifica:
#
# 1. Que el correo exista.
# 2. Que el usuario esté activo.
# 3. Que la contraseña sea correcta.
# 4. Que el usuario tenga un rol válido.

import ipaddress

import httpx

from sqlalchemy.orm import Session

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

def geolocate_ip(ip_address: str) -> dict:
    """
    Obtiene una ubicación aproximada a partir de una IP pública.

    Se utiliza un proveedor principal y uno secundario.
    Si ambos fallan, el inicio de sesión continúa normalmente
    y los datos geográficos se almacenan como NULL.
    """

    empty_location = {
        "city": None,
        "region": None,
        "country": None,
        "latitude": None,
        "longitude": None,
    }

    # --------------------------------------------------------
    # Validar que la IP recibida sea pública
    # --------------------------------------------------------

    try:
        ip = ipaddress.ip_address(
            ip_address,
        )

        print(
            f"[GEO] IP recibida: {ip_address} | "
            f"is_global={ip.is_global}"
        )

        # Las direcciones privadas, locales o reservadas
        # no tienen una geolocalización pública útil.
        if not ip.is_global:
            print(
                "[GEO] La IP no es pública."
            )

            return empty_location

    except ValueError:
        print(
            f"[GEO] IP inválida: {ip_address}"
        )

        return empty_location

    # ========================================================
    # PROVEEDOR PRINCIPAL: FreeIPAPI
    # ========================================================

    try:
        response = httpx.get(
            (
                "https://free.freeipapi.com/"
                f"api/v1/json/{ip_address}"
            ),
            timeout=5.0,
            follow_redirects=True,
            headers={
                "User-Agent":
                    "MatrixFlow-Enterprise/1.0",
            },
        )

        print(
            "[GEO] FreeIPAPI HTTP:",
            response.status_code,
        )

        response.raise_for_status()

        data = response.json()

        location = {
            "city":
                data.get("cityName"),
            "region":
                data.get("regionName"),
            "country":
                data.get("countryName"),
            "latitude":
                data.get("latitude"),
            "longitude":
                data.get("longitude"),
        }

        # Si recibimos país o coordenadas,
        # consideramos válida la geolocalización.
        if (
            location["country"]
            or (
                location["latitude"] is not None
                and
                location["longitude"] is not None
            )
        ):
            print(
                "[GEO] Ubicación obtenida "
                "con FreeIPAPI:",
                location,
            )

            return location

        print(
            "[GEO] FreeIPAPI respondió "
            "sin ubicación útil."
        )

    except (
        httpx.HTTPError,
        ValueError,
        TypeError,
    ) as error:
        print(
            f"[GEO] FreeIPAPI falló: {error}"
        )

    # ========================================================
    # PROVEEDOR SECUNDARIO: ipwho.is
    # ========================================================

    try:
        response = httpx.get(
            f"https://ipwho.is/{ip_address}",
            timeout=5.0,
            follow_redirects=True,
            headers={
                "User-Agent":
                    "MatrixFlow-Enterprise/1.0",
            },
        )

        print(
            "[GEO] ipwho.is HTTP:",
            response.status_code,
        )

        response.raise_for_status()

        data = response.json()

        if data.get("success") is not True:
            print(
                "[GEO] ipwho.is no pudo "
                "geolocalizar la IP."
            )

            return empty_location

        location = {
            "city":
                data.get("city"),
            "region":
                data.get("region"),
            "country":
                data.get("country"),
            "latitude":
                data.get("latitude"),
            "longitude":
                data.get("longitude"),
        }

        print(
            "[GEO] Ubicación obtenida "
            "con ipwho.is:",
            location,
        )

        return location

    except (
        httpx.HTTPError,
        ValueError,
        TypeError,
    ) as error:
        print(
            f"[GEO] ipwho.is falló: {error}"
        )

        # La geolocalización nunca debe impedir
        # que un usuario válido pueda iniciar sesión.
        return empty_location