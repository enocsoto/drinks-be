import { DrinkType } from "../../beverage/enum/drink-type.enum";

export type DrinkTypeBreakdownMap = Map<DrinkType, { count: number; amount: number }>;

export interface DetailLineForDrinkType {
  beverageId: unknown;
  quantity: unknown;
  subtotal: unknown;
}

/**
 * Acumula cantidades por tipo de bebida en el mapa global y devuelve totales del período.
 */
export function accumulateDrinkTypeFromDetails(
  details: DetailLineForDrinkType[],
  breakdownMap: DrinkTypeBreakdownMap,
): { periodCount: number; periodAmount: number } {
  let periodCount = 0;
  let periodAmount = 0;

  for (const d of details) {
    const beverage = d.beverageId as { type?: DrinkType } | null;
    const type = beverage?.type ?? DrinkType.OTHER;
    const qty = Number(d.quantity);
    const amt = Number(d.subtotal);

    if (!breakdownMap.has(type)) breakdownMap.set(type, { count: 0, amount: 0 });
    const entry = breakdownMap.get(type)!;
    entry.count += qty;
    entry.amount += amt;
    periodCount += qty;
    periodAmount += amt;
  }

  return { periodCount, periodAmount };
}

export function breakdownMapToArrayWithPercentages(
  breakdownMap: DrinkTypeBreakdownMap,
  totalCount: number,
): Array<{
  type: DrinkType;
  label: string;
  count: number;
  amount: number;
  percentage: number;
}> {
  return Array.from(breakdownMap.entries()).map(([type, { count, amount }]) => ({
    type,
    label: type,
    count,
    amount,
    percentage: totalCount > 0 ? Number(((count / totalCount) * 100).toFixed(1)) : 0,
  }));
}
