"""Agregar fecha y resultado escalar a operaciones.

Revision ID: 3afbc018ae67
Revises: 4b59201c6032
Create Date: 2026-10-02 19:41:27.767677
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# ============================================================
# IDENTIFICADORES DE ALEMBIC
# ============================================================

revision: str = "3afbc018ae67"

down_revision: Union[
    str,
    Sequence[str],
    None,
] = "4b59201c6032"

branch_labels: Union[
    str,
    Sequence[str],
    None,
] = None

depends_on: Union[
    str,
    Sequence[str],
    None,
] = None


def upgrade() -> None:
    """
    Agrega la información necesaria para construir
    correctamente el historial matemático.
    """

    # Permite almacenar resultados escalares.
    #
    # Ejemplo:
    # producto punto [1, 2, 3] · [4, 5, 6] = 32
    op.add_column(
        "operation_results",
        sa.Column(
            "scalar_value",
            sa.Numeric(
                precision=20,
                scale=4,
            ),
            nullable=True,
        ),
    )

    # Registra automáticamente la fecha y hora
    # en la que se crea cada operación matemática.
    op.add_column(
        "operations",
        sa.Column(
            "created_at",
            sa.DateTime(
                timezone=True,
            ),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )


def downgrade() -> None:
    """
    Revierte únicamente los cambios agregados
    por esta migración.
    """

    # Eliminamos primero la fecha de las operaciones.
    op.drop_column(
        "operations",
        "created_at",
    )

    # Eliminamos el soporte para resultados escalares.
    op.drop_column(
        "operation_results",
        "scalar_value",
    )