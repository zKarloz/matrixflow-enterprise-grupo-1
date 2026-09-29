# Este archivo contiene los endpoints relacionados con usuarios.
#
# La comunicación sigue esta arquitectura:
#
# React
#   ↓ HTTP/JSON
# FastAPI
#   ↓
# Repository
#   ↓
# SQLAlchemy
#   ↓
# PostgreSQL / Supabase
#
# El frontend nunca accede directamente a Supabase.


from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_password_hash, require_roles
from app.repositories.user_repository import create_user, get_all_users
from app.schemas.user import UserCreate, UserResponse


# ------------------------------------------------------------
# Router del módulo de usuarios
# ------------------------------------------------------------

router = APIRouter(
    prefix="/users",
    tags=["Usuarios"],
)


# ------------------------------------------------------------
# Obtener todos los usuarios
# ------------------------------------------------------------

@router.get(
    "",
    response_model=list[UserResponse],
)
def get_users(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Administrador")
    ),
):
    """
    Obtiene todos los usuarios registrados.

    La contraseña y su hash no se devuelven porque
    UserResponse no contiene ese campo.
    """

    # Consultamos los usuarios mediante el repository.
    return get_all_users(db)


# ------------------------------------------------------------
# Crear usuario
# ------------------------------------------------------------

@router.post(
    "",
    response_model=UserResponse,
    status_code=201,
)
def create_new_user(
    data: UserCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Administrador")
    ),
):
    """
    Crea un nuevo usuario.

    El proceso es:

        contraseña recibida
              ↓
        bcrypt / hash
              ↓
        users.password
              ↓
        PostgreSQL / Supabase

    La contraseña original nunca se almacena.
    """

    # --------------------------------------------------------
    # 1. Convertir la contraseña en un hash seguro
    # --------------------------------------------------------

    # IMPORTANTE:
    # Nunca guardamos data.password directamente.
    password_hash = get_password_hash(
        data.password
    )

    # --------------------------------------------------------
    # 2. Crear el usuario
    # --------------------------------------------------------

    try:
        user = create_user(
            db=db,
            username=data.username,
            email=data.email,
            password=password_hash,
            full_name=data.full_name,
            role_id=data.role_id,
        )

    except IntegrityError:
        # Si username o email ya existen, PostgreSQL
        # rechazará la operación debido a sus restricciones
        # UNIQUE.
        db.rollback()

        raise HTTPException(
            status_code=409,
            detail=(
                "El nombre de usuario o correo electrónico "
                "ya está registrado."
            ),
        )

    # --------------------------------------------------------
    # 3. Devolver únicamente información pública
    # --------------------------------------------------------

    return user