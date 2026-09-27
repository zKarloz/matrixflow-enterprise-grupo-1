# Este archivo define el modelo de la tabla "categories".
# Permite clasificar los productos de MatrixFlow Enterprise.

from sqlalchemy import Column, Integer, String

from app.core.database import Base


class Category(Base):
    """
    Modelo SQLAlchemy correspondiente a la tabla categories.
    """

    # Nombre de la tabla en PostgreSQL.
    __tablename__ = "categories"

    # Identificador único de la categoría.
    id = Column(Integer, primary_key=True, index=True)

    # Nombre de la categoría.
    name = Column(String(100), unique=True, nullable=False)