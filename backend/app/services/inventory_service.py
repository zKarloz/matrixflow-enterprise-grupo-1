# ============================================================
# MatrixFlow Enterprise
# Service de inventario
# ============================================================
#
# Contiene la lógica de negocio del módulo de inventario.
# ============================================================

from sqlalchemy.orm import Session

from app.repositories.inventory_repository import (
    create_inventory,
    create_inventory_movement,
    get_inventory,
    get_inventory_by_branch,
    get_inventory_by_product,
)


def list_inventory(db: Session):
    """
    Obtiene todo el inventario.
    """

    # Delegamos la consulta al repository.
    return get_inventory(db)


def list_inventory_by_branch(
    db: Session,
    branch_id: int,
):
    """
    Obtiene el inventario de una sucursal.
    """

    return get_inventory_by_branch(
        db,
        branch_id,
    )


def list_inventory_by_product(
    db: Session,
    product_id: int,
):
    """
    Obtiene el inventario de un producto.
    """

    return get_inventory_by_product(
        db,
        product_id,
    )


def register_inventory(
    db: Session,
    branch_id: int,
    product_id: int,
    stock: int,
    minimum_stock: int,
    unit_cost: float | None = None,
):
    """
    Registra las existencias iniciales de un producto.
    """

    # El stock no puede ser negativo.
    if stock < 0:
        raise ValueError(
            "El stock no puede ser negativo."
        )

    # El stock mínimo tampoco puede ser negativo.
    if minimum_stock < 0:
        raise ValueError(
            "El stock mínimo no puede ser negativo."
        )

    # Los identificadores deben ser positivos.
    if branch_id <= 0:
        raise ValueError(
            "El identificador de sucursal no es válido."
        )

    if product_id <= 0:
        raise ValueError(
            "El identificador de producto no es válido."
        )

    # El costo unitario, si existe, no puede ser negativo.
    if unit_cost is not None and unit_cost < 0:
        raise ValueError(
            "El costo unitario no puede ser negativo."
        )

    # Delegamos la creación al repository.
    return create_inventory(
        db=db,
        branch_id=branch_id,
        product_id=product_id,
        stock=stock,
        minimum_stock=minimum_stock,
        unit_cost=unit_cost,
    )


def register_inventory_movement(
    db: Session,
    inventory_id: int,
    movement_type: str,
    quantity: int,
    description: str | None = None,
):
    """
    Registra un movimiento de inventario.
    """

    # La cantidad de un movimiento debe ser positiva.
    if quantity <= 0:
        raise ValueError(
            "La cantidad del movimiento debe ser mayor que cero."
        )

    # Validamos el identificador del inventario.
    if inventory_id <= 0:
        raise ValueError(
            "El identificador de inventario no es válido."
        )

    # Validamos el tipo de movimiento.
    if not movement_type.strip():
        raise ValueError(
            "El tipo de movimiento es obligatorio."
        )

    # Guardamos el movimiento mediante el repository.
    return create_inventory_movement(
        db=db,
        inventory_id=inventory_id,
        movement_type=movement_type,
        quantity=quantity,
        description=description,
    )