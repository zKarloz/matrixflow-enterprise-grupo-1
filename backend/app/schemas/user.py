# Este archivo contiene los schemas Pydantic relacionados
# con los usuarios de MatrixFlow Enterprise.
#
# Los schemas sirven para:
# - Validar los datos que recibe FastAPI.
# - Definir qué información devuelve la API.
# - Evitar exponer información sensible como contraseñas
#   o hashes de contraseñas.


from pydantic import BaseModel, EmailStr, ConfigDict


# ------------------------------------------------------------
# Schema para crear un usuario
# ------------------------------------------------------------

class UserCreate(BaseModel):
    """
    Datos necesarios para registrar un nuevo usuario.

    La contraseña se recibe temporalmente en texto plano
    únicamente para poder generar su hash.
    Nunca debe almacenarse directamente en la BD.
    """

    # Nombre de usuario único.
    username: str

    # Correo electrónico único.
    email: EmailStr

    # Contraseña que posteriormente será convertida
    # en un hash mediante bcrypt.
    password: str

    # Nombre completo del usuario.
    full_name: str

    # Identificador del rol que tendrá el usuario.
    role_id: int


# ------------------------------------------------------------
# Schema para devolver información de un usuario
# ------------------------------------------------------------

class UserResponse(BaseModel):
    """
    Información pública de un usuario.

    IMPORTANTE:
    No incluimos "password" porque nunca debemos devolver
    la contraseña ni su hash mediante la API.
    """

    # Identificador del usuario.
    id: int

    # Nombre de usuario.
    username: str

    # Correo electrónico.
    email: EmailStr

    # Nombre completo.
    full_name: str

    # Estado de la cuenta.
    is_active: bool

    # Identificador del rol.
    role_id: int

    # Permite que Pydantic pueda convertir directamente
    # objetos SQLAlchemy en este schema.
    model_config = ConfigDict(
        from_attributes=True,
    )