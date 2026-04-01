import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Sale, SaleDocument } from "../sales/schemas/sale.schema";
import { SaleDetail, SaleDetailDocument } from "../sales/schemas/sale-detail.schema";
import { User, UserDocument } from "../user/schemas/user.schema";
import { getMonthsInYear, getWeeksInYearUpToToday } from "../common/utils/date.util";
import {
  todayColombia,
  getDayRangeColombia,
  getLastDaysColombia,
} from "../common/utils/date-colombia.util";
import { AnalyticsSaleDetailLoader } from "./analytics-sale-detail.loader";
import { MONTH_LABELS_ES } from "./analytics.constants";
import type {
  TodaySalesDto,
  SalesByPeriodDto,
  TopSellerDto,
  TransactionsDto,
  SalesByBeverageDto,
} from "./analytics.types";
import {
  accumulateDrinkTypeFromDetails,
  breakdownMapToArrayWithPercentages,
  type DrinkTypeBreakdownMap,
} from "./utils/analytics-drink-type.util";
import {
  aggregateDetailsByBeverageInPeriod,
  finalizeSalesByBeverageDto,
  pushBeverageSeriesPoint,
  type BeverageEntry,
} from "./utils/analytics-beverage.util";
import { aggregateTopSellers } from "./utils/analytics-top-sellers.util";
import type { SaleLean, DetailLean } from "./utils/analytics-top-sellers.util";

