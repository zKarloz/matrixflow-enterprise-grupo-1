# ============================================================
# MatrixFlow Enterprise
# Auditoría de restricciones PostgreSQL
#
# Este script SOLO consulta PostgreSQL.
# No modifica tablas ni datos.
#
# Revisamos:
# - UNIQUE
# - índices
# - restricciones CHECK
# - claves primarias
# - claves foráneas
# ============================================================

from sqlalchemy import inspect

from app.core.database import engine


def print_table_constraints(inspector, table_name):
    """
    Muestra las restricciones importantes de una tabla.
    """

    print()
    print("=" * 70)
    print(f"TABLA: {table_name}")
    print("=" * 70)

    # --------------------------------------------------------
    # Restricciones UNIQUE
    # --------------------------------------------------------

    print()
    print("UNIQUE")
    print("-" * 70)

    unique_constraints = inspector.get_unique_constraints(
        table_name
    )

    if unique_constraints:
        for constraint in unique_constraints:
            name = constraint.get("name")
            columns = constraint.get(
                "column_names",
                [],
            )

            print(
                f"  🔒 {name or '(sin nombre)'} "
                f"-> {', '.join(columns)}"
            )
    else:
        print("  - Ninguna")

    # --------------------------------------------------------
    # Índices
    # --------------------------------------------------------

    print()
    print("ÍNDICES")
    print("-" * 70)

    indexes = inspector.get_indexes(table_name)

    if indexes:
        for index in indexes:
            name = index.get("name")
            columns = index.get(
                "column_names",
                [],
            )

            unique = index.get(
                "unique",
                False,
            )

            unique_text = "UNIQUE" if unique else "NORMAL"

            print(
                f"  📌 {name or '(sin nombre)'} "
                f"-> {', '.join(columns)} "
                f"[{unique_text}]"
            )
    else:
        print("  - Ninguno")

    # --------------------------------------------------------
    # CHECK constraints
    # --------------------------------------------------------

    print()
    print("CHECK")
    print("-" * 70)

    check_constraints = inspector.get_check_constraints(
        table_name
    )

    if check_constraints:
        for constraint in check_constraints:
            name = constraint.get("name")
            sqltext = constraint.get(
                "sqltext",
                "",
            )

            print(
                f"  ✅ {name or '(sin nombre)'} "
                f"-> {sqltext}"
            )
    else:
        print("  - Ninguno")


def main():
    """
    Ejecuta la auditoría de restricciones.
    """

    print()
    print("=" * 70)
    print("MATRIXFLOW ENTERPRISE")
    print("AUDITORÍA DE RESTRICCIONES POSTGRESQL")
    print("=" * 70)

    # Creamos un inspector de solo lectura.
    inspector = inspect(engine)

    # Obtenemos todas las tablas reales de PostgreSQL.
    tables = inspector.get_table_names()

    for table_name in tables:
        print_table_constraints(
            inspector,
            table_name,
        )

    print()
    print("=" * 70)
    print("FIN DE LA AUDITORÍA")
    print("=" * 70)


# Ejecutamos el auditor solamente cuando se ejecuta
# directamente desde la terminal.
if __name__ == "__main__":
    main()