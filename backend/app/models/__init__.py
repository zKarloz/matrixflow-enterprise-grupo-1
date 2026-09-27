# Este archivo centraliza la importación de todos los modelos
# de base de datos de MatrixFlow Enterprise.
# De esta manera, SQLAlchemy y Alembic pueden reconocer
# todas las tablas del sistema.

from app.models.role import Role
from app.models.user import User

from app.models.company import Company
from app.models.branch import Branch
from app.models.category import Category
from app.models.product import Product

from app.models.sale import Sale, SaleDetail
from app.models.inventory import Inventory, InventoryMovement
from app.models.target import Target

from app.models.vector import Vector, VectorValue
from app.models.matrix import Matrix, MatrixValue

from app.models.operation import (
    Operation,
    OperationInput,
    OperationResult,
)

from app.models.audit import AuditLog