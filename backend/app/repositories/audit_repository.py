# ============================================================
# MatrixFlow Enterprise
# Repositorio de auditoría
# ============================================================
#
# Este archivo contiene las funciones que permiten consultar
# y registrar eventos en la tabla audit_logs.
# ============================================================

from sqlalchemy.orm import Session

from app.models.audit import AuditLog


def get_all_audit_logs(db: Session):
    """
    Obtiene todos los registros de auditoría,
    ordenados desde el más reciente.
    """

    return (
        db.query(AuditLog)
        .order_by(AuditLog.created_at.desc())
        .all()
    )


def get_audit_logs_by_user(
    db: Session,
    user_id: int,
):
    """
    Obtiene los registros de auditoría correspondientes
    a un usuario específico.
    """

    return (
        db.query(AuditLog)
        .filter(AuditLog.user_id == user_id)
        .order_by(AuditLog.created_at.desc())
        .all()
    )


def get_audit_logs_by_table(
    db: Session,
    table_name: str,
):
    """
    Obtiene los registros relacionados con una tabla
    específica de la base de datos.
    """

    return (
        db.query(AuditLog)
        .filter(AuditLog.table_name == table_name)
        .order_by(AuditLog.created_at.desc())
        .all()
    )


def create_audit_log(
    db: Session,
    action: str,
    table_name: str,
    user_id: int,
    record_id: int | None = None,
    description: str | None = None,
    ip_address: str | None = None,
    city: str | None = None,
    region: str | None = None,
    country: str | None = None,
    latitude: float | None = None,
    longitude: float | None = None,
    user_agent: str | None = None,
):
    """
    Crea un registro de auditoría.

    Los datos geográficos son opcionales porque solamente
    se utilizan en eventos relacionados con accesos.
    """

    audit_log = AuditLog(
        user_id=user_id,
        action=action,
        table_name=table_name,
        record_id=record_id,
        description=description,
        ip_address=ip_address,
        city=city,
        region=region,
        country=country,
        latitude=latitude,
        longitude=longitude,
        user_agent=user_agent,
    )

    db.add(audit_log)
    db.commit()
    db.refresh(audit_log)

    return audit_log