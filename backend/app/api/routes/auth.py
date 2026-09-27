
# ============================================================
# MatrixFlow Enterprise
# Ruta de autenticación


from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import create_access_token
from app.schemas.auth import (
    LoginRequest,
    LoginResponse,
)
from app.services.auth_service import find_user_for_login


# ------------------------------------------------------------
# Router de autenticación
# ------------------------------------------------------------

router = APIRouter(
    prefix="/auth",
    tags=["Autenticación"],
)


# ------------------------------------------------------------
# Inicio de sesión
# ------------------------------------------------------------

@router.post(
    "/login",
    response_model=LoginResponse,
)
def login(
    data: LoginRequest,
    db: Session = Depends(get_db),
):
    """
    Autentica un usuario y genera un JWT.

    El usuario debe proporcionar:
        - correo electrónico
        - contraseña

    Si las credenciales son correctas, se devuelve
    un token JWT que posteriormente utilizará el frontend.
    """

    try:
        # ----------------------------------------------------
        # 1. Verificar las credenciales
        # ----------------------------------------------------

        # El servicio busca al usuario, comprueba su contraseña
        # y obtiene el rol asociado.
        user, role = find_user_for_login(
            db,
            data.email,
            data.password,
        )

        # ----------------------------------------------------
        # 2. Generar el JWT
        # ----------------------------------------------------

        # Guardamos dentro del token:
        #
        # sub  -> ID del usuario
        # role -> nombre del rol
        #
        # El campo "sub" se convierte a texto porque es
        # el identificador estándar utilizado por JWT.
        access_token = create_access_token(
            {
                "sub": str(user.id),
                "role": role.name,
            }
        )

        # ----------------------------------------------------
        # 3. Devolver el token
        # ----------------------------------------------------

        return {
            "access_token": access_token,
            "token_type": "bearer",
        }

    except ValueError as error:
        # Si las credenciales no son válidas, devolvemos
        # HTTP 401 Unauthorized.
        raise HTTPException(
            status_code=401,
            detail=str(error),
        )

