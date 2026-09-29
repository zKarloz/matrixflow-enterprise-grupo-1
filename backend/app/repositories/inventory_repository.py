# ============================================================
# MatrixFlow Enterprise
# Repository de inventario
# ============================================================
#
# Este archivo contiene las operaciones de acceso a la tabla
# inventory y a la tabla inventory_movements.
# ============================================================

from sqlalchemy.orm import Session

from app.models.inventory import Inventory, InventoryMovement


def get_inventory(db: Session):
    """
    Obtiene todos los registros de inventario.
    """

    # Consultamos todas las existencias registradas.
    return db.query(Inventory).all()


def get_inventory_by_branch(
    db: Session,
    branch_id: int,
):
    """
    Obtiene el inventario de una sucursal.
    """

    # Filtramos por la sucursal indicada.
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

    # Filtramos por el producto indicado.
    return (
        db.query(Inventory)
        .filter(Inventory.product_id == product_id)
        .all()
    )


def create_inventory(
    db: Session,
    branch_id: int,
    product_id: int,
    stock: int,
    minimum_stock: int,
    unit_cost: float | None = None,
):
    """
    Crea un registro de inventario.
    """

    # Creamos el inventario utilizando los nombres reales
    # de las columnas de PostgreSQL.
    inventory = Inventory(
        branch_id=branch_id,
        product_id=product_id,
        stock=stock,
        minimum_stock=minimum_stock,
        unit_cost=unit_cost,
    )

    # Agregamos el registro a la sesión.
    db.add(inventory)

    # Guardamos los cambios en PostgreSQL.
    db.commit()

    # Actualizamos el objeto para obtener su ID.
    db.refresh(inventory)

    return inventory


def create_inventory_movement(
    db: Session,
    inventory_id: int,
    movement_type: str,
    quantity: int,
    description: str | None = None,
):
    """
    Registra un movimiento sobre un inventario.
    """

    # Creamos el movimiento utilizando las columnas
    # reales de inventory_movements.
    movement = InventoryMovement(
        inventory_id=inventory_id,
        movement_type=movement_type,
        quantity=quantity,
        description=description,
    )

    # Agregamos el movimiento.
    db.add(movement)

    # Guardamos los cambios.
    db.commit()

    # Actualizamos el objeto.
    db.refresh(movement)

    return movement