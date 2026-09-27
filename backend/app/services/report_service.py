# Este archivo contiene la lógica de negocio de los reportes.
# Los reportes podrán combinar información de ventas, inventario
# y operaciones para devolverla al frontend.

from sqlalchemy.orm import Session

from app.repositories.inventory_repository import get_inventory
from app.repositories.sale_repository import get_all_sales


def get_sales_report(db: Session):
    """
    Obtiene la información base para un reporte de ventas.
    """

    # Obtenemos las ventas registradas.
    sales = get_all_sales(db)

    # Devolvemos los datos sin alterar.
    # Los cálculos adicionales se incorporarán cuando definamos
    # los indicadores concretos del sistema.
    return sales


def get_inventory_report(db: Session):
    """
    Obtiene la información base para un reporte de inventario.
    """

    # Obtenemos los registros de inventario.
    inventory = get_inventory(db)

    # Devolvemos los datos para que la capa superior
    # pueda convertirlos en la respuesta correspondiente.
    return inventory