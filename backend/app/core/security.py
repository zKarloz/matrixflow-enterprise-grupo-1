# ============================================================
# MatrixFlow Enterprise
# Seguridad de la aplicación
# ============================================================
#
# Este archivo centraliza las funciones relacionadas con:
# - Contraseñas
# - Hash de contraseñas
# - Tokens JWT
# - Lectura de información del usuario desde el token
#
# La autenticación y autorización forman parte de la seguridad
# definida para MatrixFlow Enterprise.
# ============================================================

from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings


# ------------------------------------------------------------
# Configuración del hash de contraseñas
# ------------------------------------------------------------

# bcrypt permite almacenar las contraseñas como hashes.
# Nunca debemos guardar las contraseñas directamente.
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)


# ------------------------------------------------------------
# Configuración JWT
# ------------------------------------------------------------

# Clave utilizada para firmar los tokens.
#
# IMPORTANTE:
# En desarrollo usamos una clave de configuración.
# Cuando conectemos el proyecto al entorno real,
# esta clave deberá estar definida mediante variables de entorno.
SECRET_KEY = getattr(
    settings,
    "SECRET_KEY",
    "matrixflow-clave-secreta-desarrollo",
)

# Algoritmo utilizado para firmar los tokens JWT.
ALGORITHM = "HS256"

# Tiempo de duración del token.
ACCESS_TOKEN_EXPIRE_MINUTES = 60


# ------------------------------------------------------------
# Contraseñas
# ------------------------------------------------------------

def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    """
    Comprueba si una contraseña coincide con su hash.

    Parámetros:
        plain_password:
            Contraseña introducida por el usuario.

        hashed_password:
            Hash almacenado en la base de datos.

    Retorna:
        True si coinciden.
        False si no coinciden.
    """

    return pwd_context.verify(
        plain_password,
        hashed_password,
    )


def get_password_hash(password: str) -> str:
    """
    Genera un hash seguro para una contraseña.

    El resultado es el valor que posteriormente
    debemos almacenar en la base de datos.
    """

    return pwd_context.hash(password)


# ------------------------------------------------------------
# Tokens JWT
# ------------------------------------------------------------

def create_access_token(
    data: Dict[str, Any],
    expires_delta: Optional[timedelta] = None,
) -> str:
    """
    Crea un token JWT firmado.

    'data' contiene la información que queremos transportar
    dentro del token, por ejemplo:

        {
            "sub": "1",
            "role": "Administrador"
        }

    expires_delta permite establecer cuánto tiempo
    será válido el token.
    """

    # Copiamos los datos para no modificar el diccionario original.
    to_encode = data.copy()

    # Calculamos la fecha de expiración.
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )

    # Añadimos la fecha de expiración al token.
    to_encode.update(
        {
            "exp": expire,
        }
    )

    # Firmamos y generamos el JWT.
    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )

    return encoded_jwt


# ------------------------------------------------------------
# Decodificación de tokens
# ------------------------------------------------------------

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Decodifica y valida un token JWT.

    Si el token es válido, devuelve su contenido.

    Si el token está:
        - manipulado,
        - expirado,
        - mal formado,

    devuelve None.
    """

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        return payload

    except JWTError:
        # El token no pudo validarse correctamente.
        return None