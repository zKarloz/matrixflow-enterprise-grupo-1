// ============================================================
// MatrixFlow Enterprise
// Página de Seguridad y Accesos
// ============================================================
//
// Esta página presenta los registros de seguridad y acceso
// disponibles para el usuario, junto con una visualización
// geográfica aproximada.
//
// Se conserva la lógica existente de consulta de auditoría.
// El cambio se concentra en la presentación visual y UX.
// ============================================================

import { useEffect, useMemo, useState } from 'react'

import {
    getAuditLogs,
    type AuditLog,
} from '../services/api'

// Componentes utilizados para mostrar el mapa de accesos.
import {
    MapContainer,
    Marker,
    Popup,
    TileLayer,
} from 'react-leaflet'

// Hoja de estilos necesaria para que Leaflet funcione correctamente.
import 'leaflet/dist/leaflet.css'

function Seguridad() {
    // Guarda los registros de auditoría obtenidos.
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])

    // Controla el estado de carga de los registros.
    const [loading, setLoading] = useState(true)

    // Guarda cualquier mensaje de error producido durante la consulta.
    const [error, setError] = useState<string | null>(null)

    // Consulta los registros de auditoría al cargar la página.
    useEffect(() => {
        const loadAuditLogs = async () => {
            try {
                // Limpiamos cualquier error anterior.
                setError(null)

                // Solicitamos los registros de seguridad.
                const logs = await getAuditLogs()

                // Guardamos los resultados para mostrarlos en pantalla.
                setAuditLogs(logs)
            } catch (err) {
                // Mostramos un mensaje amigable si la consulta falla.
                setError(
                    err instanceof Error
                        ? err.message
                        : 'No se pudieron cargar los registros de seguridad.'
                )
            } finally {
                // Finalizamos el estado de carga.
                setLoading(false)
            }
        }

        loadAuditLogs()
    }, [])

    // Extrae la dirección IP almacenada dentro de la descripción.
    const getIpAddress = (description: string | null) => {
        if (!description) {
            return 'IP no disponible'
        }

        // Busca el texto ubicado después de "IP:".
        const match = description.match(/IP:\s*(.+)$/)

        return match?.[1] ?? 'IP no disponible'
    }

    // Calcula algunos indicadores a partir de los registros reales.
    const securitySummary = useMemo(() => {
        // Cuenta los usuarios diferentes presentes en los registros.
        const uniqueUsers = new Set(
            auditLogs
                .map((log) => log.user_id)
                .filter((userId) => userId !== null && userId !== undefined)
        ).size

        // Cuenta las acciones diferentes registradas.
        const uniqueActions = new Set(
            auditLogs.map((log) => log.action)
        ).size

        return {
            total: auditLogs.length,
            users: uniqueUsers,
            actions: uniqueActions,
        }
    }, [auditLogs])

    // Devuelve una clase visual según el tipo de acción registrada.
    const getActionClass = (action: string) => {
        const normalizedAction = action.toLowerCase()

        // Acciones de acceso se muestran en tonos verdes.
        if (
            normalizedAction.includes('login') ||
            normalizedAction.includes('crear') ||
            normalizedAction.includes('create')
        ) {
            return 'bg-emerald-50 text-emerald-700 border-emerald-200'
        }

        // Acciones de eliminación se muestran en rojo.
        if (
            normalizedAction.includes('delete') ||
            normalizedAction.includes('eliminar')
        ) {
            return 'bg-red-50 text-red-700 border-red-200'
        }

        // Actualizaciones se muestran en ámbar.
        if (
            normalizedAction.includes('update') ||
            normalizedAction.includes('actualizar')
        ) {
            return 'bg-amber-50 text-amber-700 border-amber-200'
        }

        // El resto utiliza una apariencia neutra.
        return 'bg-slate-100 text-slate-700 border-slate-200'
    }

    return (
        <div className="min-h-full bg-slate-50 p-6">
            <div className="mx-auto max-w-7xl space-y-6">

                {/* =====================================================
                    ENCABEZADO
                    ===================================================== */}
                <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500">
                            Seguridad
                        </p>

                        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                            Seguridad y accesos
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm text-slate-600">
                            Supervisa las actividades y accesos registrados
                            dentro de MatrixFlow.
                        </p>
                    </div>

                    {/* Indicador compacto para evitar repetir el total en otra sección. */}
                    {!loading && !error && (
                        <div className="rounded-xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                Eventos registrados
                            </p>

                            <p className="mt-1 text-2xl font-bold text-slate-900">
                                {securitySummary.total}
                            </p>
                        </div>
                    )}
                </header>

                {/* =====================================================
                    ERROR
                    ===================================================== */}
                {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4">
                        <p className="text-sm font-medium text-red-800">
                            No fue posible cargar la información de seguridad.
                        </p>

                        <p className="mt-1 text-sm text-red-600">
                            {error}
                        </p>
                    </div>
                )}

                {/* =====================================================
                    INDICADORES
                    ===================================================== */}
                {!loading && !error && (
                    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {/* Usuarios involucrados en los registros. */}
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-sm font-medium text-slate-500">
                                Usuarios involucrados
                            </p>

                            <p className="mt-2 text-3xl font-bold text-slate-900">
                                {securitySummary.users}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                                Usuarios con actividad registrada
                            </p>
                        </div>

                        {/* Tipos de acciones registradas. */}
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-sm font-medium text-slate-500">
                                Tipos de actividad
                            </p>

                            <p className="mt-2 text-3xl font-bold text-slate-900">
                                {securitySummary.actions}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                                Acciones diferentes registradas
                            </p>
                        </div>

                        {/* Estado general de la trazabilidad. */}
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-emerald-700">
                                        Trazabilidad
                                    </p>

                                    <p className="mt-2 text-xl font-bold text-emerald-900">
                                        Activa
                                    </p>

                                    <p className="mt-1 text-xs text-emerald-700">
                                        Registro de actividades disponible
                                    </p>
                                </div>

                                <span className="mt-1 h-3 w-3 rounded-full bg-emerald-500" />
                            </div>
                        </div>
                    </section>
                )}

                {/* =====================================================
                    MAPA DE ACCESOS
                    ===================================================== */}
                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-6 py-5">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-lg font-semibold text-slate-900">
                                Ubicación de accesos
                            </h2>

                            <p className="text-sm text-slate-500">
                                Visualización geográfica aproximada de los accesos registrados.
                            </p>
                        </div>
                    </div>

                    {/* El mapa mantiene la ubicación utilizada actualmente. */}
                    <div className="h-96 w-full">
                        <MapContainer
                            center={[-12.0464, -77.0428]}
                            zoom={11}
                            scrollWheelZoom={true}
                            className="h-full w-full"
                        >
                            {/* Capa visual proporcionada por OpenStreetMap. */}
                            <TileLayer
                                attribution="&copy; OpenStreetMap contributors"
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />

                            {/* Marcador representativo de la ubicación actual de referencia. */}
                            <Marker position={[-12.0464, -77.0428]}>
                                <Popup>
                                    <strong>MatrixFlow Enterprise</strong>
                                    <br />
                                    Ubicación aproximada
                                    <br />
                                    Lima, Perú
                                </Popup>
                            </Marker>
                        </MapContainer>
                    </div>
                </section>

                {/* =====================================================
                    HISTORIAL DE ACCESOS
                    ===================================================== */}
                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-6 py-5">
                        <h2 className="text-lg font-semibold text-slate-900">
                            Historial de accesos
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Consulta las actividades registradas y sus datos asociados.
                        </p>
                    </div>

                    {/* Estado de carga con skeleton para mantener la estructura visual. */}
                    {loading && (
                        <div className="space-y-3 p-6">
                            <div className="h-10 animate-pulse rounded-lg bg-slate-100" />
                            <div className="h-10 animate-pulse rounded-lg bg-slate-100" />
                            <div className="h-10 animate-pulse rounded-lg bg-slate-100" />
                            <div className="h-10 animate-pulse rounded-lg bg-slate-100" />
                        </div>
                    )}

                    {/* Tabla cuando existen registros. */}
                    {!loading && !error && auditLogs.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[760px] text-left text-sm">
                                <thead className="bg-slate-50">
                                    <tr className="border-b border-slate-200">
                                        <th className="px-6 py-4 font-semibold text-slate-600">
                                            Usuario
                                        </th>

                                        <th className="px-6 py-4 font-semibold text-slate-600">
                                            Acción
                                        </th>

                                        <th className="px-6 py-4 font-semibold text-slate-600">
                                            Dirección IP
                                        </th>

                                        <th className="px-6 py-4 font-semibold text-slate-600">
                                            Fecha y hora
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {auditLogs.map((log) => (
                                        <tr
                                            key={log.id}
                                            className="border-b border-slate-100 transition-colors hover:bg-slate-50"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {/* Avatar visual basado en el identificador del usuario. */}
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                                                        {log.user_id ?? '—'}
                                                    </div>

                                                    <div>
                                                        <p className="font-medium text-slate-900">
                                                            Usuario #{log.user_id ?? 'N/A'}
                                                        </p>

                                                        <p className="text-xs text-slate-500">
                                                            Actividad registrada
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getActionClass(
                                                        log.action
                                                    )}`}
                                                >
                                                    {log.action}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4">
                                                <span className="rounded-md bg-slate-100 px-2.5 py-1 font-mono text-xs text-slate-700">
                                                    {getIpAddress(log.description)}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 text-slate-600">
                                                {new Date(
                                                    log.created_at
                                                ).toLocaleString('es-PE')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Estado vacío cuando no existen registros. */}
                    {!loading && !error && auditLogs.length === 0 && (
                        <div className="px-6 py-12 text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-500">
                                ✓
                            </div>

                            <h3 className="mt-4 text-sm font-semibold text-slate-900">
                                No existen registros de acceso
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                                Cuando se registren nuevas actividades aparecerán aquí.
                            </p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}

export default Seguridad