import { DrinkType } from "../beverage/enum/drink-type.enum";

export interface TodaySalesDto {
  totalSales: number;
  totalAmount: number;
  breakdown: Array<{
    type: DrinkType;
    label: string;
    count: number;
    amount: number;
    percentage: number;
  }>;
}

export interface SalesByPeriodDto {
  totalTicketSales: number;
  totalAmount: number;
  series: Array<{ month: number; year: number; label: string; count: number; amount: number }>;
  breakdown: Array<{
    type: DrinkType;
    label: string;
    count: number;
    amount: number;
    percentage: number;
  }>;
}

export interface TopSellerDto {
  sellerId: number;
  name: string;
  totalSales: number;
  totalAmount: number;
  percentage: number;
}

export interface TransactionsDto {
  completed: { count: number; percentage: number };
  pending: { count: number; percentage: number };
  total: number;
}

export interface BeverageBreakdownItem {
  beverageId: string;
  name: string;
  containerType?: string;
  containerSize?: string;
  count: number;
  amount: number;
  percentage: number;
  series: Array<{ month: number; year: number; label: string; count: number; amount: number }>;
}

export interface SalesByBeverageDto {
  totalTicketSales: number;
  totalAmount: number;
  breakdown: BeverageBreakdownItem[];
}
