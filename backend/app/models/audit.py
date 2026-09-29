# ============================================================
# MatrixFlow Enterprise
# Modelo de auditoría
# ============================================================
#
# Este modelo representa la tabla "audit_logs" de PostgreSQL.
#
# Columnas reales:
# - id
# - user_id
# - action
# - table_name
# - record_id
# - description
# - created_at
#
# PostgreSQL exige que user_id, action, table_name y created_at
# tengan un valor.
# ============================================================

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text

from sqlalchemy.sql import func

from app.core.database import Base


class AuditLog(Base):
    """
    Representa una acción registrada en el historial de auditoría.
    """

    # Nombre exacto de la tabla en PostgreSQL.
    __tablename__ = "audit_logs"

    # Identificador único del registro de auditoría.
    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # Usuario que realizó la acción.
    # Relación: audit_logs.user_id -> users.id
    #
    # PostgreSQL define esta columna como NOT NULL.
    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )

    # Acción realizada por el usuario.
    #
    # PostgreSQL utiliza VARCHAR(50).
    action = Column(
        String(50),
        nullable=False,
    )

    # Tabla sobre la que se realizó la acción.
    #
    # PostgreSQL define esta columna como NOT NULL.
    table_name = Column(
        String(100),
        nullable=False,
    )

    # Identificador del registro afectado.
    #
    # Puede ser NULL porque no todas las acciones tienen
    # necesariamente un registro específico asociado.
    record_id = Column(
        Integer,
        nullable=True,
    )

    # Descripción adicional de la acción.
    description = Column(
        Text,
        nullable=True,
    )

    # Fecha y hora en que se registró la acción.
    #
    # PostgreSQL genera automáticamente este valor mediante
    # DEFAULT NOW() cuando no se proporciona.
    created_at = Column(
        DateTime,
        nullable=False,
        server_default=func.now(),
    )