export type {
  TodaySalesDto,
  SalesByPeriodDto,
  TopSellerDto,
  TransactionsDto,
  BeverageBreakdownItem,
  SalesByBeverageDto,
} from "./analytics.types";

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Sale.name) private readonly saleModel: Model<SaleDocument>,
    @InjectModel(SaleDetail.name) private readonly saleDetailModel: Model<SaleDetailDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly saleDetailLoader: AnalyticsSaleDetailLoader,
  ) {}

  async getTodaySales(): Promise<TodaySalesDto> {
    const dateStr = todayColombia();
    const { start, end } = getDayRangeColombia(dateStr);

    const { details } = await this.saleDetailLoader.loadDetailsForDateRange(start, end, "type");
    const breakdownMap: DrinkTypeBreakdownMap = new Map();
    const { periodCount, periodAmount } = accumulateDrinkTypeFromDetails(details, breakdownMap);

    const breakdown = breakdownMapToArrayWithPercentages(breakdownMap, periodCount);

    return {
      totalSales: periodCount,
      totalAmount: Number(periodAmount.toFixed(2)),
      breakdown,
    };
  }

  async getSalesByPeriod(
    year?: number,
    granularity: "month" | "week" | "day" = "month",
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
    const breakdownMap: DrinkTypeBreakdownMap = new Map();
    let totalCount = 0;
    let totalAmount = 0;

    if (granularity === "day") {
      const days = getLastDaysColombia(31);
      for (const { label, start, end } of days) {
        const { details } = await this.saleDetailLoader.loadDetailsForDateRange(start, end, "type");
        const { periodCount, periodAmount } = accumulateDrinkTypeFromDetails(details, breakdownMap);
        totalCount += periodCount;
        totalAmount += periodAmount;
        series.push({
          month: 0,
          year: targetYear,
          label,
          count: periodCount,
          amount: Number(periodAmount.toFixed(2)),
        });
      }
    } else if (granularity === "week") {
      const weeks = getWeeksInYearUpToToday(targetYear);
      for (const { weekIndex, start, end, label } of weeks) {
        const { details } = await this.saleDetailLoader.loadDetailsForDateRange(start, end, "type");
        const { periodCount, periodAmount } = accumulateDrinkTypeFromDetails(details, breakdownMap);
        totalCount += periodCount;
        totalAmount += periodAmount;
        series.push({
          month: weekIndex,
          year: targetYear,
          label,
          count: periodCount,
          amount: Number(periodAmount.toFixed(2)),
        });
      }
    } else {
      const allMonths = getMonthsInYear(targetYear);
      const months = isCurrentYear
        ? allMonths.filter(m => m.month <= now.getMonth() + 1)
        : allMonths;

      for (const { month, start, end } of months) {
        const { details } = await this.saleDetailLoader.loadDetailsForDateRange(start, end, "type");
        const { periodCount, periodAmount } = accumulateDrinkTypeFromDetails(details, breakdownMap);
        totalCount += periodCount;
        totalAmount += periodAmount;
        series.push({
          month,
          year: targetYear,
          label: MONTH_LABELS_ES[month - 1],
          count: periodCount,
          amount: Number(periodAmount.toFixed(2)),
        });
      }
    }

    const breakdown = breakdownMapToArrayWithPercentages(breakdownMap, totalCount);

    return {
      totalTicketSales: totalCount,
      totalAmount: Number(totalAmount.toFixed(2)),
      series,
      breakdown,
    };
  }

  async getSalesByBeverage(
    year?: number,
    granularity: "month" | "week" | "day" = "month",
  ): Promise<SalesByBeverageDto> {
    const targetYear = year ?? new Date().getFullYear();
    const now = new Date();
    const isCurrentYear = targetYear === now.getFullYear();

    const byBeverage = new Map<string, BeverageEntry>();
    const totals = { totalCount: 0, totalAmount: 0 };

    if (granularity === "day") {
      const days = getLastDaysColombia(31);
      for (const { label, start, end } of days) {
        const { details } = await this.saleDetailLoader.loadDetailsForDateRange(
          start,
          end,
          "name containerType containerSize",
        );
        const periodMap = aggregateDetailsByBeverageInPeriod(details, totals);
        for (const [bid, { name, containerType, containerSize, count, amount }] of periodMap) {
          pushBeverageSeriesPoint(byBeverage, {
            beverageId: bid,
            name,
            containerType,
            containerSize,
            label,
            monthIndex: 0,
            year: targetYear,
            count,
            amount,
          });
        }
      }
    } else if (granularity === "week") {
      const weeks = getWeeksInYearUpToToday(targetYear);
      for (const { weekIndex, start, end, label } of weeks) {
        const { details } = await this.saleDetailLoader.loadDetailsForDateRange(
          start,
          end,
          "name containerType containerSize",
        );
        const periodMap = aggregateDetailsByBeverageInPeriod(details, totals);
        for (const [bid, { name, containerType, containerSize, count, amount }] of periodMap) {
          pushBeverageSeriesPoint(byBeverage, {
            beverageId: bid,
            name,
            containerType,
            containerSize,
            label,
            monthIndex: weekIndex,
            year: targetYear,
            count,
            amount,
          });
        }
      }
    } else {
      const allMonths = getMonthsInYear(targetYear);
      const months = isCurrentYear
        ? allMonths.filter(m => m.month <= now.getMonth() + 1)
        : allMonths;

      for (const { month, start, end } of months) {
        const { details } = await this.saleDetailLoader.loadDetailsForDateRange(
          start,
          end,
          "name containerType containerSize",
        );
        const periodMap = aggregateDetailsByBeverageInPeriod(details, totals);
        for (const [bid, { name, containerType, containerSize, count, amount }] of periodMap) {
          pushBeverageSeriesPoint(byBeverage, {
            beverageId: bid,
            name,
            containerType,
            containerSize,
            label: MONTH_LABELS_ES[month - 1],
            monthIndex: month,
            year: targetYear,
            count,
            amount,
          });
        }
      }
    }

    return finalizeSalesByBeverageDto(
      byBeverage,
      totals.totalCount,
      totals.totalAmount,
      granularity,
    );
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

    return aggregateTopSellers(sales as SaleLean[], details as DetailLean[], userByDoc);
  }

  async getTransactions(): Promise<TransactionsDto> {
    const dateStr = todayColombia();
    const { start, end } = getDayRangeColombia(dateStr);

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
