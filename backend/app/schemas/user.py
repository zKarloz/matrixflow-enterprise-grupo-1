# ============================================================
# MatrixFlow Enterprise
# Schemas de usuarios
# ============================================================
#
# Estos schemas validan los datos recibidos y devueltos
# por los endpoints del módulo de usuarios.
#
# La contraseña nunca se devuelve mediante la API.
# ============================================================

from pydantic import BaseModel, ConfigDict, EmailStr


# ------------------------------------------------------------
# CREAR USUARIO
# ------------------------------------------------------------

class UserCreate(BaseModel):
    """
    Datos necesarios para registrar una nueva cuenta.
    """

    username: str
    email: EmailStr
    password: str
    full_name: str
    role_id: int


# ------------------------------------------------------------
# ACTUALIZAR USUARIO
# ------------------------------------------------------------

class UserUpdate(BaseModel):
    """
    Campos administrativos que pueden modificarse.

    No incluimos la contraseña porque posteriormente
    tendrá un endpoint independiente.
    """

    username: str
    email: EmailStr
    full_name: str
    role_id: int
    is_active: bool


# ------------------------------------------------------------
# RESPUESTA PÚBLICA
# ------------------------------------------------------------

class UserResponse(BaseModel):
    """
    Información pública de una cuenta.

    La contraseña y su hash nunca forman parte de
    las respuestas del backend.
    """

    id: int
    username: str
    email: EmailStr
    full_name: str
    is_active: bool
    role_id: int

    model_config = ConfigDict(
        from_attributes=True,
    )