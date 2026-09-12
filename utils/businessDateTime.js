/**
 * fecha / fechaFin del remate son LocalDateTime "naive" en America/La_Paz
 * (misma zona que el auto-cierre del backend). Guardar y mostrar el reloj
 * de pared sin toISOString() ni interpretaciones UTC.
 */
export const BUSINESS_TIMEZONE = "America/La_Paz";

const WALL_CLOCK =
  /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/;

/** Parsea ISO local a Date en componentes locales (para DatePicker). */
export function parseLocalDate(iso) {
  if (!iso) return undefined;
  const m = String(iso).trim().match(WALL_CLOCK);
  if (!m) return undefined;
  return new Date(
    Number(m[1]),
    Number(m[2]) - 1,
    Number(m[3]),
    Number(m[4]),
    Number(m[5]),
    Number(m[6] || 0)
  );
}

/** Serializa Date a LocalDateTime (YYYY-MM-DDTHH:mm:ss) sin zona. */
export function formatLocalDateTime(date) {
  if (!date) return null;
  const pad = (n) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds()
  )}`;
}

/** Muestra reloj de pared (DD/MM/YYYY HH:mm) sin shift de zona. */
export function formatWallClockDisplay(value) {
  if (value == null || value === "") return "";
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return "";
    const pad = (n) => n.toString().padStart(2, "0");
    return `${pad(value.getDate())}/${pad(value.getMonth() + 1)}/${value.getFullYear()} ${pad(value.getHours())}:${pad(value.getMinutes())}`;
  }
  const m = String(value).trim().match(WALL_CLOCK);
  if (m) return `${m[3]}/${m[2]}/${m[1]} ${m[4]}:${m[5]}`;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("es-PY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function wallClockToComparable(iso) {
  if (iso == null || iso === "") return null;
  const m = String(iso).trim().match(WALL_CLOCK);
  if (!m) return null;
  const sec = m[6] != null ? m[6] : "00";
  return Number(`${m[1]}${m[2]}${m[3]}${m[4]}${m[5]}${sec}`);
}

/** Ahora como reloj de pared en America/La_Paz → número comparable YYYYMMDDHHmmss. */
export function nowBusinessComparable(now = new Date()) {
  const parts = Object.create(null);
  for (const p of new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(now)) {
    if (p.type !== "literal") parts[p.type] = p.value;
  }
  const hour = parts.hour === "24" ? "00" : parts.hour;
  return Number(
    `${parts.year}${parts.month}${parts.day}${hour}${parts.minute}${parts.second}`
  );
}

/** true si fechaFin (wall-clock La Paz) ya pasó o es igual a ahora. */
export function isFechaFinVencida(fechaFin, now = new Date()) {
  const fin = wallClockToComparable(fechaFin);
  if (fin == null) return false;
  return nowBusinessComparable(now) >= fin;
}

/**
 * true si la fecha de inicio ya llegó (o no hay fecha → se muestra, datos viejos).
 */
export function isFechaInicioAlcanzada(fecha, now = new Date()) {
  const inicio = wallClockToComparable(fecha);
  if (inicio == null) return true;
  return nowBusinessComparable(now) >= inicio;
}
