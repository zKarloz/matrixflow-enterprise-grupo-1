# ============================================================
# MatrixFlow Enterprise
# Ruta de autenticación
# ============================================================
#
# Esta ruta permite iniciar sesión y generar un token JWT.
#
# Además, registra en audit_logs:
#   - Usuario que inició sesión
#   - Acción realizada
#   - IP desde donde se realizó la conexión
#   - Resultado del acceso
# ============================================================

# Request permite obtener información de la petición HTTP,
# incluyendo la dirección IP del cliente.
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import create_access_token
from app.schemas.auth import LoginRequest, LoginResponse
from app.services.auth_service import find_user_for_login

# Permite registrar el inicio de sesión en audit_logs.
from app.repositories.audit_repository import create_audit_log


router = APIRouter(
    prefix="/auth",
    tags=["Autenticación"],
)


@router.post(
    "/login",
    response_model=LoginResponse,
)
def login(
    request: Request,
    data: LoginRequest,
    db: Session = Depends(get_db),
):
    """
    Autentica un usuario y genera un JWT.

    El usuario debe proporcionar:
        - correo electrónico
        - contraseña

    Si las credenciales son correctas:
        1. Se obtiene el usuario.
        2. Se obtiene la IP del cliente.
        3. Se registra el acceso en audit_logs.
        4. Se genera el JWT.
        5. Se devuelve el token al frontend.
    """

    try:
        # ----------------------------------------------------
        # 1. Verificar las credenciales
        # ----------------------------------------------------

        user, role = find_user_for_login(
            db,
            data.email,
            data.password,
        )

        # ----------------------------------------------------
        # 2. Obtener la IP del cliente
        # ----------------------------------------------------

        # FastAPI obtiene la dirección IP de la conexión HTTP.
        #
        # En desarrollo local normalmente aparecerá:
        # 127.0.0.1
        #
        # Cuando el sistema esté desplegado, aquí podrá aparecer
        # la IP pública del cliente, dependiendo de la configuración
        # del servidor/proxy.
        client_ip = (
            request.client.host
            if request.client
            else "IP desconocida"
        )

        # ----------------------------------------------------
        # 3. Registrar el inicio de sesión
        # ----------------------------------------------------

        # La tabla audit_logs no tiene una columna específica
        # para IP, por lo que guardamos la información dentro
        # de la columna description.
        create_audit_log(
            db=db,
            user_id=user.id,
            action="Inicio de sesión",
            table_name="users",
            record_id=user.id,
            description=(
                f"Inicio de sesión exitoso. "
                f"IP: {client_ip}"
            ),
        )

        # ----------------------------------------------------
        # 4. Generar el JWT
        # ----------------------------------------------------

        access_token = create_access_token(
            {
                "sub": str(user.id),
                "role": role.name,
            }
        )

        # ----------------------------------------------------
        # 5. Devolver el token
        # ----------------------------------------------------

        return {
            "access_token": access_token,
            "token_type": "bearer",
        }

    except ValueError as error:

        # Si las credenciales son incorrectas,
        # devolvemos un error HTTP 401.
        raise HTTPException(
            status_code=401,
            detail=str(error),
        )