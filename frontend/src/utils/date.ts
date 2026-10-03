// ============================================================
// MatrixFlow Enterprise
// Utilidades de fecha y hora
// ============================================================
//
// PostgreSQL/Supabase trabaja habitualmente en UTC.
//
// Algunos timestamps históricos de MatrixFlow llegan desde la API
// sin indicador de zona horaria, por ejemplo:
//
//   2026-10-03T02:30:00
//
// JavaScript interpretaría ese valor como hora local. Para evitar
// desfases, cuando el timestamp no trae Z ni un offset explícito,
// lo interpretamos como UTC.
//
// Después, todas las fechas visibles se presentan usando la zona
// horaria empresarial de Perú: America/Lima.
// ============================================================

const MATRIXFLOW_TIME_ZONE = 'America/Lima'


/**
 * Convierte un timestamp recibido desde la API a Date.
 *
 * Si el backend ya envía una zona horaria (Z, +00:00, -05:00, etc.),
 * se respeta. Si no la incluye, asumimos UTC para mantener
 * compatibilidad con los registros actuales de PostgreSQL.
 */
export function parseApiTimestamp(
    value: string,
): Date {
    const normalizedValue =
        value.trim()

    // Detecta:
    // - Z
    // - +00:00
    // - -05:00
    const hasTimeZone =
        /(?:Z|[+-]\d{2}:\d{2})$/i.test(
            normalizedValue,
        )

    return new Date(
        hasTimeZone
            ? normalizedValue
            : `${normalizedValue}Z`,
    )
}


/**
 * Formatea fecha y hora utilizando la zona horaria de Lima.
 */
export function formatDateTime(
    value: string,
): string {
    const date =
        parseApiTimestamp(value)

    if (
        Number.isNaN(
            date.getTime(),
        )
    ) {
        return value
    }

    return new Intl.DateTimeFormat(
        'es-PE',
        {
            timeZone:
                MATRIXFLOW_TIME_ZONE,
            dateStyle: 'medium',
            timeStyle: 'short',
        },
    ).format(date)
}
