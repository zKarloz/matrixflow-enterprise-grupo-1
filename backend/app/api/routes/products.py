# Este archivo contiene los endpoints relacionados con productos.
# Las rutas utilizan product_service para ejecutar la lógica de negocio.

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.product import ProductCreate, ProductResponse
from app.services.product_service import (
    get_product,
    list_active_products,
    list_products,
    register_product,
)

# Router del módulo de productos.
router = APIRouter(
    prefix="/products",
    tags=["Productos"],
)


@router.get(
    "",
    response_model=list[ProductResponse],
)
def get_products(
    db: Session = Depends(get_db),
):
    """
    Obtiene todos los productos.
    """

    return list_products(db)


@router.get(
    "/active",
    response_model=list[ProductResponse],
)
def get_active_product_list(
    db: Session = Depends(get_db),
):
    """
    Obtiene los productos activos.
    """

    return list_active_products(db)


@router.get(
    "/{product_id}",
    response_model=ProductResponse,
)
def get_product_by_id(
    product_id: int,
    db: Session = Depends(get_db),
):
    """
    Obtiene un producto mediante su ID.
    """

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
)
def create_product(
    data: ProductCreate,
    db: Session = Depends(get_db),
):
    """
    Registra un nuevo producto.
    """

    try:
        return register_product(
            db=db,
            name=data.name,
            category_id=None,
            price=data.price,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )