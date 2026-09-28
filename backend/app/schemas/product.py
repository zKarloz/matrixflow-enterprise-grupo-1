# Este archivo define los datos que la API acepta y devuelve
# cuando trabajamos con los productos de MatrixFlow Enterprise.

from pydantic import BaseModel


class ProductBase(BaseModel):
    """Datos básicos de un producto."""

    # Nombre del producto.
    name: str

    # Nombre de la categoría.
    category: str

    # Precio unitario del producto.
    price: float

    # Cantidad total disponible en inventario.
    stock: int


class ProductCreate(ProductBase):
    """Datos necesarios para crear un producto."""

    pass


class ProductResponse(ProductBase):
    """Datos que la API devuelve cuando consulta un producto."""

    # Identificador único del producto.
    id: int

    # Estado del producto.
    # El frontend espera "Activo" o "Inactivo".
    status: str