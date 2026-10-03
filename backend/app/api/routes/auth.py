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
from app.services.auth_service import find_user_for_login, geolocate_ip

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
        # 2. Obtener la IP real del cliente
        # ----------------------------------------------------

        # Render se encuentra detrás de proxies y balanceadores.
        # X-Forwarded-For contiene la cadena de IPs por las que
        # pasó la petición. En Render, la primera corresponde
        # al cliente original.
        forwarded_for = request.headers.get(
            "x-forwarded-for"
        )

        if forwarded_for:
            client_ip = (
                forwarded_for
                .split(",")[0]
                .strip()
            )
        elif request.client:
            # Este caso se utiliza principalmente durante
            # desarrollo local.
            client_ip = request.client.host
        else:
            client_ip = "IP desconocida"


        # ----------------------------------------------------
        # 3. Obtener ubicación aproximada
        # ----------------------------------------------------

        location = geolocate_ip(
            client_ip
        )

        city = location["city"]
        region = location["region"]
        country = location["country"]
        latitude = location["latitude"]
        longitude = location["longitude"]


        # ----------------------------------------------------
        # 4. Obtener información del navegador
        # ----------------------------------------------------

        # User-Agent identifica de forma general el navegador,
        # sistema operativo o dispositivo que realizó la petición.
        user_agent = request.headers.get(
            "user-agent"
        )

        # ----------------------------------------------------
        # 5. Registrar el acceso
        # ----------------------------------------------------

        create_audit_log(
            db=db,
            user_id=user.id,
            action="Inicio de sesión",
            table_name="users",
            record_id=user.id,

            # Conservamos una descripción legible para auditoría.
            description="Inicio de sesión exitoso.",

            # Datos estructurados utilizados por Seguridad y accesos.
            ip_address=client_ip,
            city=city,
            region=region,
            country=country,
            latitude=latitude,
            longitude=longitude,
            user_agent=user_agent,
        )

        # ----------------------------------------------------
        # 6. Generar el JWT
        # ----------------------------------------------------

        access_token = create_access_token(
            {
                # Identificador utilizado por el backend
                # para reconocer al usuario autenticado.
                "sub": str(user.id),

                # Rol utilizado por la interfaz para adaptar
                # la navegación visible.
                "role": role.name,

                # Datos de identidad necesarios para personalizar
                # el saludo del Dashboard sin realizar otra petición.
                "username": user.username,
                "full_name": user.full_name,
            }
        )

        # ----------------------------------------------------
        # 7. Devolver el token
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