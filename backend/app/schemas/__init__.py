# Este archivo centraliza los esquemas Pydantic de MatrixFlow Enterprise.
# De esta manera podemos importar los schemas desde un único lugar
# cuando los necesitemos en servicios y rutas de la API.

# Esquemas de autenticación.
from app.schemas.auth import LoginRequest, LoginResponse

# Esquemas de empresas.
from app.schemas.company import (
    CompanyBase,
    CompanyCreate,
    CompanyResponse,
)

# Esquemas de sucursales.
from app.schemas.branch import (
    BranchBase,
    BranchCreate,
    BranchResponse,
)

# Esquemas de productos.
from app.schemas.product import (
    ProductBase,
    ProductCreate,
    ProductResponse,
)

# Esquemas de ventas.
from app.schemas.sale import (
    SaleBase,
    SaleCreate,
    SaleResponse,
)

# Esquemas de inventario.
from app.schemas.inventory import (
    InventoryBase,
    InventoryCreate,
    InventoryResponse,
)

# Esquemas de vectores.
from app.schemas.vector import (
    VectorBase,
    VectorCreate,
    VectorResponse,
)

# Esquemas de matrices.
from app.schemas.matrix import (
    MatrixBase,
    MatrixCreate,
    MatrixResponse,
)

# Esquemas de operaciones matemáticas.
from app.schemas.operation import (
    OperationCreate,
    OperationResponse,
)

# Esquemas de reportes.
from app.schemas.report import ReportResponse