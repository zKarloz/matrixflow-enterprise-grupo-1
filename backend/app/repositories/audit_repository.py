# Este archivo contiene las consultas relacionadas con la auditoría.
# Permite registrar las acciones realizadas dentro de MatrixFlow Enterprise.

from sqlalchemy.orm import Session

from app.models.audit import AuditLog


def get_all_audit_logs(db: Session):
    """
    Obtiene todos los registros de auditoría.
    """

    # Consultamos los registros de auditoría.
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
    Obtiene las acciones realizadas por un usuario.
    """

    # Filtramos los registros utilizando el ID del usuario.
    return (
        db.query(AuditLog)
        .filter(AuditLog.user_id == user_id)
        .order_by(AuditLog.created_at.desc())
        .all()
    )


def get_audit_logs_by_module(
    db: Session,
    module: str,
):
    """
    Obtiene los registros relacionados con un módulo.
    """

    # Filtramos la auditoría por módulo.
    return (
        db.query(AuditLog)
        .filter(AuditLog.module == module)
        .order_by(AuditLog.created_at.desc())
        .all()
    )


def create_audit_log(
    db: Session,
    action: str,
    module: str,
    status: str,
    user_id: int | None = None,
    ip_address: str | None = None,
    result: str | None = None,
):
    """
    Registra una nueva acción en la auditoría.
    """

    # Creamos el registro de auditoría.
    audit_log = AuditLog(
        user_id=user_id,
        action=action,
        module=module,
        ip_address=ip_address,
        status=status,
        result=result,
    )

    # Agregamos el registro.
    db.add(audit_log)

    # Guardamos los cambios.
    db.commit()

    # Actualizamos el objeto con los datos generados.
    db.refresh(audit_log)

    return audit_log