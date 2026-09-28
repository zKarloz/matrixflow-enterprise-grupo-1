# ============================================================
# MatrixFlow Enterprise
# Rutas de auditoría y seguridad
# ============================================================
#
# Estas rutas permiten consultar los registros de auditoría
# almacenados en PostgreSQL.
#
# El frontend utilizará estos datos para mostrar:
#   - Historial de accesos
#   - Usuario
#   - IP registrada
#   - Fecha y hora
#   - Información de la acción realizada
#
# Flujo:
#
# React
#   ↓
# GET /api/v1/audit
#   ↓
# FastAPI
#   ↓
# audit_service
#   ↓
# PostgreSQL
# ============================================================

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.audit_service import list_audit_logs


# Router dedicado a las operaciones de auditoría.
router = APIRouter(
    prefix="/audit",
    tags=["Auditoría"],
)


@router.get("")
def get_audit_logs(
    db: Session = Depends(get_db),
):
    """
    Obtiene todos los registros de auditoría.

    Los registros se devuelven ordenados desde
    el más reciente hasta el más antiguo.
    """

    # Delegamos la consulta al servicio de auditoría.
    # De esta manera la ruta no contiene directamente
    # lógica de acceso a PostgreSQL.
    return list_audit_logs(db)