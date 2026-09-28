# ============================================================
# MatrixFlow Enterprise
# Modelo de auditoría
# ============================================================
#
# Este modelo representa la tabla "audit_logs" de PostgreSQL.
#
# IMPORTANTE:
# Los nombres de las columnas deben coincidir exactamente
# con las columnas existentes en Supabase.
# ============================================================

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.sql import func

from app.core.database import Base


class AuditLog(Base):
    """
    Modelo SQLAlchemy correspondiente a la tabla audit_logs.
    """

    __tablename__ = "audit_logs"

    # Identificador único del registro de auditoría.
    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # Usuario que realizó la acción.
    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True,
    )

    # Nombre de la acción realizada.
    action = Column(
        String(100),
        nullable=False,
    )

    # Tabla relacionada con la acción.
    table_name = Column(
        String(100),
        nullable=True,
    )

    # Identificador del registro afectado, si corresponde.
    record_id = Column(
        Integer,
        nullable=True,
    )

    # Descripción adicional de la acción.
    # Aquí podremos guardar temporalmente información como
    # la dirección IP del inicio de sesión.
    description = Column(
        Text,
        nullable=True,
    )

    # Fecha y hora en la que se registró la acción.
    created_at = Column(
        DateTime,
        nullable=False,
        server_default=func.now(),
    )