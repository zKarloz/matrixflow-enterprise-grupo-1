// ============================================================
// MatrixFlow Enterprise
// Historial de auditoría
// ============================================================
//
// Esta página muestra los registros reales generados por el
// backend.
//
// Flujo:
// React
//   ↓
// getAuditLogs()
//   ↓
// GET /api/v1/audit
//   ↓
// FastAPI
//   ↓
// PostgreSQL / audit_logs
//
// IMPORTANTE:
// Ya no utilizamos datos iniciales simulados ni mantenemos
// un historial falso dentro de React.
// ============================================================

import { useEffect, useMemo, useState } from 'react'

import {
  getAuditLogs,
  type AuditLog,
} from '../services/api'

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

function Historial() {
  // ----------------------------------------------------------
  // DATOS
  // ----------------------------------------------------------

  // Registros reales obtenidos desde el backend.
  const [logs, setLogs] = useState<AuditLog[]>([])

  // ----------------------------------------------------------
  // ESTADOS DE INTERFAZ
  // ----------------------------------------------------------

  // Indica si estamos esperando la respuesta del backend.
  const [loading, setLoading] = useState(true)

  // Mensaje de error.
  const [error, setError] = useState('')

  // Texto utilizado para filtrar el historial.
  const [search, setSearch] = useState('')

  // Filtro por tipo de acción.
  const [actionFilter, setActionFilter] = useState('Todas')

  // ==========================================================
  // CARGAR AUDITORÍA
  // ==========================================================

  useEffect(() => {
    // Función encargada de consultar FastAPI.
    const loadAuditLogs = async () => {
      try {
        setLoading(true)
        setError('')

        // Consulta real a /api/v1/audit.
        const data = await getAuditLogs()

        setLogs(data)
      } catch (requestError) {
        console.error(
          'Error al cargar el historial:',
          requestError,
        )

        setError(
          requestError instanceof Error
            ? requestError.message
            : 'No se pudo cargar el historial.',
        )
      } finally {
        setLoading(false)
      }
    }

    loadAuditLogs()
  }, [])

  // ==========================================================
  // TIPOS DE ACCIÓN DISPONIBLES
  // ==========================================================

  const actionTypes = useMemo(() => {
    // Obtenemos las acciones realmente presentes en los datos.
    const actions = logs
      .map((log) => log.action)
      .filter(Boolean)

    // Eliminamos duplicados.
    return Array.from(new Set(actions))
  }, [logs])

  // ==========================================================
  // FILTRADO
  // ==========================================================

  const filteredLogs = useMemo(() => {
    // Normalizamos la búsqueda.
    const searchText = search.trim().toLowerCase()

    return logs.filter((log) => {
      // ------------------------------------------------------
      // Filtro por acción
      // ------------------------------------------------------

      const matchesAction =
        actionFilter === 'Todas' ||
        log.action === actionFilter

      // ------------------------------------------------------
      // Filtro de texto
      // ------------------------------------------------------

      const searchableText = [
        log.action,
        log.table_name ?? '',
        log.description ?? '',
        log.user_id?.toString() ?? '',
        log.record_id?.toString() ?? '',
      ]
        .join(' ')
        .toLowerCase()

      const matchesSearch =
        !searchText ||
        searchableText.includes(searchText)

      return matchesAction && matchesSearch
    })
  }, [logs, search, actionFilter])

  // ==========================================================
  // FORMATEAR FECHA
  // ==========================================================

  const formatDate = (date: string) => {
    // Convertimos la fecha ISO recibida por FastAPI
    // a un formato legible para el usuario.
    const parsedDate = new Date(date)

    if (Number.isNaN(parsedDate.getTime())) {
      return date
    }

    return parsedDate.toLocaleString('es-PE', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }

  // ==========================================================
  // CLASE VISUAL PARA LA ACCIÓN
  // ==========================================================

  const getActionClass = (action: string) => {
    // Acciones relacionadas con creación.
    if (
      action.toLowerCase().includes('create') ||
      action.toLowerCase().includes('crear')
    ) {
      return 'bg-green-50 text-green-700'
    }

    // Acciones relacionadas con eliminación.
    if (
      action.toLowerCase().includes('delete') ||
      action.toLowerCase().includes('eliminar')
    ) {
      return 'bg-red-50 text-red-700'
    }

    // Acciones relacionadas con actualización.
    if (
      action.toLowerCase().includes('update') ||
      action.toLowerCase().includes('actualizar')
    ) {
      return 'bg-amber-50 text-amber-700'
    }

    // Acciones de autenticación.
    if (
      action.toLowerCase().includes('login') ||
      action.toLowerCase().includes('logout')
    ) {
      return 'bg-blue-50 text-blue-700'
    }

    // Acción genérica.
    return 'bg-slate-100 text-slate-700'
  }

  // ==========================================================
  // RESUMEN
  // ==========================================================

  const uniqueUsers = new Set(
    logs
      .map((log) => log.user_id)
      .filter(
        (userId): userId is number =>
          userId !== null,
      ),
  ).size

  const uniqueTables = new Set(
    logs
      .map((log) => log.table_name)
      .filter(
        (table): table is string =>
          table !== null,
      ),
  ).size

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div>
      {/* ====================================================
          ENCABEZADO
          ==================================================== */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Historial
        </h1>

        <p className="mt-2 text-slate-500">
          Registro de actividades y eventos del sistema.
        </p>
      </div>

      {/* ====================================================
          ERROR
          ==================================================== */}

      {error && (
        <div className="mb-6 flex items-start justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError('')}
            className="font-semibold hover:text-red-900"
          >
            ×
          </button>
        </div>
      )}

      {/* ====================================================
          RESUMEN
          ==================================================== */}

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Eventos registrados
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {logs.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Usuarios involucrados
          </p>

          <p className="mt-2 text-2xl font-bold text-blue-600">
            {uniqueUsers}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Tablas afectadas
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-700">
            {uniqueTables}
          </p>
        </div>
      </div>

      {/* ====================================================
          FILTROS
          ==================================================== */}

      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Buscador */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Buscar
            </label>

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Acción, tabla, usuario, descripción..."
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
            />
          </div>

          {/* Filtro por acción */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Acción
            </label>

            <select
              value={actionFilter}
              onChange={(event) =>
                setActionFilter(event.target.value)
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500"
            >
              <option value="Todas">
                Todas
              </option>

              {actionTypes.map((action) => (
                <option
                  key={action}
                  value={action}
                >
                  {action}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ====================================================
          TABLA DE AUDITORÍA
          ==================================================== */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Cargando historial...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-8 text-center">
            <p className="font-medium text-slate-700">
              No se encontraron registros.
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Prueba modificando los filtros.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Fecha
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Acción
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Usuario
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Tabla
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Registro
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Descripción
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="transition hover:bg-slate-50"
                  >
                    {/* Fecha */}
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                      {formatDate(log.created_at)}
                    </td>

                    {/* Acción */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getActionClass(log.action)}`}
                      >
                        {log.action}
                      </span>
                    </td>

                    {/* Usuario */}
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {log.user_id !== null
                        ? `Usuario #${log.user_id}`
                        : 'Sistema'}
                    </td>

                    {/* Tabla */}
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {log.table_name ?? '—'}
                    </td>

                    {/* Registro */}
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {log.record_id !== null
                        ? `#${log.record_id}`
                        : '—'}
                    </td>

                    {/* Descripción */}
                    <td className="max-w-md px-6 py-4 text-sm text-slate-600">
                      {log.description ?? 'Sin descripción'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Historial
