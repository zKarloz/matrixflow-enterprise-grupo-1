# Este archivo define los datos que la API utiliza para el inicio de sesión
# y la autenticación de los usuarios de MatrixFlow Enterprise.

from pydantic import BaseModel


class LoginRequest(BaseModel):
    """
    Datos que el usuario envía para iniciar sesión.
    """

    # Correo electrónico utilizado para identificar al usuario.
    email: str

    # Contraseña del usuario.
    password: str


class LoginResponse(BaseModel):
    """
    Respuesta que devuelve la API después de un inicio de sesión correcto.
    """

    # Token que utilizará el frontend para autenticarse
    # en las siguientes peticiones.
    access_token: str

    # Tipo de autenticación utilizado por el token.
    token_type: str = "bearer"