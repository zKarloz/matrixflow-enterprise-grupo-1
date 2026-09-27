# Este archivo contiene los endpoints relacionados con usuarios.
# La autenticación completa con JWT y roles se integrará
# en la ruta de autenticación.

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.repositories.user_repository import get_all_users

# Router del módulo de usuarios.
router = APIRouter(
    prefix="/users",
    tags=["Usuarios"],
)


@router.get("")
def get_users(
    db: Session = Depends(get_db),
):
    """
    Obtiene los usuarios registrados.
    """

    # Consultamos los usuarios mediante el repository.
    return get_all_users(db)