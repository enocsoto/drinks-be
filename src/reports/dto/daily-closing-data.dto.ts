/**
 * DTO con los datos agregados del cierre del día para generar el documento.
 * Un item por producto (bebida) vendido en el día.
 */
export interface DailyClosingItemDto {
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
