# Este archivo contiene los endpoints relacionados con reportes.
# Permite consultar información resumida del sistema.

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.report_service import (
    get_inventory_report,
    get_sales_report,
)

# Router del módulo de reportes.
router = APIRouter(
    prefix="/reports",
    tags=["Reportes"],
)


@router.get("")
def get_reports(
    db: Session = Depends(get_db),
):
    """
    Obtiene información base para los reportes.
    """

    # Consultamos ventas e inventario.
    sales = get_sales_report(db)
    inventory = get_inventory_report(db)

    # Devolvemos ambos conjuntos de información.
    return {
        "sales": sales,
        "inventory": inventory,
    }