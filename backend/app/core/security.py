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

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.repositories.user_repository import get_user_by_id


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
# La clave secreta se obtiene obligatoriamente desde .env
# mediante la configuración central de MatrixFlow.
SECRET_KEY = settings.SECRET_KEY

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
    dentro del token.

    Por ejemplo:

        {
            "sub": "1",
            "role": "Administrador"
        }
    """

    # Copiamos los datos para no modificar
    # el diccionario original.
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

def decode_access_token(
    token: str,
) -> Optional[Dict[str, Any]]:
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
        # Intentamos validar la firma y el contenido del JWT.
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        return payload

    except JWTError:
        # El token no pudo validarse correctamente.
        return None


# ============================================================
# Usuario autenticado
# ============================================================

# ------------------------------------------------------------
# Esquema de autenticación Bearer
# ------------------------------------------------------------

# HTTPBearer permite recibir tokens mediante el encabezado:
#
# Authorization: Bearer <token>
#
# FastAPI extrae automáticamente el token enviado
# por el cliente.
security_scheme = HTTPBearer()


# ------------------------------------------------------------
# Obtener usuario autenticado
# ------------------------------------------------------------

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(
        security_scheme
    ),
    db: Session = Depends(get_db),
):
    """
    Obtiene el usuario autenticado a partir del JWT.

    El proceso es:

    1. Recibir el token Bearer.
    2. Validar y decodificar el JWT.
    3. Obtener el identificador del usuario desde "sub".
    4. Buscar el usuario en PostgreSQL.
    5. Verificar que el usuario exista.
    6. Verificar que el usuario esté activo.
    7. Devolver el usuario autenticado.
    """

    # --------------------------------------------------------
    # 1. Obtener el token enviado por el cliente
    # --------------------------------------------------------

    # HTTPBearer ya separó "Bearer" del token.
    token = credentials.credentials

    # --------------------------------------------------------
    # 2. Validar y decodificar el JWT
    # --------------------------------------------------------

    payload = decode_access_token(token)

    # Si el token no pudo validarse, rechazamos la petición.
    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="El token no es válido o ha expirado.",
            headers={
                "WWW-Authenticate": "Bearer"
            },
        )

    # --------------------------------------------------------
    # 3. Obtener el ID del usuario desde "sub"
    # --------------------------------------------------------

    # En login guardamos el ID como:
    #
    # "sub": str(user.id)
    #
    # Por eso ahora esperamos encontrarlo en el payload.
    subject = payload.get("sub")

    # Si el token no contiene "sub", no podemos saber
    # qué usuario está realizando la petición.
    if subject is None:
        raise HTTPException(
            status_code=401,
            detail="El token no contiene un usuario válido.",
            headers={
                "WWW-Authenticate": "Bearer"
            },
        )

    # --------------------------------------------------------
    # 4. Convertir "sub" a número entero
    # --------------------------------------------------------

    try:
        # El JWT almacena el ID como texto.
        # Lo convertimos al tipo utilizado por PostgreSQL.
        user_id = int(subject)

    except (TypeError, ValueError):
        # Evitamos consultar la base de datos
        # utilizando un identificador inválido.
        raise HTTPException(
            status_code=401,
            detail="El identificador del usuario no es válido.",
            headers={
                "WWW-Authenticate": "Bearer"
            },
        )

    # --------------------------------------------------------
    # 5. Buscar el usuario en PostgreSQL
    # --------------------------------------------------------

    # Reutilizamos el repository existente.
    user = get_user_by_id(
        db,
        user_id,
    )

    # Si el usuario ya no existe, el token no puede
    # utilizarse para acceder al sistema.
    if user is None:
        raise HTTPException(
            status_code=401,
            detail="El usuario no existe.",
            headers={
                "WWW-Authenticate": "Bearer"
            },
        )

    # --------------------------------------------------------
    # 6. Comprobar que el usuario esté activo
    # --------------------------------------------------------

    # Aunque el JWT todavía no haya expirado,
    # una cuenta desactivada no debe poder acceder.
    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="El usuario está desactivado.",
        )

    # --------------------------------------------------------
    # 7. Devolver el usuario autenticado
    # --------------------------------------------------------

    # Los endpoints protegidos podrán recibir directamente
    # este objeto User mediante Depends(get_current_user).
    return user

# ============================================================
# Autorizacion mediante roles
# ============================================================


def require_roles(*allowed_roles: str):
    """
    Crea una dependencia de FastAPI que permite acceder
    solamente a los roles indicados.

    Ejemplo de uso dentro de una ruta:

        current_user=Depends(
            require_roles("Administrador", "Analista")
        )

    Los roles se consultan nuevamente en PostgreSQL.
    Esto evita confiar unicamente en el contenido del JWT.
    """

    def role_checker(
        current_user=Depends(get_current_user),
        db: Session = Depends(get_db),
    ):
        """
        Comprueba que el usuario autenticado tenga
        uno de los roles permitidos.
        """

        # Importamos Role aqui para evitar dependencias
        # innecesarias al cargar el modulo de seguridad.
        from app.models.role import Role

        # Buscamos el rol actual del usuario directamente
        # en PostgreSQL utilizando su role_id.
        role = (
            db.query(Role)
            .filter(Role.id == current_user.role_id)
            .first()
        )

        # Si el rol ya no existe, el usuario no puede acceder.
        if role is None:
            raise HTTPException(
                status_code=403,
                detail="El usuario no tiene un rol válido.",
            )

        # Comprobamos que el nombre del rol esté autorizado.
        if role.name not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail="El usuario no tiene permisos para realizar esta acción.",
            )

        # Devolvemos el usuario para que el endpoint pueda utilizarlo.
        return current_user

    return role_checker
