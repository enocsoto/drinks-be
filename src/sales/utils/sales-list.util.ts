/**
 * Agrupa detalles de venta por saleId (DRY para listados).
 */
export function groupSaleDetailsBySaleId<T extends { saleId: { toString(): string } }>(
  details: T[],
): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const d of details) {
    const sid = d.saleId.toString();
    if (!map.has(sid)) map.set(sid, []);
    map.get(sid)!.push(d);
  }
  return map;
}

/**
 * Mapa documento → usuario para enriquecer listados de ventas.
 */
export function buildUserMapByDocument(
  users: Array<{ document: number; name: string }>,
): Map<number, { document: number; name: string }> {
  const userByDoc = new Map<number, { document: number; name: string }>();
  for (const u of users) {
    userByDoc.set(u.document, { document: u.document, name: u.name });
  }
  return userByDoc;
}
