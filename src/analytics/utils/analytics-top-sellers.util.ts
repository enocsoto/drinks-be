import { TopSellerDto } from "../analytics.types";

export interface SaleLean {
  _id: { toString(): string };
  userDocument: number;
}

export interface DetailLean {
  saleId: { toString(): string };
  quantity: unknown;
  subtotal: unknown;
}

/**
 * Agrupa ventas por documento de vendedor a partir de ventas y detalles ya cargados.
 */
export function aggregateTopSellers(
  sales: SaleLean[],
  details: DetailLean[],
  userByDoc: Map<number, { name: string }>,
): TopSellerDto[] {
  const bySeller = new Map<number, { name: string; count: number; amount: number }>();

  for (const sale of sales) {
    const doc = sale.userDocument;
    const name = userByDoc.get(doc)?.name ?? `Vendedor ${doc}`;
    const saleDetails = details.filter(d => d.saleId.toString() === sale._id.toString());
    const count = saleDetails.reduce((acc, d) => acc + Number(d.quantity), 0);
    const amount = saleDetails.reduce((acc, d) => acc + Number(d.subtotal), 0);

    if (!bySeller.has(doc)) bySeller.set(doc, { name, count: 0, amount: 0 });
    const entry = bySeller.get(doc)!;
    entry.count += count;
    entry.amount += amount;
  }

  const totalAmount = Array.from(bySeller.values()).reduce((acc, e) => acc + e.amount, 0);

  return Array.from(bySeller.entries())
    .map(([sellerId, { name, count, amount }]) => ({
      sellerId,
      name,
      totalSales: count,
      totalAmount: Number(amount.toFixed(2)),
      percentage: totalAmount > 0 ? Number(((amount / totalAmount) * 100).toFixed(2)) : 0,
    }))
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 5);
}
