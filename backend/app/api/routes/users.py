# ============================================================
# MatrixFlow Enterprise
# Endpoints del módulo de usuarios
# ============================================================
#
# Flujo:
#
# React
#   ↓ HTTP / JSON
# FastAPI
#   ↓
# Repository
#   ↓
# SQLAlchemy
#   ↓
# PostgreSQL / Supabase
#
# El frontend nunca accede directamente a Supabase.
# ============================================================

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_password_hash, require_roles
from app.repositories.user_repository import (
    create_user,
    get_all_users,
    get_user_by_id,
    update_user,
)
from app.schemas.user import (
    UserCreate,
    UserResponse,
    UserUpdate,
)


router = APIRouter(
    prefix="/users",
    tags=["Usuarios"],
)


# ------------------------------------------------------------
# OBTENER USUARIOS
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

    La contraseña y su hash nunca se devuelven.
    """

    return get_all_users(db)


# ------------------------------------------------------------
# CREAR USUARIO
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
    Registra una nueva cuenta de usuario.

    La contraseña recibida se convierte en un hash
    antes de almacenarse en PostgreSQL.
    """

    # La contraseña en texto plano nunca se almacena.
    password_hash = get_password_hash(
        data.password
    )

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
        # PostgreSQL impide usernames y correos duplicados
        # mediante restricciones UNIQUE.
        db.rollback()

        raise HTTPException(
            status_code=409,
            detail=(
                "El nombre de usuario o correo electrónico "
                "ya está registrado."
            ),
        )

    return user


# ------------------------------------------------------------
# ACTUALIZAR USUARIO
# ------------------------------------------------------------

@router.patch(
    "/{user_id}",
    response_model=UserResponse,
)
def update_existing_user(
    user_id: int,
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Administrador")
    ),
):
    """
    Actualiza una cuenta existente.

    Permite modificar:
    - nombre completo
    - nombre de usuario
    - correo electrónico
    - rol
    - estado activo/inactivo

    La contraseña se gestionará mediante otra operación.
    """

    # Buscamos el usuario antes de modificarlo.
    user = get_user_by_id(
        db,
        user_id,
    )

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="El usuario no existe.",
        )

    try:
        return update_user(
            db=db,
            user=user,
            username=data.username,
            email=data.email,
            full_name=data.full_name,
            role_id=data.role_id,
            is_active=data.is_active,
        )

    except IntegrityError:
        # Puede ocurrir si el nuevo username o correo
        # pertenece a otra cuenta.
        db.rollback()

        raise HTTPException(
            status_code=409,
            detail=(
                "El nombre de usuario o correo electrónico "
                "ya está registrado."
            ),
        )