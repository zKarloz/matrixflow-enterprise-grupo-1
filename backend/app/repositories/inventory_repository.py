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
    Registra un movimiento independiente de inventario.
    """

    movement = add_inventory_movement(
        db=db,
        inventory_id=inventory_id,
        movement_type=movement_type,
        quantity=quantity,
        description=description,
    )

    db.commit()
    db.refresh(movement)

    return movement

def get_inventory_by_id(
    db: Session,
    inventory_id: int,
):
    """
    Obtiene un registro de inventario por ID.
    """

    return (
        db.query(Inventory)
        .filter(Inventory.id == inventory_id)
        .first()
    )


def get_inventory_by_branch_product(
    db: Session,
    branch_id: int,
    product_id: int,
):
    """
    Busca el inventario exacto de un producto
    dentro de una sucursal.
    """

    return (
        db.query(Inventory)
        .filter(
            Inventory.branch_id == branch_id,
            Inventory.product_id == product_id,
        )
        .first()
    )


def get_inventory_for_update(
    db: Session,
    branch_id: int,
    product_id: int,
):
    """
    Obtiene y bloquea temporalmente la fila de inventario.

    FOR UPDATE evita que dos ventas simultáneas utilicen
    las mismas unidades disponibles.
    """

    return (
        db.query(Inventory)
        .filter(
            Inventory.branch_id == branch_id,
            Inventory.product_id == product_id,
        )
        .with_for_update()
        .first()
    )


def update_inventory(
    db: Session,
    inventory: Inventory,
    stock: int,
    minimum_stock: int,
    unit_cost: float | None,
):
    """
    Actualiza las cantidades configuradas del inventario.
    """

    inventory.stock = stock
    inventory.minimum_stock = minimum_stock
    inventory.unit_cost = unit_cost

    db.commit()
    db.refresh(inventory)

    return inventory


def add_inventory_movement(
    db: Session,
    inventory_id: int,
    movement_type: str,
    quantity: int,
    description: str | None = None,
):
    """
    Agrega un movimiento a la transacción actual
    sin ejecutar commit.

    Se utiliza especialmente durante una venta para que
    venta, detalle, movimiento y descuento sean atómicos.
    """

    movement = InventoryMovement(
        inventory_id=inventory_id,
        movement_type=movement_type,
        quantity=quantity,
        description=description,
    )

    db.add(movement)

    return movement