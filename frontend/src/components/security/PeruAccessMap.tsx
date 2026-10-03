// ============================================================
// MatrixFlow Enterprise - Mapa de accesos del Perú
// ============================================================
// Renderiza los departamentos del Perú desde GeoJSON y coloca
// el último acceso usando la misma proyección. El detalle solo
// aparece al pasar el cursor o enfocar el marcador con teclado.
// ============================================================

import { useMemo } from 'react'
import { geoMercator, geoPath } from 'd3-geo'
import { MapPin } from 'lucide-react'

import peruDepartments from '../../data/peru-departments.json'

interface PeruAccessMapProps {
    latitude: number | null
    longitude: number | null
    city: string | null
    region: string | null
    country: string | null
}

interface DepartmentFeature {
    type: 'Feature'
    properties: {
        ubigeo?: string
        nombre?: string
        name?: string
        departamento?: string
        [key: string]: unknown
    }
    geometry: GeoJSON.Geometry
}

interface DepartmentCollection {
    type: 'FeatureCollection'
    features: DepartmentFeature[]
}

const WIDTH = 520
const HEIGHT = 560
const PADDING = 30

const geoData = peruDepartments as DepartmentCollection

// La proyección y el generador de paths no dependen de las props,
// así que se crean una sola vez fuera del componente.
const projection = geoMercator().fitExtent(
    [[PADDING, PADDING], [WIDTH - PADDING, HEIGHT - PADDING]],
    geoData as GeoJSON.FeatureCollection,
)
const pathGenerator = geoPath(projection)

function PeruAccessMap({
    latitude,
    longitude,
    city,
    region,
    country,
}: PeruAccessMapProps) {
    // Posición del marcador en porcentajes, para alinear el
    // elemento HTML con el mismo punto proyectado en el SVG.
    // D3 usa el orden [longitud, latitud].
    const accessPosition = useMemo(() => {
        if (latitude == null || longitude == null) return null

        const point = projection([Number(longitude), Number(latitude)])
        if (!point) return null

        return {
            left: `${(point[0] / WIDTH) * 100}%`,
            top: `${(point[1] / HEIGHT) * 100}%`,
        }
    }, [latitude, longitude])

    const locationLabel = [city, region, country]
        .filter(Boolean)
        .filter((value, index, values) => values.indexOf(value) === index)
        .join(', ')

    return (
        <div className="peru-access-map flex min-h-[520px] items-center justify-center bg-slate-50 p-5">
            {/* Mismas proporciones que el viewBox del SVG */}
            <div
                className="relative w-full max-w-[500px]"
                style={{ aspectRatio: `${WIDTH} / ${HEIGHT}` }}
            >
                <svg
                    viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                    role="img"
                    aria-label="Mapa departamental del Perú con ubicación aproximada del último acceso"
                    className="h-full w-full"
                >
                    <g>
                        {geoData.features.map((department, index) => {
                            const path = pathGenerator(department as GeoJSON.Feature)
                            if (!path) return null

                            return (
                                <path
                                    key={department.properties.ubigeo ?? department.properties.name ?? index}
                                    d={path}
                                    className="peru-department fill-slate-300 stroke-white stroke-[1.2] transition-colors duration-200 hover:fill-slate-400"
                                />
                            )
                        })}
                    </g>
                </svg>

                {accessPosition ? (
                    <div
                        className="group absolute z-20 -translate-x-1/2 -translate-y-1/2"
                        style={accessPosition}
                    >
                        {/* El botón permite mostrar la tarjeta con teclado */}
                        <button
                            type="button"
                            aria-label={`Ver información del acceso en ${locationLabel || 'ubicación aproximada'}`}
                            className="peru-access-marker relative flex h-7 w-7 items-center justify-center rounded-full border-[3px] border-white bg-blue-600 shadow-md outline-none transition-all duration-200 hover:scale-110 hover:bg-blue-700 hover:shadow-lg focus-visible:ring-4 focus-visible:ring-blue-200"
                        >
                            {/* Halo */}
                            <span className="absolute h-10 w-10 rounded-full bg-blue-500/15 transition-all duration-300 group-hover:scale-125 group-hover:bg-blue-500/20" />
                            {/* Punto central */}
                            <span className="relative h-2.5 w-2.5 rounded-full bg-white" />
                        </button>

                        {/* Tarjeta flotante: invisible por defecto */}
                        <div className="peru-access-tooltip pointer-events-none absolute bottom-full left-1/2 mb-3 w-64 -translate-x-1/2 translate-y-2 rounded-xl border border-slate-200 bg-white p-4 opacity-0 shadow-xl transition-all duration-200 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
                            <div className="flex items-start gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                    <MapPin size={18} />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        Último acceso
                                    </p>
                                    <p className="mt-1 text-sm font-semibold text-slate-900">
                                        {locationLabel || 'Ubicación aproximada'}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Lat. {Number(latitude).toFixed(4)} · Lon. {Number(longitude).toFixed(4)}
                                    </p>
                                </div>
                            </div>

                            {/* Flecha inferior */}
                            <div className="peru-access-tooltip-arrow absolute left-1/2 top-full h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border-b border-r border-slate-200 bg-white" />
                        </div>
                    </div>
                ) : (
                    <div className="peru-map-empty absolute bottom-4 left-4 right-4 rounded-xl border border-slate-200 bg-white/95 p-4 text-center text-sm text-slate-500">
                        No existen coordenadas disponibles para representar el acceso.
                    </div>
                )}
            </div>
        </div>
    )
}

export default PeruAccessMap
