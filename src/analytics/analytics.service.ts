import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Sale, SaleDocument } from "../sales/schemas/sale.schema";
import { SaleDetail, SaleDetailDocument } from "../sales/schemas/sale-detail.schema";
import { Beverage, BeverageDocument } from "../beverage/schemas/beverage.schema";
import { User, UserDocument } from "../user/schemas/user.schema";
import { DrinkType } from "../beverage/enum/drink-type.enum";
import { getTodayRange, getMonthsInYear, getWeeksInYearUpToToday } from "../common/utils/date.util";

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

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Sale.name) private readonly saleModel: Model<SaleDocument>,
    @InjectModel(SaleDetail.name) private readonly saleDetailModel: Model<SaleDetailDocument>,
    @InjectModel(Beverage.name) private readonly beverageModel: Model<BeverageDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async getTodaySales(): Promise<TodaySalesDto> {
    const { start, end } = getTodayRange();

    const sales = await this.saleModel
      .find({ DateSale: { $gte: start, $lt: end } })
      .lean()
      .exec();

    const saleIds = sales.map(s => s._id);
    const details = await this.saleDetailModel
      .find({ saleId: { $in: saleIds } })
      .populate("beverageId", "type")
      .lean()
      .exec();

    const breakdownMap = new Map<DrinkType, { count: number; amount: number }>();
    let totalCount = 0;
    let totalAmount = 0;

    for (const d of details) {
      const beverage = d.beverageId as { type?: DrinkType } | null;
      const type = beverage?.type ?? DrinkType.OTHER;
      const qty = Number(d.quantity);
      const amt = Number(d.subtotal);

      if (!breakdownMap.has(type)) breakdownMap.set(type, { count: 0, amount: 0 });
      const entry = breakdownMap.get(type)!;
      entry.count += qty;
      entry.amount += amt;
      totalCount += qty;
      totalAmount += amt;
    }

    const breakdown = Array.from(breakdownMap.entries()).map(([type, { count, amount }]) => ({
      type,
      label: type,
      count,
      amount,
      percentage: totalCount > 0 ? Number(((count / totalCount) * 100).toFixed(1)) : 0,
    }));

    return {
      totalSales: totalCount,
      totalAmount: Number(totalAmount.toFixed(2)),
      breakdown,
    };
  }

  async getSalesByPeriod(
    year?: number,
    granularity: "month" | "week" = "month",
  ): Promise<SalesByPeriodDto> {
    const targetYear = year ?? new Date().getFullYear();
    const now = new Date();
    const isCurrentYear = targetYear === now.getFullYear();

    const series: Array<{
      month: number;
      year: number;
      label: string;
      count: number;
      amount: number;
    }> = [];
    const breakdownMap = new Map<DrinkType, { count: number; amount: number }>();
    let totalCount = 0;
    let totalAmount = 0;

    if (granularity === "week") {
      const weeks = getWeeksInYearUpToToday(targetYear);
      for (const { weekIndex, start, end, label } of weeks) {
        const sales = await this.saleModel
          .find({ DateSale: { $gte: start, $lt: end } })
          .lean()
          .exec();

        const saleIds = sales.map(s => s._id);
        const details = await this.saleDetailModel
          .find({ saleId: { $in: saleIds } })
          .populate("beverageId", "type")
          .lean()
          .exec();

        let weekCount = 0;
        let weekAmount = 0;

        for (const d of details) {
          const beverage = d.beverageId as { type?: DrinkType } | null;
          const type = beverage?.type ?? DrinkType.OTHER;
          const qty = Number(d.quantity);
          const amt = Number(d.subtotal);

          if (!breakdownMap.has(type)) breakdownMap.set(type, { count: 0, amount: 0 });
          const entry = breakdownMap.get(type)!;
          entry.count += qty;
          entry.amount += amt;
          weekCount += qty;
          weekAmount += amt;
          totalCount += qty;
          totalAmount += amt;
        }

        series.push({
          month: weekIndex,
          year: targetYear,
          label,
          count: weekCount,
          amount: Number(weekAmount.toFixed(2)),
        });
      }
    } else {
      const monthNames = [
        "Ene",
        "Feb",
        "Mar",
        "Abr",
        "May",
        "Jun",
        "Jul",
        "Ago",
        "Sep",
        "Oct",
        "Nov",
        "Dic",
      ];
      const allMonths = getMonthsInYear(targetYear);
      const months = isCurrentYear
        ? allMonths.filter(m => m.month <= now.getMonth() + 1)
        : allMonths;

      for (const { month, start, end } of months) {
        const sales = await this.saleModel
          .find({ DateSale: { $gte: start, $lt: end } })
          .lean()
          .exec();

        const saleIds = sales.map(s => s._id);
        const details = await this.saleDetailModel
          .find({ saleId: { $in: saleIds } })
          .populate("beverageId", "type")
          .lean()
          .exec();

        let monthCount = 0;
        let monthAmount = 0;

        for (const d of details) {
          const beverage = d.beverageId as { type?: DrinkType } | null;
          const type = beverage?.type ?? DrinkType.OTHER;
          const qty = Number(d.quantity);
          const amt = Number(d.subtotal);

          if (!breakdownMap.has(type)) breakdownMap.set(type, { count: 0, amount: 0 });
          const entry = breakdownMap.get(type)!;
          entry.count += qty;
          entry.amount += amt;
          monthCount += qty;
          monthAmount += amt;
          totalCount += qty;
          totalAmount += amt;
        }

        series.push({
          month,
          year: targetYear,
          label: monthNames[month - 1],
          count: monthCount,
          amount: Number(monthAmount.toFixed(2)),
        });
      }
    }

    const breakdown = Array.from(breakdownMap.entries()).map(([type, { count, amount }]) => ({
      type,
      label: type,
      count,
      amount,
      percentage: totalCount > 0 ? Number(((count / totalCount) * 100).toFixed(1)) : 0,
    }));

    return {
      totalTicketSales: totalCount | 0,
      totalAmount: Number(totalAmount.toFixed(2)),
      series,
      breakdown,
    };
  }

  async getTopSellers(year?: number): Promise<TopSellerDto[]> {
    const targetYear = year ?? new Date().getFullYear();
    const start = new Date(targetYear, 0, 1, 0, 0, 0, 0);
    const end = new Date(targetYear + 1, 0, 1, 0, 0, 0, 0);

    const sales = await this.saleModel
      .find({ DateSale: { $gte: start, $lt: end } })
      .lean()
      .exec();

    const saleIds = sales.map(s => s._id);
    const details = await this.saleDetailModel
      .find({ saleId: { $in: saleIds } })
      .lean()
      .exec();

    const docNumbers = [...new Set(sales.map(s => s.userDocument))];
    const users = await this.userModel
      .find({ document: { $in: docNumbers } })
      .select("name document")
      .lean()
      .exec();
    const userByDoc = new Map<number, { name: string }>();
    for (const u of users) userByDoc.set(u.document, { name: u.name });

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

  async getTransactions(): Promise<TransactionsDto> {
    const { start, end } = getTodayRange();

    const count = await this.saleModel
      .countDocuments({ DateSale: { $gte: start, $lt: end } })
      .exec();

    return {
      completed: { count, percentage: count > 0 ? 100 : 0 },
      pending: { count: 0, percentage: 0 },
      total: count,
    };
  }
}
