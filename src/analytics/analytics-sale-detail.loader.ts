import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Sale, SaleDocument } from "../sales/schemas/sale.schema";
import { SaleDetail, SaleDetailDocument } from "../sales/schemas/sale-detail.schema";
import type { DetailLineForDrinkType } from "./utils/analytics-drink-type.util";

/**
 * Carga ventas y detalles por rango de fechas (DRY para analytics).
 */
@Injectable()
export class AnalyticsSaleDetailLoader {
  constructor(
    @InjectModel(Sale.name) private readonly saleModel: Model<SaleDocument>,
    @InjectModel(SaleDetail.name) private readonly saleDetailModel: Model<SaleDetailDocument>,
  ) {}

  async loadDetailsForDateRange(
    start: Date,
    end: Date,
    populateSelect: string,
  ): Promise<{ details: DetailLineForDrinkType[] }> {
    const sales = await this.saleModel
      .find({ DateSale: { $gte: start, $lt: end } })
      .lean()
      .exec();

    const saleIds = sales.map(s => s._id);
    const details = await this.saleDetailModel
      .find({ saleId: { $in: saleIds } })
      .populate("beverageId", populateSelect)
      .lean()
      .exec();

    return { details: details as DetailLineForDrinkType[] };
  }
}
