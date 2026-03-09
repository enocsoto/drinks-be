/**
 * DTO con los datos agregados del cierre del día para generar el documento.
 * Un item por producto vendido en el día (bebidas, guantes, juegos).
 */
export interface DailyClosingItemDto {
  /** Nombre o descripción del producto (bebida, "Guantes", "Juego", etc.). */
  beverageName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface DailyClosingDataDto {
  date: string;
  generatedAt: Date;
  items: DailyClosingItemDto[];
  totalQuantity: number;
  totalAmount: number;
  totalTransactions: number;
}
