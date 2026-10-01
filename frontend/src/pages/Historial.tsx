import { useEffect, useMemo, useState } from 'react'

import {
  getAuditLogs,
  type AuditLog,
} from '../services/api'

function Historial() {
  // Guardamos los registros reales de auditoría.
  const [logs, setLogs] = useState<AuditLog[]>([])

  // Controlamos el estado de carga.
  const [loading, setLoading] = useState(true)

  // Guardamos cualquier mensaje de error.
  const [error, setError] = useState('')

  // Texto utilizado para buscar dentro del historial.
  const [search, setSearch] = useState('')

  // Filtro utilizado para seleccionar un tipo de acción.
  const [actionFilter, setActionFilter] = useState('Todas')

  // ============================================================
  // CARGA DEL HISTORIAL
  // ============================================================

  useEffect(() => {
    // Consultamos los registros cuando se monta la página.
    const loadAuditLogs = async () => {
      try {
        setLoading(true)
        setError('')

        // Obtenemos los registros reales mediante el servicio existente.
        const data = await getAuditLogs()

        // Guardamos los resultados para mostrarlos en la tabla.
        setLogs(data)
      } catch (requestError) {
        // Registramos el error para facilitar la depuración.
        console.error(
          'Error al cargar el historial:',
          requestError,
        )

        // Mostramos un mensaje comprensible para el usuario.
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'No se pudo cargar el historial.',
        )
      } finally {
        // Finalizamos el estado de carga.
        setLoading(false)
      }
    }

    loadAuditLogs()
  }, [])

  // ============================================================
  // TIPOS DE ACCIÓN
  // ============================================================

  const actionTypes = useMemo(() => {
    // Obtenemos las acciones realmente presentes en los registros.
    const actions = logs
      .map((log) => log.action)
      .filter(Boolean)

    // Eliminamos acciones repetidas.
    return Array.from(new Set(actions))
  }, [logs])

  // ============================================================
  // FILTRADO
  // ============================================================

  const filteredLogs = useMemo(() => {
    // Normalizamos el texto de búsqueda.
    const searchText = search.trim().toLowerCase()

    return logs.filter((log) => {
      // Comprobamos si coincide con el filtro de acción.
      const matchesAction =
        actionFilter === 'Todas' ||
        log.action === actionFilter

      // Construimos el texto que puede ser utilizado para buscar.
      const searchableText = [
        log.action,
        log.table_name ?? '',
        log.description ?? '',
        log.user_id?.toString() ?? '',
        log.record_id?.toString() ?? '',
      ]
        .join(' ')
        .toLowerCase()

      // Comprobamos si coincide con el texto introducido.
      const matchesSearch =
        !searchText ||
        searchableText.includes(searchText)

      return matchesAction && matchesSearch
    })
  }, [logs, search, actionFilter])

  // ============================================================
  // FORMATO DE FECHA
  // ============================================================

  const formatDate = (date: string) => {
    // Convertimos la fecha recibida en una fecha legible.
    const parsedDate = new Date(date)

    // Si la fecha no es válida, mostramos el valor original.
    if (Number.isNaN(parsedDate.getTime())) {
      return date
    }

    // Formateamos la fecha para el contexto local.
    return parsedDate.toLocaleString('es-PE', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }

  // ============================================================
  // ESTILO VISUAL DE LA ACCIÓN
  // ============================================================

  const getActionClass = (action: string) => {
    // Normalizamos la acción para facilitar las comparaciones.
    const normalizedAction = action.toLowerCase()

    // Las acciones de creación utilizan verde.
    if (
      normalizedAction.includes('create') ||
      normalizedAction.includes('crear')
    ) {
      return 'bg-emerald-50 text-emerald-700'
    }

    // Las acciones de eliminación utilizan rojo.
    if (
      normalizedAction.includes('delete') ||
      normalizedAction.includes('eliminar')
    ) {
      return 'bg-red-50 text-red-700'
    }

    // Las acciones de actualización utilizan ámbar.
    if (
      normalizedAction.includes('update') ||
      normalizedAction.includes('actualizar')
    ) {
      return 'bg-amber-50 text-amber-700'
    }

    // Las acciones de autenticación utilizan un azul discreto.
    if (
      normalizedAction.includes('login') ||
      normalizedAction.includes('logout')
    ) {
      return 'bg-blue-50 text-blue-700'
    }

    // Para cualquier otra acción utilizamos un estilo neutro.
    return 'bg-slate-100 text-slate-700'
  }

  // ============================================================
  // RESUMEN
  // ============================================================

  // Calculamos cuántos usuarios distintos aparecen en la auditoría.
  const uniqueUsers = new Set(
    logs
      .map((log) => log.user_id)
      .filter(
        (userId): userId is number =>
          userId !== null,
      ),
  ).size

  // Calculamos cuántas tablas diferentes aparecen afectadas.
  const uniqueTables = new Set(
    logs
      .map((log) => log.table_name)
      .filter(
        (table): table is string =>
          table !== null,
      ),
  ).size

  return (
    <div className="min-h-full bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* ============================================================
            ENCABEZADO
            ============================================================ */}
        <div>
          <p className="text-sm font-medium text-slate-500">
            Seguridad y trazabilidad
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Historial
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Registro de actividades y eventos del sistema.
          </p>
        </div>

        {/* ============================================================
            MENSAJE DE ERROR
            ============================================================ */}
        {error && (
          <div className="flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-white px-5 py-4 shadow-sm">
            <div>
              <p className="text-sm font-semibold text-red-700">
                No se pudo cargar el historial
              </p>

              <p className="mt-1 text-sm text-red-600">
                {error}
              </p>
            </div>

            {/* Permite cerrar visualmente el mensaje. */}
            <button
              type="button"
              onClick={() => setError('')}
              aria-label="Cerrar mensaje"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-lg text-red-400 transition-colors hover:bg-red-50 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {/* ============================================================
            RESUMEN
            ============================================================ */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Total de eventos registrados. */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Eventos registrados
            </p>

            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              {logs.length}
            </p>
          </div>

          {/* Usuarios distintos que aparecen en la auditoría. */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Usuarios involucrados
            </p>

            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              {uniqueUsers}
            </p>
          </div>

          {/* Tablas distintas afectadas por las operaciones. */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Tablas afectadas
            </p>

            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              {uniqueTables}
            </p>
          </div>
        </div>

        {/* ============================================================
            FILTROS
            ============================================================ */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-[1fr_280px]">
            {/* Buscador general. */}
            <div>
              <label
                htmlFor="history-search"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Buscar
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  ⌕
                </span>

                <input
                  id="history-search"
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Acción, tabla, usuario, descripción..."
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-900 outline-none transition-shadow placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
              </div>
            </div>

            {/* Filtro por tipo de acción. */}
            <div>
              <label
                htmlFor="history-action"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Acción
              </label>

              <select
                id="history-action"
                value={actionFilter}
                onChange={(event) =>
                  setActionFilter(event.target.value)
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition-shadow focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              >
                <option value="Todas">Todas</option>

                {actionTypes.map((action) => (
                  <option key={action} value={action}>
                    {action}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ============================================================
            TABLA DE AUDITORÍA
            ============================================================ */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            /* Estado de carga visual. */
            <div className="space-y-4 p-6">
              <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />

              <div className="space-y-3">
                <div className="h-12 animate-pulse rounded-lg bg-slate-100" />
                <div className="h-12 animate-pulse rounded-lg bg-slate-100" />
                <div className="h-12 animate-pulse rounded-lg bg-slate-100" />
                <div className="h-12 animate-pulse rounded-lg bg-slate-100" />
              </div>
            </div>
          ) : filteredLogs.length === 0 ? (
            /* Estado mostrado cuando los filtros no encuentran registros. */
            <div className="px-6 py-14 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                ⌕
              </div>

              <p className="mt-3 text-sm font-semibold text-slate-700">
                No se encontraron registros
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Prueba modificando los filtros de búsqueda.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Fecha
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Acción
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Usuario
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Tabla
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Registro
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Descripción
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-slate-100 transition-colors last:border-b-0 hover:bg-slate-50"
                    >
                      {/* Fecha del evento. */}
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                        {formatDate(log.created_at)}
                      </td>

                      {/* Acción realizada. */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getActionClass(
                            log.action,
                          )}`}
                        >
                          {log.action}
                        </span>
                      </td>

                      {/* Usuario responsable del evento. */}
                      <td className="px-5 py-4 text-sm text-slate-700">
                        {log.user_id !== null
                          ? `Usuario #${log.user_id}`
                          : 'Sistema'}
                      </td>

                      {/* Tabla afectada por el evento. */}
                      <td className="px-5 py-4 text-sm font-medium text-slate-700">
                        {log.table_name ?? '—'}
                      </td>

                      {/* Identificador del registro afectado. */}
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {log.record_id !== null
                          ? `#${log.record_id}`
                          : '—'}
                      </td>

                      {/* Descripción asociada al evento. */}
                      <td className="max-w-md px-5 py-4 text-sm text-slate-600">
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
    </div>
  )
}

export default Historial