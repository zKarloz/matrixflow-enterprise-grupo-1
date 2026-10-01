# ============================================================
# MatrixFlow Enterprise
# Servicio de reportes
# ============================================================
#
# Centraliza los cálculos necesarios para reportes y Dashboard.
#
# Toda la información procede de PostgreSQL mediante los
# repositorios existentes. No se utilizan datos simulados.
# ============================================================

from collections import defaultdict

from sqlalchemy.orm import Session

from app.repositories.inventory_repository import (
    get_inventory,
)

from app.repositories.sale_repository import (
    get_all_sales,
    get_recent_sales_with_branch,
    get_sales_summary_by_branch,
    get_sales_summary_by_product,
)


# ============================================================
# REPORTE BASE DE VENTAS
# ============================================================

def get_sales_report(
    db: Session,
):
    """
    Obtiene todas las ventas registradas.
    """

    return get_all_sales(db)


# ============================================================
# REPORTE BASE DE INVENTARIO
# ============================================================

def get_inventory_report(
    db: Session,
):
    """
    Obtiene todos los registros actuales de inventario.
    """

    return get_inventory(db)


# ============================================================
# DASHBOARD
# ============================================================

def get_dashboard_report(
    db: Session,
):
    """
    Construye toda la información necesaria para el Dashboard.

    El objetivo es que React pueda cargar los indicadores y
    gráficos mediante una única petición HTTP.
    """

    # --------------------------------------------------------
    # Datos base
    # --------------------------------------------------------

    sales = get_all_sales(db)
    inventory = get_inventory(db)

    # --------------------------------------------------------
    # Indicadores principales
    # --------------------------------------------------------

    total_sales = sum(
        float(sale.total)
        for sale in sales
    )

    total_inventory = sum(
        int(item.stock)
        for item in inventory
    )

    sales_count = len(sales)

    # --------------------------------------------------------
    # Ventas por período
    # --------------------------------------------------------
    #
    # Agrupamos utilizando año y mes para evitar mezclar,
    # por ejemplo, septiembre de 2025 con septiembre de 2026.

    sales_by_period_map = defaultdict(float)

    for sale in sales:
        if sale.created_at is None:
            continue

        period = sale.created_at.strftime(
            "%Y-%m"
        )

        sales_by_period_map[period] += float(
            sale.total
        )

    sales_by_period = [
        {
            "period": period,
            "total": total,
        }
        for period, total
        in sorted(
            sales_by_period_map.items()
        )
    ]

    # --------------------------------------------------------
    # Ventas por sucursal
    # --------------------------------------------------------

    branch_rows = (
        get_sales_summary_by_branch(db)
    )

    sales_by_branch = [
        {
            "branch_id":
                row.branch_id,

            "branch_name":
                row.branch_name,

            "total":
                float(row.total),
        }
        for row in branch_rows
    ]

    # --------------------------------------------------------
    # Ventas por producto
    # --------------------------------------------------------

    product_rows = (
        get_sales_summary_by_product(db)
    )

    sales_by_product = [
        {
            "product_id":
                row.product_id,

            "product_name":
                row.product_name,

            "quantity":
                int(row.quantity),

            "total":
                float(row.total),
        }
        for row in product_rows
    ]

    # --------------------------------------------------------
    # Actividad reciente
    # --------------------------------------------------------

    recent_rows = (
        get_recent_sales_with_branch(
            db=db,
            limit=5,
        )
    )

    recent_sales = [
        {
            "sale_id":
                row.sale_id,

            "branch_id":
                row.branch_id,

            "branch_name":
                row.branch_name,

            "total":
                float(row.total),

            "created_at":
                row.created_at,
        }
        for row in recent_rows
    ]

    # --------------------------------------------------------
    # Respuesta completa
    # --------------------------------------------------------

    return {
        "summary": {
            "total_sales":
                total_sales,

            "total_inventory":
                total_inventory,

            "sales_count":
                sales_count,
        },

        "sales_by_period":
            sales_by_period,

        "sales_by_branch":
            sales_by_branch,

        "sales_by_product":
            sales_by_product,

        "recent_sales":
            recent_sales,
    }