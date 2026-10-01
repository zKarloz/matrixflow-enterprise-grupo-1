# Este archivo centraliza los services de MatrixFlow Enterprise.
# Permite importar la lógica de negocio desde un único lugar.

from app.services.auth_service import (
    find_user_for_login,
)

from app.services.company_service import (
    list_companies,
    get_company,
    register_company,
)

from app.services.branch_service import (
    list_branches,
    get_branch,
    list_branches_by_company,
    register_branch,
)

from app.services.product_service import (
    list_products,
    list_active_products,
    get_product,
    register_product,
)

from app.services.sale_service import (
    get_sale,
    list_sales,
    list_sales_by_branch,
    register_sale,
)

from app.services.inventory_service import (
    list_inventory,
    list_inventory_by_branch,
    list_inventory_by_product,
    register_inventory,
    register_inventory_movement,
)

from app.services.vector_service import (
    list_vectors,
    get_vector,
    register_vector,
)

from app.services.matrix_service import (
    list_matrices,
    get_matrix,
    register_matrix,
)

from app.services.operation_service import (
    execute_operation,
)

from app.services.report_service import (
    get_sales_report,
    get_inventory_report,
)

from app.services.audit_service import (
    list_audit_logs,
    list_audit_logs_by_user,
    list_audit_logs_by_module,
    register_audit,
)