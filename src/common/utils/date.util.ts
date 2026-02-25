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
