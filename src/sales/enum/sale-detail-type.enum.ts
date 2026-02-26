/**
 * Tipo de ítem en una venta del billar.
 * - BEVERAGE: cerveza, gaseosa, aguardiente, etc.
 * - GLOVES: guantes (mesa de billar).
 * - GAME: juegos (chicos, buchacara, etc.).
 */
export enum SaleDetailType {
  BEVERAGE = "BEVERAGE",
  GLOVES = "GLOVES",
  GAME = "GAME",
}

export const SALE_DETAIL_TYPE_LABELS: Record<SaleDetailType, string> = {
  [SaleDetailType.BEVERAGE]: "Bebida (cerveza, gaseosa, aguardiente)",
  [SaleDetailType.GLOVES]: "Guantes",
  [SaleDetailType.GAME]: "Juego (chicos / buchacara)",
};
