import { useEffect, useMemo, useState } from 'react'

import PeruAccessMap from '../components/security/PeruAccessMap'

import {
    Activity,
    AlertCircle,
    Clock3,
    Globe2,
    LogIn,
    MapPin,
    Monitor,
    ShieldCheck,
    Users,
} from 'lucide-react'

import {
    getAuditLogs,
    type AuditLog,
} from '../services/api'


// ============================================================
// FUNCIONES AUXILIARES
// ============================================================

function getLocationLabel(
    log: AuditLog,
) {
    const values = [
        log.city,
        log.region,
        log.country,
    ].filter(Boolean)

    if (values.length === 0) {
        return 'Ubicación no disponible'
    }

    // Evitamos repetir valores como:
    // Lima, Lima, Peru.
    return [...new Set(values)].join(', ')
}


function getBrowserLabel(
    userAgent: string | null,
) {
    if (!userAgent) {
        return 'Navegador no disponible'
    }

    if (userAgent.includes('Edg/')) {
        return 'Microsoft Edge'
    }

    if (userAgent.includes('Firefox/')) {
        return 'Mozilla Firefox'
    }

    if (
        userAgent.includes('Chrome/') &&
        !userAgent.includes('Edg/')
    ) {
        return 'Chrome / Chromium'
    }

    if (
        userAgent.includes('Safari/') &&
        !userAgent.includes('Chrome/')
    ) {
        return 'Safari'
    }

    return 'Navegador identificado'
}


// ============================================================
// PÁGINA
// ============================================================

