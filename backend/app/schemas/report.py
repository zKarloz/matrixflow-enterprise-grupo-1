# Este archivo define los datos que la API utiliza para devolver
# información resumida y resultados de los reportes de MatrixFlow.

from typing import Any, Dict, List

from pydantic import BaseModel


class ReportResponse(BaseModel):
    """
    Información que devuelve la API para un reporte.
    """

    # Nombre o tipo del reporte generado.
    name: str

    # Datos principales que forman el reporte.
    data: List[Dict[str, Any]]

    # Cantidad total de registros incluidos en el reporte.
    total: int