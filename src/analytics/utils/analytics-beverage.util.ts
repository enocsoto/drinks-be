import { BeverageBreakdownItem, SalesByBeverageDto } from "../analytics.types";

export interface BeverageEntry {
  name: string;
  containerType?: string;
  containerSize?: string;
  totalCount: number;
  totalAmount: number;
  series: Array<{ month: number; year: number; label: string; count: number; amount: number }>;
}

export function beverageIdToString(rawId: unknown): string {
  return typeof rawId === "string" ? rawId : (rawId as { toString(): string }).toString();
}

export interface PopulatedBeverageRef {
  _id: unknown;
  name?: string;
  containerType?: string;
  containerSize?: string;
}

/**
 * Agrega líneas de detalle por bebida en un único período (día/semana/mes).
 */
export function aggregateDetailsByBeverageInPeriod(
  details: Array<{ beverageId: unknown; quantity: unknown; subtotal: unknown }>,
  totals: { totalCount: number; totalAmount: number },
): Map<
  string,
  {
    name: string;
    containerType?: string;
    containerSize?: string;
    count: number;
    amount: number;
  }
> {
  const periodMap = new Map<
    string,
    {
      name: string;
      containerType?: string;
      containerSize?: string;
      count: number;
      amount: number;
    }
  >();

  for (const d of details) {
    const beverage = d.beverageId as PopulatedBeverageRef | null;
    if (!beverage?._id) continue;

    const bid = beverageIdToString(beverage._id);
    const name = beverage.name ?? "Sin nombre";
    const qty = Number(d.quantity);
    const amt = Number(d.subtotal);

    if (!periodMap.has(bid)) {
      periodMap.set(bid, {
        name,
        containerType: beverage.containerType,
        containerSize: beverage.containerSize,
        count: 0,
        amount: 0,
      });
    }
    const e = periodMap.get(bid)!;
    e.count += qty;
    e.amount += amt;
    totals.totalCount += qty;
    totals.totalAmount += amt;
  }

  return periodMap;
}

export function ensureBeverageEntry(
  byBeverage: Map<string, BeverageEntry>,
  beverageId: string,
  name: string,
  containerType: string | undefined,
  containerSize: string | undefined,
): BeverageEntry {
  if (!byBeverage.has(beverageId)) {
    byBeverage.set(beverageId, {
      name,
      containerType,
      containerSize,
      totalCount: 0,
      totalAmount: 0,
      series: [],
    });
  }
  return byBeverage.get(beverageId)!;
}

export function pushBeverageSeriesPoint(
  byBeverage: Map<string, BeverageEntry>,
  args: {
    beverageId: string;
    name: string;
    containerType: string | undefined;
    containerSize: string | undefined;
    label: string;
    monthIndex: number;
    year: number;
    count: number;
    amount: number;
  },
): void {
  const entry = ensureBeverageEntry(
    byBeverage,
    args.beverageId,
    args.name,
    args.containerType,
    args.containerSize,
  );
  entry.totalCount += args.count;
  entry.totalAmount += args.amount;
  entry.series.push({
    month: args.monthIndex,
    year: args.year,
    label: args.label,
    count: args.count,
    amount: Number(args.amount.toFixed(2)),
  });
}

export function finalizeSalesByBeverageDto(
  byBeverage: Map<string, BeverageEntry>,
  totalCount: number,
  totalAmount: number,
  granularity: "month" | "week" | "day",
): SalesByBeverageDto {
  const breakdown: BeverageBreakdownItem[] = Array.from(byBeverage.entries())
    .map(
      ([
        beverageId,
        { name, containerType, containerSize, totalCount: c, totalAmount: a, series },
      ]) => ({
        beverageId,
        name,
        containerType,
        containerSize,
        count: c,
        amount: Number(a.toFixed(2)),
        percentage: totalCount > 0 ? Number(((c / totalCount) * 100).toFixed(1)) : 0,
        series: series.sort((x, y) => {
          if (granularity === "month") return x.month - y.month;
          if (granularity === "week") return x.month - y.month;
          return 0;
        }),
      }),
    )
    .sort((a, b) => b.count - a.count);

  return {
    totalTicketSales: totalCount,
    totalAmount: Number(totalAmount.toFixed(2)),
    breakdown,
  };
}
