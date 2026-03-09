import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Sale, SaleDocument } from "../sales/schemas/sale.schema";
import { SaleDetail, SaleDetailDocument } from "../sales/schemas/sale-detail.schema";
import { SaleDetailType } from "../sales/enum/sale-detail-type.enum";
import { SALE_DETAIL_TYPE_LABELS } from "../sales/enum/sale-detail-type.enum";
import { getDayRangeColombia } from "../common/utils/date-colombia.util";
import { DailyClosingDataDto, DailyClosingItemDto } from "./dto/daily-closing-data.dto";

/**
 * Servicio con responsabilidad única: obtener los datos agregados del cierre del día
 * (todos los productos vendidos: bebidas, guantes, juegos). No conoce formatos de documento (SOLID).
 */
@Injectable()
export class DailyClosingService {
  constructor(
    @InjectModel(Sale.name) private readonly saleModel: Model<SaleDocument>,
    @InjectModel(SaleDetail.name) private readonly saleDetailModel: Model<SaleDetailDocument>,
  ) {}

  /**
   * Obtiene los datos del cierre del día: todos los productos vendidos (bebidas, guantes, juegos),
   * cantidades, precios y totales. Usa hora Colombia para coincidir con ventas y analytics.
   */
  async getDataForDate(date: string): Promise<DailyClosingDataDto> {
    const { start, end } = getDayRangeColombia(date);

    const sales = await this.saleModel
      .find({
        $or: [
          { saleDate: date },
          { saleDate: { $exists: false }, DateSale: { $gte: start, $lt: end } },
        ],
      })
      .lean()
      .exec();

    const saleIds = sales.map(s => s._id);
    const details = await this.saleDetailModel
      .find({ saleId: { $in: saleIds } })
      .populate("beverageId", "name")
      .lean()
      .exec();

    const byProduct = new Map<
      string,
      { name: string; quantity: number; unitPrice: number; subtotal: number }
    >();

    for (const d of details) {
      const type = d.type ?? SaleDetailType.BEVERAGE;
      let name: string;
      let key: string;

      if (type === SaleDetailType.BEVERAGE && d.beverageId) {
        const beverage = d.beverageId as unknown as { _id: unknown; name: string } | null;
        name = beverage?.name ?? "Bebida sin nombre";
        const ref = beverage?._id ?? d.beverageId;
        key =
          ref == null
            ? name
            : typeof ref === "string"
              ? ref
              : typeof (ref as { toString?: () => string }).toString === "function"
                ? (ref as { toString: () => string }).toString()
                : name;
      } else {
        const label = SALE_DETAIL_TYPE_LABELS[type] ?? type;
        const desc =
          typeof d.description === "string" && d.description.trim() ? d.description.trim() : "";
        name = desc ? `${label}: ${desc}` : label;
        key = `${type}_${desc || label}`;
      }

      const qty = Number(d.quantity);
      const unitPrice = Number(d.unitPrice);
      const subtotal = Number(d.subtotal);

      if (!byProduct.has(key)) {
        byProduct.set(key, { name, quantity: 0, unitPrice, subtotal: 0 });
      }
      const entry = byProduct.get(key)!;
      entry.quantity += qty;
      entry.subtotal += subtotal;
    }

    const items: DailyClosingItemDto[] = Array.from(byProduct.values()).map(
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