function Seguridad() {
    // Registros obtenidos desde audit_logs.
    const [auditLogs, setAuditLogs] =
        useState<AuditLog[]>([])

    // Estado general de carga.
    const [loading, setLoading] =
        useState(true)

    // Mensaje de error de la página.
    const [error, setError] =
        useState('')


    // ----------------------------------------------------------
    // CARGA DE AUDITORÍA
    // ----------------------------------------------------------

    useEffect(() => {
        async function loadAuditLogs() {
            try {
                setLoading(true)
                setError('')

                const logs =
                    await getAuditLogs()

                setAuditLogs(logs)
            } catch (requestError) {
                setError(
                    requestError instanceof Error
                        ? requestError.message
                        : 'No se pudieron cargar los registros de seguridad.',
                )
            } finally {
                setLoading(false)
            }
        }

        void loadAuditLogs()
    }, [])


    // ----------------------------------------------------------
    // ACCESOS
    // ----------------------------------------------------------

    // Filtramos únicamente los registros correspondientes
    // a inicios de sesión y los ordenamos del más reciente
    // al más antiguo.
    const loginLogs = useMemo(
        () =>
            auditLogs
                .filter((log) =>
                    log.action
                        .toLowerCase()
                        .includes('inicio de sesión'),
                )
                .sort(
                    (a, b) =>
                        new Date(
                            b.created_at,
                        ).getTime() -
                        new Date(
                            a.created_at,
                        ).getTime(),
                ),
        [auditLogs],
    )


    // El primer registro corresponde al último acceso.
    const latestAccess =
        loginLogs[0] ?? null


    // Cantidad de usuarios distintos que aparecen
    // en el historial de accesos.
    const uniqueUsers = useMemo(
        () =>
            new Set(
                loginLogs
                    .map(
                        (log) =>
                            log.user_id,
                    )
                    .filter(
                        (value) =>
                            value !== null,
                    ),
            ).size,
        [loginLogs],
    )


    return (
        <div className="mx-auto max-w-7xl space-y-6">
            {/* El título principal ya se muestra en el Header global. */}
            <p className="max-w-3xl text-sm leading-6 text-slate-500">
                Supervisa los accesos registrados, direcciones IP,
                ubicación aproximada y actividad relacionada con la
                seguridad de MatrixFlow Enterprise.
            </p>


            {/* ======================================================
          ERROR
          ====================================================== */}

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle
                            size={20}
                            className="mt-0.5 shrink-0 text-red-600"
                        />

                        <div>
                            <p className="font-semibold text-red-800">
                                No fue posible cargar la información de seguridad
                            </p>

                            <p className="mt-1 text-sm text-red-700">
                                {error}
                            </p>
                        </div>
                    </div>
                </div>
            )}


            {/* ======================================================
          INDICADORES
          ====================================================== */}

            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Accesos registrados
                            </p>

                            <p className="mt-2 text-2xl font-bold text-slate-900">
                                {loginLogs.length}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                                Inicios de sesión registrados
                            </p>
                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <LogIn size={20} />
                        </div>
                    </div>
                </div>


                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Usuarios identificados
                            </p>

                            <p className="mt-2 text-2xl font-bold text-slate-900">
                                {uniqueUsers}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                                Usuarios con accesos registrados
                            </p>
                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                            <Users size={20} />
                        </div>
                    </div>
                </div>


                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-emerald-700">
                                Auditoría de accesos
                            </p>

                            <p className="mt-2 text-xl font-bold text-emerald-900">
                                Activa
                            </p>

                            <p className="mt-1 text-xs text-emerald-700">
                                Trazabilidad disponible
                            </p>
                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/70 text-emerald-700">
                            <ShieldCheck size={20} />
                        </div>
                    </div>
                </div>
            </div>


            {/* ======================================================
          ÚLTIMO ACCESO + MAPA REAL
          ====================================================== */}

            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                {/* Información del último acceso. */}
                <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                            <ShieldCheck size={20} />
                        </div>

                        <div>
                            <h2 className="font-semibold text-slate-900">
                                Último acceso
                            </h2>

                            <p className="text-sm text-slate-500">
                                Información registrada durante la autenticación.
                            </p>
                        </div>
                    </div>


                    {loading ? (
                        <div className="mt-6 space-y-4">
                            {[1, 2, 3, 4].map(
                                (item) => (
                                    <div
                                        key={item}
                                        className="h-14 animate-pulse rounded-lg bg-slate-100"
                                    />
                                ),
                            )}
                        </div>
                    ) : latestAccess ? (
                        <div className="mt-6 divide-y divide-slate-100">
                            {/* Dirección IP. */}
                            <div className="flex items-start gap-3 py-4">
                                <Globe2
                                    size={18}
                                    className="mt-0.5 text-slate-400"
                                />

                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                        Dirección IP
                                    </p>

                                    <p className="mt-1 font-mono text-sm font-semibold text-slate-800">
                                        {latestAccess.ip_address ??
                                            'No disponible'}
                                    </p>
                                </div>
                            </div>


                            {/* Ubicación aproximada. */}
                            <div className="flex items-start gap-3 py-4">
                                <MapPin
                                    size={18}
                                    className="mt-0.5 text-slate-400"
                                />

                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                        Ubicación aproximada
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-slate-800">
                                        {getLocationLabel(
                                            latestAccess,
                                        )}
                                    </p>
                                </div>
                            </div>


                            {/* Navegador. */}
                            <div className="flex items-start gap-3 py-4">
                                <Monitor
                                    size={18}
                                    className="mt-0.5 text-slate-400"
                                />

                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                        Navegador
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-slate-800">
                                        {getBrowserLabel(
                                            latestAccess.user_agent,
                                        )}
                                    </p>

                                    <p className="mt-1 max-w-sm break-all text-xs leading-5 text-slate-400">
                                        {latestAccess.user_agent}
                                    </p>
                                </div>
                            </div>


                            {/* Fecha y hora. */}
                            <div className="flex items-start gap-3 py-4">
                                <Clock3
                                    size={18}
                                    className="mt-0.5 text-slate-400"
                                />

                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                        Fecha y hora
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-slate-800">
                                        {new Date(
                                            latestAccess.created_at,
                                        ).toLocaleString(
                                            'es-PE',
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="mt-6 text-sm text-slate-500">
                            No existen accesos registrados.
                        </p>
                    )}
                </section>


                {/* El componente especializado se encarga ahora de:
            - cargar el GeoJSON real del Perú,
            - dibujar los departamentos,
            - proyectar las coordenadas,
            - mostrar el marcador del último acceso. */}
                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-6 py-5">
                        <h2 className="font-semibold text-slate-900">
                            Ubicación del último acceso
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Ubicación aproximada obtenida desde la dirección IP.
                        </p>
                    </div>


                    {loading ? (
                        <div className="flex min-h-[520px] items-center justify-center bg-slate-50">
                            <div className="h-72 w-52 animate-pulse rounded-2xl bg-slate-200" />
                        </div>
                    ) : (
                        <PeruAccessMap
                            latitude={
                                latestAccess?.latitude != null
                                    ? Number(
                                        latestAccess.latitude,
                                    )
                                    : null
                            }
                            longitude={
                                latestAccess?.longitude != null
                                    ? Number(
                                        latestAccess.longitude,
                                    )
                                    : null
                            }
                            city={
                                latestAccess?.city ??
                                null
                            }
                            region={
                                latestAccess?.region ??
                                null
                            }
                            country={
                                latestAccess?.country ??
                                null
                            }
                        />
                    )}
                </section>
            </div>


            {/* ======================================================
          HISTORIAL DE ACCESOS
          ====================================================== */}

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-6 py-5">
                    <div className="flex items-center gap-3">
                        <Activity
                            size={19}
                            className="text-slate-500"
                        />

                        <div>
                            <h2 className="font-semibold text-slate-900">
                                Historial de accesos
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Inicios de sesión registrados por MatrixFlow.
                            </p>
                        </div>
                    </div>
                </div>


                {loading ? (
                    <div className="space-y-3 p-6">
                        {[1, 2, 3, 4].map(
                            (item) => (
                                <div
                                    key={item}
                                    className="h-12 animate-pulse rounded-lg bg-slate-100"
                                />
                            ),
                        )}
                    </div>
                ) : loginLogs.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[950px] text-left">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50">
                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Usuario
                                    </th>

                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Dirección IP
                                    </th>

                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Ubicación
                                    </th>

                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Navegador
                                    </th>

                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Fecha y hora
                                    </th>

                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Estado
                                    </th>
                                </tr>
                            </thead>


                            <tbody className="divide-y divide-slate-100">
                                {loginLogs.map((log) => (
                                    <tr
                                        key={log.id}
                                        className="transition-colors hover:bg-slate-50"
                                    >
                                        <td className="px-5 py-4">
                                            <p className="text-sm font-semibold text-slate-900">
                                                Usuario #{log.user_id}
                                            </p>

                                            <p className="mt-0.5 text-xs text-slate-400">
                                                ID de cuenta
                                            </p>
                                        </td>


                                        <td className="px-5 py-4">
                                            <span className="rounded-md bg-slate-100 px-2.5 py-1 font-mono text-xs text-slate-700">
                                                {log.ip_address ??
                                                    'No disponible'}
                                            </span>
                                        </td>


                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2 text-sm text-slate-700">
                                                <MapPin
                                                    size={15}
                                                    className="shrink-0 text-slate-400"
                                                />

                                                {getLocationLabel(
                                                    log,
                                                )}
                                            </div>
                                        </td>


                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <Monitor
                                                    size={15}
                                                    className="shrink-0 text-slate-400"
                                                />

                                                {getBrowserLabel(
                                                    log.user_agent,
                                                )}
                                            </div>
                                        </td>


                                        <td className="px-5 py-4 text-sm text-slate-600">
                                            {new Date(
                                                log.created_at,
                                            ).toLocaleString(
                                                'es-PE',
                                            )}
                                        </td>


                                        <td className="px-5 py-4">
                                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                                <ShieldCheck size={13} />
                                                Exitoso
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="px-6 py-14 text-center">
                        <ShieldCheck
                            size={36}
                            className="mx-auto text-slate-300"
                        />

                        <h3 className="mt-3 font-semibold text-slate-900">
                            No existen accesos registrados
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            Los próximos inicios de sesión aparecerán aquí.
                        </p>
                    </div>
                )}
            </section>


            {/* Advertencia para no presentar la geolocalización
          de IP como una ubicación GPS exacta. */}
            <p className="text-xs leading-5 text-slate-400">
                La ubicación mostrada es aproximada y se obtiene a partir
                de la dirección IP pública. No representa una ubicación GPS
                exacta del usuario.
            </p>
        </div>
    )
}


export default Seguridad