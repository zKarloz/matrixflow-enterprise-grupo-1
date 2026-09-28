// ============================================================
// MatrixFlow Enterprise
// Página de Seguridad y Accesos
// ============================================================
//
// Esta página consulta los registros de auditoría del backend
// y muestra los accesos registrados por el sistema.
//
// Actualmente muestra:
//   - Usuario
//   - Acción realizada
//   - Dirección IP
//   - Fecha y hora
//
// La página incluye un mapa con una ubicación aproximada
// para visualizar los accesos durante el desarrollo.
// ============================================================

import { useEffect, useState } from 'react'

import {
    getAuditLogs,
    type AuditLog,
} from '../services/api'

// Componentes de React-Leaflet utilizados para construir el mapa.
import {
    MapContainer,
    Marker,
    Popup,
    TileLayer,
} from 'react-leaflet'

// Hoja de estilos necesaria para que Leaflet se visualice correctamente.
import 'leaflet/dist/leaflet.css'


function Seguridad() {
    // Guarda los registros obtenidos desde el backend.
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])

    // Indica si todavía estamos consultando el backend.
    const [loading, setLoading] = useState(true)

    // Guarda un posible mensaje de error.
    const [error, setError] = useState<string | null>(null)


    // Consulta los registros cuando se carga la página.
    useEffect(() => {
        const loadAuditLogs = async () => {
            try {
                // Limpiamos cualquier error anterior.
                setError(null)

                // Solicitamos los registros al backend.
                const logs = await getAuditLogs()

                // Guardamos los registros para mostrarlos en pantalla.
                setAuditLogs(logs)
            } catch (err) {
                // Mostramos un mensaje si la consulta falla.
                setError(
                    err instanceof Error
                        ? err.message
                        : 'No se pudieron cargar los accesos.'
                )
            } finally {
                // Terminamos el estado de carga.
                setLoading(false)
            }
        }

        loadAuditLogs()
    }, [])


    // Extrae la dirección IP almacenada dentro de description.
    const getIpAddress = (description: string | null) => {
        if (!description) {
            return 'IP no disponible'
        }

        // Busca el texto que aparece después de "IP:".
        const match = description.match(/IP:\s*(.+)$/)

        return match?.[1] ?? 'IP no disponible'
    }


    return (
        <div className="space-y-6">

            {/* ======================================================
                ENCABEZADO
                ====================================================== */}

            <div>
                <h1 className="text-3xl font-bold text-slate-900">
                    Seguridad y accesos
                </h1>

                <p className="mt-2 text-slate-600">
                    Consulta los accesos registrados y la ubicación
                    aproximada de las conexiones al sistema.
                </p>
            </div>


            {/* ======================================================
                MAPA
                ====================================================== */}

            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

                <h2 className="text-xl font-semibold text-slate-900">
                    Mapa de accesos
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                    Aquí se mostrará el mapa de ubicaciones aproximadas
                    de los accesos registrados.
                </p>

                {/* Espacio reservado para el mapa. */}
                {/* ======================================================
                    MAPA DE LIMA
                    ====================================================== */}

                <div className="mt-6 overflow-hidden rounded-lg">

                    <MapContainer
                        center={[-12.0464, -77.0428]}
                        zoom={11}
                        scrollWheelZoom={true}
                        className="h-96 w-full"
                    >

                        {/* Capa visual del mapa utilizando OpenStreetMap. */}
                        <TileLayer
                            attribution='&copy; OpenStreetMap contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {/* Marcador provisional para representar Lima durante el desarrollo local. */}
                        <Marker position={[-12.0464, -77.0428]}>

                            <Popup>
                                <strong>MatrixFlow Enterprise</strong>
                                <br />
                                Ubicación aproximada de desarrollo:
                                <br />
                                Lima, Perú
                                <br />
                                IP local: 127.0.0.1
                            </Popup>

                        </Marker>

                    </MapContainer>

                </div>

            </section>


            {/* ======================================================
          HISTORIAL DE ACCESOS
          ====================================================== */}

            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

                <h2 className="text-xl font-semibold text-slate-900">
                    Historial de accesos
                </h2>


                {/* Estado de carga. */}
                {loading && (
                    <p className="mt-4 text-sm text-slate-500">
                        Cargando registros de acceso...
                    </p>
                )}


                {/* Mensaje de error. */}
                {error && (
                    <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
                        {error}
                    </div>
                )}


                {/* Tabla cuando existen registros. */}
                {!loading && !error && auditLogs.length > 0 && (
                    <div className="mt-6 overflow-x-auto">

                        <table className="w-full text-left text-sm">

                            <thead>
                                <tr className="border-b border-slate-200 text-slate-500">

                                    <th className="px-4 py-3 font-medium">
                                        Usuario
                                    </th>

                                    <th className="px-4 py-3 font-medium">
                                        Acción
                                    </th>

                                    <th className="px-4 py-3 font-medium">
                                        IP
                                    </th>

                                    <th className="px-4 py-3 font-medium">
                                        Fecha y hora
                                    </th>

                                </tr>
                            </thead>


                            <tbody>

                                {auditLogs.map((log) => (
                                    <tr
                                        key={log.id}
                                        className="border-b border-slate-100"
                                    >

                                        <td className="px-4 py-3">
                                            Usuario #{log.user_id ?? 'N/A'}
                                        </td>

                                        <td className="px-4 py-3">
                                            {log.action}
                                        </td>

                                        <td className="px-4 py-3 font-mono">
                                            {getIpAddress(log.description)}
                                        </td>

                                        <td className="px-4 py-3">
                                            {new Date(
                                                log.created_at
                                            ).toLocaleString()}
                                        </td>

                                    </tr>
                                ))}

                            </tbody>

                        </table>

                    </div>
                )}


                {/* Mensaje cuando no existen registros. */}
                {!loading && !error && auditLogs.length === 0 && (
                    <p className="mt-4 text-sm text-slate-500">
                        No existen registros de acceso.
                    </p>
                )}

            </section>

        </div>
    )
}


export default Seguridad