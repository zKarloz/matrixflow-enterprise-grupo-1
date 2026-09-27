# Este archivo contiene la lógica de negocio del inventario.
# Coordina las consultas de existencias y los movimientos de inventario.

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

    # Consultamos todas las existencias.
    return get_inventory(db)


def list_inventory_by_branch(
    db: Session,
    branch_id: int,
):
    """
    Obtiene el inventario de una sucursal.
    """

    # Consultamos el inventario filtrado por sucursal.
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

    # Consultamos el inventario filtrado por producto.
    return get_inventory_by_product(
        db,
        product_id,
    )


def register_inventory(
    db: Session,
    branch_id: int,
    product_id: int,
    quantity: int,
):
    """
    Registra una existencia inicial de inventario.
    """

    # La cantidad no puede ser negativa.
    if quantity < 0:
        raise ValueError(
            "La cantidad de inventario no puede ser negativa."
        )

    # Creamos el registro de inventario.
    return create_inventory(
        db=db,
        branch_id=branch_id,
        product_id=product_id,
        quantity=quantity,
    )


def register_inventory_movement(
    db: Session,
    product_id: int,
    branch_id: int,
    movement_type: str,
    quantity: int,
):
    """
    Registra un movimiento de inventario.
    """

    # Validamos que exista una cantidad positiva.
    if quantity <= 0:
        raise ValueError(
            "La cantidad del movimiento debe ser mayor que cero."
        )

    # Validamos que se haya especificado el tipo de movimiento.
    if not movement_type.strip():
        raise ValueError(
            "El tipo de movimiento es obligatorio."
        )

    # Guardamos el movimiento.
    return create_inventory_movement(
        db=db,
        product_id=product_id,
        branch_id=branch_id,
        movement_type=movement_type,
        quantity=quantity,
    )