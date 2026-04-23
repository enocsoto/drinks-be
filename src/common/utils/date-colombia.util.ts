/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("America/Bogota");

const ZONE_COLOMBIA = "America/Bogota";

/**
 * Fecha de hoy en Colombia en formato YYYY-MM-DD (solo fecha, sin hora).
 * Usar para registrar ventas y filtrar por día.
 */
export function todayColombia(): string {
  return dayjs().tz(ZONE_COLOMBIA).format("YYYY-MM-DD");
}

/**
 * Dado un string YYYY-MM-DD (fecha seleccionada por el usuario), devuelve
 * el rango [inicio, fin) de ese día en Colombia como Date (UTC) para consultas MongoDB.
 * Útil para ventas antiguas que solo tienen DateSale y no saleDate.
 */
export function getDayRangeColombia(dateStr: string): { start: Date; end: Date } {
  const start = dayjs.tz(`${dateStr}T00:00:00`, ZONE_COLOMBIA).toDate();
  const end = dayjs.tz(`${dateStr}T00:00:00`, ZONE_COLOMBIA).add(1, "day").toDate();
  return { start, end };
}

/**
 * Últimos N días en Colombia (incluye hoy). Para gráficos por día.
 * Orden: del más antiguo al más reciente (índice 0 = hace N días).
 */
export function getLastDaysColombia(
  n: number,
): Array<{ dateStr: string; label: string; start: Date; end: Date }> {
  const out: Array<{ dateStr: string; label: string; start: Date; end: Date }> = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = dayjs().tz(ZONE_COLOMBIA).subtract(i, "day");
    const dateStr = String(d.format("YYYY-MM-DD"));
    const { start, end } = getDayRangeColombia(dateStr);
    out.push({ dateStr, label: d.format("D/M"), start, end });
  }
  return out;
}

/**
 * Comprueba que `s` sea un día calendario válido en Colombia (YYYY-MM-DD).
 */
export function isValidYyyyMmDdString(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const parsed = dayjs.tz(`${s}T12:00:00`, ZONE_COLOMBIA);
  return parsed.isValid() && parsed.format("YYYY-MM-DD") === s;
}
