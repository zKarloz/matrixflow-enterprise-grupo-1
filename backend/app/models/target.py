# ============================================================
# MatrixFlow Enterprise
# Modelo de metas
# ============================================================
#
# Este modelo representa la tabla "targets" de PostgreSQL.
#
# Columnas reales:
# - id
# - company_id
# - branch_id
# - user_id
# - name
# - target_value
# - period
# - created_at
#
# PostgreSQL permite que branch_id y user_id sean NULL,
# pero company_id es obligatorio.
# ============================================================

from sqlalchemy import Column, DateTime, ForeignKey, Integer, Numeric, String

from sqlalchemy.sql import func

from app.core.database import Base


class Target(Base):
    """
    Representa una meta definida para una empresa.
    """

    # Nombre exacto de la tabla en PostgreSQL.
    __tablename__ = "targets"

    # Identificador único de la meta.
    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # Empresa propietaria de la meta.
    # Relación: targets.company_id -> companies.id
    company_id = Column(
        Integer,
        ForeignKey("companies.id"),
        nullable=False,
    )

    # Sucursal asociada a la meta.
    # Es opcional porque PostgreSQL permite NULL.
    # Relación: targets.branch_id -> branches.id
    branch_id = Column(
        Integer,
        ForeignKey("branches.id"),
        nullable=True,
    )

    # Usuario asociado a la meta.
    # También es opcional según PostgreSQL.
    # Relación: targets.user_id -> users.id
    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True,
    )

    # Nombre descriptivo de la meta.
    name = Column(
        String(150),
        nullable=False,
    )

    # Valor numérico que se desea alcanzar.
    #
    # PostgreSQL utiliza NUMERIC(10,2), por lo que usamos
    # Numeric para conservar precisión decimal.
    target_value = Column(
        Numeric(10, 2),
        nullable=False,
    )

    # Periodo al que pertenece la meta.
    # Ejemplos: mensual, trimestral, anual.
    period = Column(
        String(30),
        nullable=False,
    )

    # Fecha y hora de creación de la meta.
    created_at = Column(
        DateTime,
        nullable=False,
        server_default=func.now(),
    )