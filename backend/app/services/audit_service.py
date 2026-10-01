# Este archivo contiene la lógica de negocio relacionada con auditoría.
# Permite registrar las acciones realizadas por los usuarios.

from sqlalchemy.orm import Session

# Funciones utilizadas para trabajar con los registros
# de auditoría almacenados en PostgreSQL.
from app.repositories.audit_repository import (
    get_all_audit_logs,
    get_audit_logs_by_user,
    get_audit_logs_by_table,
    create_audit_log,
)


def list_audit_logs(db: Session):
    """
    Obtiene todos los registros de auditoría.
    """

    # Consultamos los registros mediante el repository.
    return get_all_audit_logs(db)


def list_audit_logs_by_user(
    db: Session,
    user_id: int,
):
    """
    Obtiene la actividad de un usuario.
    """

    # Consultamos la auditoría filtrada por usuario.
    return get_audit_logs_by_user(
        db,
        user_id,
    )


def list_audit_logs_by_module(
    db: Session,
    module: str,
):
    """
    Obtiene la actividad relacionada con un módulo.
    """

    # Validamos que se haya proporcionado el módulo.
    if not module.strip():
        raise ValueError(
            "El módulo es obligatorio."
        )

    # Consultamos los registros.
    return get_audit_logs_by_table(
        db,
        module,
    )


def register_audit(
    db: Session,
    action: str,
    table_name: str,
    user_id: int,
    record_id: int | None = None,
    description: str | None = None,
):
    """
    Registra una acción general en audit_logs.

    La información específica de ubicación se incorpora
    directamente durante el inicio de sesión.
    """

    if not action.strip():
        raise ValueError(
            "La acción es obligatoria."
        )

    if not table_name.strip():
        raise ValueError(
            "La tabla relacionada es obligatoria."
        )

    if user_id <= 0:
        raise ValueError(
            "El usuario no es válido."
        )

    return create_audit_log(
        db=db,
        action=action.strip(),
        table_name=table_name.strip(),
        user_id=user_id,
        record_id=record_id,
        description=description,
    )