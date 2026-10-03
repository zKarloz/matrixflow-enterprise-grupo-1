"""Baseline del esquema actual de MatrixFlow Enterprise.

Revision ID: 4b59201c6032
Revises:
"""

from typing import Sequence, Union


# ============================================================
# IDENTIFICADORES DE ALEMBIC
# ============================================================

# Esta revisión coincide con la que PostgreSQL ya tiene
# registrada en la tabla alembic_version.
revision: str = "4b59201c6032"

# No disponemos de migraciones anteriores en el repositorio,
# por lo que esta revisión se utilizará como baseline.
down_revision: Union[str, Sequence[str], None] = None

branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    No realizamos cambios.

    La base de datos ya contiene el esquema correspondiente
    a esta revisión. Este archivo solamente reconstruye el
    historial local perdido de Alembic.
    """
    pass


def downgrade() -> None:
    """
    El baseline no puede revertirse porque representa
    el esquema existente antes de recuperar las migraciones.
    """
    pass
