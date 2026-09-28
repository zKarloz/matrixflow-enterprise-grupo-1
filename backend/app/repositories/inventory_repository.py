# Este archivo contiene las consultas relacionadas con el inventario.
# Permite consultar existencias y registrar movimientos de inventario.

from sqlalchemy.orm import Session

from app.models.inventory import Inventory, InventoryMovement


def get_inventory(db: Session):
    """
    Obtiene todos los registros de inventario.
    """

    # Consultamos todas las existencias.
    return db.query(Inventory).all()


def get_inventory_by_branch(db: Session, branch_id: int):
    """
    Obtiene el inventario de una sucursal.
    """

    # Filtramos el inventario por sucursal.
    return (
        db.query(Inventory)
        .filter(Inventory.branch_id == branch_id)
        .all()
    )


def get_inventory_by_product(
    db: Session,
    product_id: int,
):
    """
    Obtiene el inventario de un producto.
    """

    # Filtramos el inventario por producto.
    return (
        db.query(Inventory)
        .filter(Inventory.product_id == product_id)
        .all()
    )


def create_inventory(
    db: Session,
    branch_id: int,
    product_id: int,
    quantity: int,
):
    """
    Crea un registro de inventario.
    """

    # Creamos el registro de existencias.
    inventory = Inventory(
        branch_id=branch_id,
        product_id=product_id,
        quantity=quantity,
    )

    # Agregamos el registro.
    db.add(inventory)

    # Guardamos los cambios.
    db.commit()

    # Actualizamos el objeto.
    db.refresh(inventory)

    return inventory


def create_inventory_movement(
    db: Session,
    product_id: int,
    branch_id: int,
    movement_type: str,
    quantity: int,
):
    """
    Registra un movimiento de inventario.
    """

    # Creamos el movimiento.
    movement = InventoryMovement(
        product_id=product_id,
        branch_id=branch_id,
        movement_type=movement_type,
        quantity=quantity,
    )

    # Agregamos el movimiento.
    db.add(movement)

    # Guardamos los cambios.
    db.commit()

    # Actualizamos el objeto.
    db.refresh(movement)

    return movement