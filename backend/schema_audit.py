# ============================================================
# MatrixFlow Enterprise
# Inventario completo de PostgreSQL vs SQLAlchemy
#
# IMPORTANTE:
# Este script es SOLO de lectura.
# NO modifica tablas, columnas ni datos.
# ============================================================

from sqlalchemy import inspect

from app.core.database import Base, engine

# Importamos todos los modelos para que SQLAlchemy registre
# correctamente sus tablas dentro de Base.metadata.
import app.models.audit
import app.models.branch
import app.models.category
import app.models.company
import app.models.inventory
import app.models.matrix
import app.models.operation
import app.models.product
import app.models.role
import app.models.sale
import app.models.target
import app.models.user
import app.models.vector


# ============================================================
# Funciones auxiliares
# ============================================================

def format_type(column_type):
    """
    Convierte el tipo SQLAlchemy/PostgreSQL a texto legible.
    """

    return str(column_type)


def print_database_schema(inspector):
    """
    Muestra la estructura REAL de PostgreSQL.

    Aquí PostgreSQL/Supabase es nuestra fuente de verdad.
    """

    print()
    print("=" * 70)
    print("ESTRUCTURA REAL DE POSTGRESQL / SUPABASE")
    print("=" * 70)

    # Obtenemos todas las tablas existentes en PostgreSQL.
    tables = inspector.get_table_names()

    for table_name in tables:
        print()
        print(f"📦 TABLA: {table_name}")
        print("-" * 70)

        # ----------------------------------------------------
        # Columnas
        # ----------------------------------------------------

        columns = inspector.get_columns(table_name)

        print("COLUMNAS")
        print("-" * 70)

        for column in columns:
            name = column["name"]
            column_type = format_type(column["type"])

            # Indicamos explícitamente si acepta NULL.
            nullable = "NULL" if column["nullable"] else "NOT NULL"

            # Obtenemos el valor por defecto, si existe.
            default = column.get("default")

            if default is None:
                default_text = "-"
            else:
                default_text = str(default)

            print(
                f"  {name:<20} "
                f"{column_type:<25} "
                f"{nullable:<10} "
                f"DEFAULT={default_text}"
            )

        # ----------------------------------------------------
        # Clave primaria
        # ----------------------------------------------------

        primary_key = inspector.get_pk_constraint(table_name)

        pk_columns = primary_key.get("constrained_columns", [])

        print()
        print("PRIMARY KEY")
        print("-" * 70)

        if pk_columns:
            print(f"  🔑 {', '.join(pk_columns)}")
        else:
            print("  - Ninguna")

        # ----------------------------------------------------
        # Claves foráneas
        # ----------------------------------------------------

        foreign_keys = inspector.get_foreign_keys(table_name)

        print()
        print("FOREIGN KEYS")
        print("-" * 70)

        if foreign_keys:
            for foreign_key in foreign_keys:
                local_columns = foreign_key.get(
                    "constrained_columns",
                    [],
                )

                referenced_table = foreign_key.get(
                    "referred_table",
                    "?",
                )

                referenced_columns = foreign_key.get(
                    "referred_columns",
                    [],
                )

                print(
                    f"  🔗 {', '.join(local_columns)} "
                    f"-> {referenced_table}"
                    f"({', '.join(referenced_columns)})"
                )
        else:
            print("  - Ninguna")


def print_sqlalchemy_schema():
    """
    Muestra la estructura que SQLAlchemy cree que existe.

    Esto nos permitirá comparar directamente:
    PostgreSQL REAL vs ORM.
    """

    print()
    print("=" * 70)
    print("ESTRUCTURA REGISTRADA EN SQLALCHEMY")
    print("=" * 70)

    # Obtenemos las tablas conocidas por SQLAlchemy.
    tables = sorted(Base.metadata.tables.keys())

    for table_name in tables:
        table = Base.metadata.tables[table_name]

        print()
        print(f"📦 TABLA: {table_name}")
        print("-" * 70)

        # ----------------------------------------------------
        # Columnas
        # ----------------------------------------------------

        print("COLUMNAS")
        print("-" * 70)

        for column in table.columns:
            nullable = "NULL" if column.nullable else "NOT NULL"

            # SQLAlchemy puede tener defaults Python o SQL.
            if column.default is not None:
                default = str(column.default.arg)
            else:
                default = "-"

            print(
                f"  {column.name:<20} "
                f"{str(column.type):<25} "
                f"{nullable:<10} "
                f"DEFAULT={default}"
            )

        # ----------------------------------------------------
        # Primary Key
        # ----------------------------------------------------

        print()
        print("PRIMARY KEY")
        print("-" * 70)

        pk_columns = [
            column.name
            for column in table.primary_key.columns
        ]

        if pk_columns:
            print(f"  🔑 {', '.join(pk_columns)}")
        else:
            print("  - Ninguna")

        # ----------------------------------------------------
        # Foreign Keys
        # ----------------------------------------------------

        print()
        print("FOREIGN KEYS")
        print("-" * 70)

        foreign_keys = list(table.foreign_keys)

        if foreign_keys:
            for foreign_key in foreign_keys:
                print(
                    f"  🔗 {foreign_key.parent.name} "
                    f"-> {foreign_key.target_fullname}"
                )
        else:
            print("  - Ninguna")


# ============================================================
# Ejecución principal
# ============================================================

def main():
    """
    Ejecuta el inventario completo.
    """

    print()
    print("Cargando modelos SQLAlchemy...")

    # Creamos el inspector conectado a PostgreSQL.
    inspector = inspect(engine)

    print("Consultando estructura de PostgreSQL...")

    # Mostramos primero la base de datos REAL.
    print_database_schema(inspector)

    print()
    print("Leyendo estructura de SQLAlchemy...")

    # Después mostramos lo que conoce el ORM.
    print_sqlalchemy_schema()

    print()
    print("=" * 70)
    print("FIN DEL INVENTARIO")
    print("=" * 70)


# Ejecutamos el programa solamente cuando este archivo
# se ejecuta directamente desde la terminal.
if __name__ == "__main__":
    main()