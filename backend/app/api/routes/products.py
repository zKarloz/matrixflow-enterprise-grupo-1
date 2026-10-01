# ============================================================
# MatrixFlow Enterprise
# Rutas de productos
# ============================================================
# Define los endpoints HTTP relacionados con la tabla products.
#
# El stock se administra mediante el módulo inventory.
# ============================================================

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require_roles

from app.schemas.product import (
    ProductCreate,
    ProductResponse,
    ProductUpdate,
)

from app.services.product_service import (
    get_product,
    list_active_products,
    list_products,
    modify_product,
    register_product,
)


# Router principal de productos.
router = APIRouter(
    prefix="/products",
    tags=["Productos"],
)


@router.get(
    "",
)
def get_products(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Administrador", "Analista")
    ),
):
    # Devuelve todos los productos junto con
    # su categoría y stock disponible.
    return list_products(db)


@router.get(
    "/active",
)
def get_active_product_list(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Administrador", "Analista")
    ),
):
    # Devuelve únicamente los productos activos.
    return list_active_products(db)


@router.get(
    "/{product_id}",
    response_model=ProductResponse,
)
def get_product_by_id(
    product_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Administrador", "Analista")
    ),
):
    # Busca un producto mediante su ID.
    try:
        return get_product(
            db,
            product_id,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        )


@router.post(
    "",
    response_model=ProductResponse,
    status_code=201,
)
def create_product(
    data: ProductCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Administrador")
    ),
):
    # Registra un producto en la tabla products.
    #
    # IMPORTANTE:
    # El stock NO se registra aquí.
    # Después se crea el registro correspondiente
    # en la tabla inventory.
    try:
        return register_product(
            db=db,
            name=data.name,
            category_id=data.category_id,
            price=data.price,
            sku=data.sku,
            description=data.description,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

# ------------------------------------------------------------
# ACTUALIZAR PRODUCTO
# ------------------------------------------------------------

@router.patch(
    "/{product_id}",
    response_model=ProductResponse,
)
def update_existing_product(
    product_id: int,
    data: ProductUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Administrador")
    ),
):
    """
    Actualiza la información comercial de un producto.

    El stock no se modifica desde este endpoint porque
    pertenece exclusivamente al módulo de inventario.
    """

    # Comprobamos primero que el producto exista para poder
    # devolver HTTP 404 de forma clara.
    try:
        get_product(
            db,
            product_id,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        )

    # Las demás validaciones de negocio, como un SKU duplicado,
    # se consideran solicitudes inválidas.
    try:
        return modify_product(
            db=db,
            product_id=product_id,
            name=data.name,
            category_id=data.category_id,
            price=data.price,
            sku=data.sku,
            description=data.description,
            is_active=data.is_active,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )