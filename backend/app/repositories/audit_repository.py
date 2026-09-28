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
    table_name: str | None = None,
    record_id: int | None = None,
    description: str | None = None,
    user_id: int | None = None,
):
    """
    Crea un nuevo registro de auditoría.

    La información adicional, como la IP del usuario,
    se puede guardar dentro de 'description'.
    """

    # Creamos el registro utilizando únicamente las columnas
    # que realmente existen en la tabla audit_logs.
    audit_log = AuditLog(
        user_id=user_id,
        action=action,
        table_name=table_name,
        record_id=record_id,
        description=description,
    )

    # Agregamos el registro a la sesión de SQLAlchemy.
    db.add(audit_log)

    # Guardamos los cambios en PostgreSQL.
    db.commit()

    # Actualizamos el objeto con el ID y la fecha generados
    # por la base de datos.
    db.refresh(audit_log)

    return audit_log