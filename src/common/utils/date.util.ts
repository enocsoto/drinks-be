/**
 * Utilidad DRY para rangos de fecha por día.
 * Usado en SalesService para filtrar ventas por fecha.
 */
export function getDayRange(date: string): { start: Date; end: Date } {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);
  return { start: dayStart, end: dayEnd };
}

/**
 * Obtiene el rango de fechas para el día de hoy.
 */
export function getTodayRange(): { start: Date; end: Date } {
  return getDayRange(new Date().toISOString().split("T")[0]);
}

/**
 * Obtiene el rango de fechas para el mes actual.
 */
export function getMonthRange(year: number, month: number): { start: Date; end: Date } {
  const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const end = new Date(year, month, 1, 0, 0, 0, 0);
  return { start, end };
}

/**
 * Obtiene los 12 meses del año para un año dado.
 */
export function getMonthsInYear(year: number): Array<{ month: number; start: Date; end: Date }> {
  return Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const { start, end } = getMonthRange(year, month);
    return { month, start, end };
  });
}

/**
 * Semanas del año desde el 1 de enero hasta hoy (año actual) o todo el año (años pasados).
 * Cada semana: 7 días; Sem 1 = días 1-7, Sem 2 = 8-14, etc.
 */
export function getWeeksInYearUpToToday(
  year: number,
): Array<{ weekIndex: number; start: Date; end: Date; label: string }> {
  const startOfYear = new Date(year, 0, 1, 0, 0, 0, 0);
  const now = new Date();
  const endOfYear = new Date(year + 1, 0, 1, 0, 0, 0, 0);
  const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
  const cap = year < now.getFullYear() ? endOfYear : tomorrowStart;

  const result: Array<{ weekIndex: number; start: Date; end: Date; label: string }> = [];
  for (let w = 0; ; w++) {
    const weekStart = new Date(startOfYear);
    weekStart.setDate(weekStart.getDate() + w * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    if (weekStart >= cap) break;

    const effectiveEnd = weekEnd > cap ? cap : weekEnd;
    result.push({
      weekIndex: w + 1,
      start: weekStart,
      end: effectiveEnd,
      label: `Sem ${w + 1}`,
    });
    if (weekEnd >= cap) break;
  }
  return result;
}
