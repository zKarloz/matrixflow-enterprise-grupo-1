# Este archivo centraliza los repositories de MatrixFlow Enterprise.
# Permite importar las funciones de acceso a datos desde un único lugar.

from app.repositories.user_repository import (
    get_user_by_id,
    get_user_by_email,
    get_all_users,
    create_user,
)

from app.repositories.company_repository import (
    get_all_companies,
    get_company_by_id,
    create_company,
)

from app.repositories.branch_repository import (
    get_all_branches,
    get_branch_by_id,
    get_branches_by_company,
    create_branch,
)

from app.repositories.product_repository import (
    get_all_products,
    get_product_by_id,
    get_active_products,
    create_product,
)

from app.repositories.sale_repository import (
    create_sale_with_details,
    get_all_sales,
    get_sale_by_id,
    get_sales_by_branch,
)

from app.repositories.inventory_repository import (
    get_inventory,
    get_inventory_by_branch,
    get_inventory_by_product,
    create_inventory,
    create_inventory_movement,
)

from app.repositories.vector_repository import (
    get_all_vectors,
    get_vector_by_id,
    get_vector_values,
    create_vector,
    create_vector_value,
)

from app.repositories.matrix_repository import (
    get_all_matrices,
    get_matrix_by_id,
    get_matrix_values,
    create_matrix,
    create_matrix_value,
)

from app.repositories.operation_repository import (
    get_all_operations,
    get_operation_by_id,
    get_operation_inputs,
    get_operation_results,
    create_operation,
    create_operation_input,
    create_operation_result,
)

# Funciones relacionadas con los registros de auditoría.
from app.repositories.audit_repository import (
    get_all_audit_logs,
    get_audit_logs_by_user,
    get_audit_logs_by_table,
    create_audit_log,
)