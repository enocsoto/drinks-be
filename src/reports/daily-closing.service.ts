import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Sale, SaleDocument } from "../sales/schemas/sale.schema";
import { SaleDetail, SaleDetailDocument } from "../sales/schemas/sale-detail.schema";
import { SaleDetailType } from "../sales/enum/sale-detail-type.enum";
import { getDayRange } from "../common/utils/date.util";
import { DailyClosingDataDto, DailyClosingItemDto } from "./dto/daily-closing-data.dto";

/**
 * Servicio con responsabilidad única: obtener los datos agregados del cierre del día
 * (cantidad de bebidas vendidas por producto). No conoce formatos de documento (SOLID).
 */
@Injectable()
export class DailyClosingService {
  constructor(
    @InjectModel(Sale.name) private readonly saleModel: Model<SaleDocument>,
    @InjectModel(SaleDetail.name) private readonly saleDetailModel: Model<SaleDetailDocument>,
  ) {}

  /**
   * Obtiene los datos del cierre del día: productos vendidos (solo bebidas),
   * cantidades, precios y totales. Reutiliza getDayRange (DRY).
   */
  async getDataForDate(date: string): Promise<DailyClosingDataDto> {
    const { start, end } = getDayRange(date);

    const sales = await this.saleModel
      .find({ DateSale: { $gte: start, $lt: end } })
      .lean()
      .exec();

    const saleIds = sales.map(s => s._id);
    const details = await this.saleDetailModel
      .find({
        saleId: { $in: saleIds },
        type: SaleDetailType.BEVERAGE,
        beverageId: { $exists: true, $ne: null },
      })
      .populate("beverageId", "name")
      .lean()
      .exec();

    const byBeverage = new Map<
      string,
      { name: string; quantity: number; unitPrice: number; subtotal: number }
    >();

    for (const d of details) {
      const beverage = d.beverageId as unknown as { _id: unknown; name: string } | null;
      const name = beverage?.name ?? "Bebida sin nombre";
      const ref = beverage?._id ?? d.beverageId;
      const key =
        ref == null
          ? name
          : typeof ref === "string"
            ? ref
            : typeof (ref as { toString?: () => string }).toString === "function"
              ? (ref as { toString: () => string }).toString()
              : name;
      const qty = Number(d.quantity);
      const unitPrice = Number(d.unitPrice);
      const subtotal = Number(d.subtotal);

      if (!byBeverage.has(key)) {
        byBeverage.set(key, { name, quantity: 0, unitPrice, subtotal: 0 });
      }
      const entry = byBeverage.get(key)!;
      entry.quantity += qty;
      entry.subtotal += subtotal;
    }

    const items: DailyClosingItemDto[] = Array.from(byBeverage.values()).map(
      ({ name, quantity, unitPrice, subtotal }) => ({
        beverageName: name,
        quantity,
        unitPrice,
        subtotal,
      }),
    );

    const totalQuantity = items.reduce((acc, i) => acc + i.quantity, 0);
    const totalAmount = items.reduce((acc, i) => acc + i.subtotal, 0);

    return {
      date,
      generatedAt: new Date(),
      items,
      totalQuantity,
      totalAmount: Number(totalAmount.toFixed(2)),
      totalTransactions: sales.length,
    };
  }
}
