# Este archivo define el modelo de la tabla "audit_logs".
# Permite registrar las acciones realizadas dentro de MatrixFlow
# para mantener un historial y una trazabilidad del sistema.

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.sql import func

from app.core.database import Base


class AuditLog(Base):
    """
    Modelo SQLAlchemy correspondiente a la tabla audit_logs.
    """

    # Nombre de la tabla en PostgreSQL.
    __tablename__ = "audit_logs"

    # Identificador único del registro de auditoría.
    id = Column(Integer, primary_key=True, index=True)

    # Usuario que realizó la acción.
    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True,
    )

    # Acción realizada.
    action = Column(String(100), nullable=False)

    # Módulo donde se realizó la acción.
    module = Column(String(100), nullable=False)

    # Dirección IP desde donde se realizó la acción.
    ip_address = Column(String(45), nullable=True)

    # Estado de la operación.
    status = Column(String(30), nullable=False)

    # Resultado o información adicional de la acción.
    result = Column(Text, nullable=True)

    # Fecha y hora del registro.
    created_at = Column(
        DateTime,
        nullable=False,
        server_default=func.now(),
    )