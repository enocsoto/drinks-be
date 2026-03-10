import { Injectable, NotFoundException, BadRequestException, Inject } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CreateSaleDto } from "./dto/create-sale.dto";
import { UpdateSaleDto } from "./dto/update-sale.dto";
import { Sale, SaleDocument } from "./schemas/sale.schema";
import { SaleDetail, SaleDetailDocument } from "./schemas/sale-detail.schema";
import { SaleHistory, SaleHistoryDocument } from "./schemas/sale-history.schema";
import { BeverageService } from "../beverage/beverage.service";
import { CreateSaleResponseDto } from "./dto/response/create-sale.response.dto";
import { User, UserDocument } from "../user/schemas/user.schema";
import { todayColombia, getDayRangeColombia } from "../common/utils/date-colombia.util";
import { SaleDetailType } from "./enum/sale-detail-type.enum";

@Injectable()
export class SalesService {
  constructor(
    @InjectModel(Sale.name) private readonly saleModel: Model<SaleDocument>,
    @InjectModel(SaleDetail.name) private readonly saleDetailModel: Model<SaleDetailDocument>,
    @InjectModel(SaleHistory.name) private readonly saleHistoryModel: Model<SaleHistoryDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @Inject(BeverageService) private readonly beverageService: BeverageService,
  ) {}

  async create(createSaleDto: CreateSaleDto, user: UserDocument): Promise<CreateSaleResponseDto> {
    if (!createSaleDto.sellerId) createSaleDto.sellerId = user?.document;

    const {
      tableNumber,
      lineType,
      beverageId,
      quantity,
      unitPrice: inputUnitPrice,
      description,
      sellerId,
    } = createSaleDto;

    let unitPrice: number;
    const detailPayload: Partial<SaleDetailDocument> = {
      saleId: undefined as unknown as Types.ObjectId,
      type: lineType,
      quantity,
      description: description ?? "",
    };

    if (lineType === SaleDetailType.BEVERAGE) {
      if (!beverageId) {
        throw new BadRequestException(
          "beverageId es obligatorio cuando el tipo de venta es BEVERAGE.",
        );
      }
      const beverage = await this.beverageService.findOne(beverageId);
      unitPrice = Number(beverage.price);
      detailPayload.beverageId = new Types.ObjectId(beverageId);

      // Regla de negocio: no vender si no hay stock suficiente (decremento atómico)
      await this.beverageService.decrementStock(beverageId, quantity);
    } else {
      if (inputUnitPrice == null || inputUnitPrice < 0) {
        throw new BadRequestException(
          "unitPrice es obligatorio para ventas de tipo GLOVES o GAME.",
        );
      }
      unitPrice = Number(inputUnitPrice);
    }

    const subtotal = Number((unitPrice * quantity).toFixed(2));

    const saleDate = todayColombia();
    let sale: SaleDocument;
    try {
      sale = await this.saleModel.create({
        userDocument: sellerId,
        tableNumber,
        totalPrice: subtotal,
        saleDate,
        DateSale: new Date(),
      });
    } catch (err) {
      if (lineType === SaleDetailType.BEVERAGE && beverageId) {
        await this.beverageService.incrementStock(beverageId, quantity);
      }
      throw err;
    }

    detailPayload.saleId = sale._id;
    detailPayload.unitPrice = unitPrice;
    detailPayload.subtotal = subtotal;

    let detail: SaleDetailDocument;
    try {
      detail = await this.saleDetailModel.create(detailPayload);
    } catch (err) {
      if (lineType === SaleDetailType.BEVERAGE && beverageId) {
        await this.beverageService.incrementStock(beverageId, quantity);
      }
      await this.saleModel.deleteOne({ _id: sale._id }).exec();
      throw err;
    }

    return {
      sale: sale.toJSON(),
      detail: detail.toJSON(),
    };
  }

  async findAll(date?: string): Promise<{ sales: unknown[]; summary: unknown[] }> {
    if (!date) date = todayColombia();
    const { start, end } = getDayRangeColombia(date);
    const where: Record<string, unknown> = {
      $or: [
        { saleDate: date },
        { saleDate: { $exists: false }, DateSale: { $gte: start, $lt: end } },
      ],
    };

    const sales = await this.saleModel.find(where).sort({ DateSale: -1 }).lean().exec();

    const saleIds = sales.map(s => s._id);
    const details = await this.saleDetailModel
      .find({ saleId: { $in: saleIds } })
      .populate("beverageId", "name type price")
      .lean()
      .exec();

    const docNumbers = [...new Set(sales.map(s => s.userDocument))];
    const users = await this.userModel
      .find({ document: { $in: docNumbers } })
      .select("name document")
      .lean()
      .exec();
    const userByDoc = new Map<number, { document: number; name: string }>();
    for (const u of users) {
      userByDoc.set(u.document, { document: u.document, name: u.name });
    }

    const detailsBySale = new Map<string, typeof details>();
    for (const d of details) {
      const sid = d.saleId.toString();
      if (!detailsBySale.has(sid)) detailsBySale.set(sid, []);
      detailsBySale.get(sid)!.push(d);
    }

    const salesWithDetails = sales.map(s => {
      const user = userByDoc.get(s.userDocument) ?? null;
      const detailsList = detailsBySale.get(s._id.toString()) ?? [];
      return {
        ...s,
        id: s._id.toString(),
        tableNumber: s.tableNumber ?? 1,
        user,
        details: detailsList.map(d => this.mapDetailToResponse(d)),
      };
    });

    const summaryBySeller = this.summaryBySeller(salesWithDetails);

    return { sales: salesWithDetails, summary: Object.values(summaryBySeller) };
  }

  async findOne(sellerId: number, date?: string): Promise<unknown> {
    try {
      if (date && sellerId) {
        const { start, end } = getDayRangeColombia(date);
        const sales = await this.saleModel
          .find({
            userDocument: sellerId,
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
          .populate("beverageId", "name type price")
          .lean()
          .exec();

        const users = await this.userModel
          .find({ document: { $in: [...new Set(sales.map(s => s.userDocument))] } })
          .select("name document")
          .lean()
          .exec();
        const userByDoc = new Map<number, { document: number; name: string }>();
        for (const u of users) userByDoc.set(u.document, { document: u.document, name: u.name });

        const detailsBySale = new Map<string, typeof details>();
        for (const d of details) {
          const sid = d.saleId.toString();
          if (!detailsBySale.has(sid)) detailsBySale.set(sid, []);
          detailsBySale.get(sid)!.push(d);
        }

        const salesWithDetails = sales.map(s => {
          const user = userByDoc.get(s.userDocument) ?? null;
          const detailsList = detailsBySale.get(s._id.toString()) ?? [];
          return {
            ...s,
            id: s._id.toString(),
            tableNumber: s.tableNumber ?? 1,
            user,
            details: detailsList.map(d => this.mapDetailToResponse(d)),
          };
        });

        const summaryBySeller = this.summaryBySeller(salesWithDetails);
        return { sales: salesWithDetails, summary: Object.values(summaryBySeller) };
      }

      const sale = await this.saleModel.findOne({ userDocument: sellerId }).lean().exec();

      if (!sale) return null;

      const details = await this.saleDetailModel
        .find({ saleId: sale._id })
        .populate("beverageId", "name type price")
        .lean()
        .exec();

      const user = await this.userModel
        .findOne({ document: sale.userDocument })
        .select("name document")
        .lean()
        .exec();

      return {
        ...sale,
        id: sale._id.toString(),
        tableNumber: sale.tableNumber ?? 1,
        user: user ? { document: user.document, name: user.name } : null,
        details: details.map(d => this.mapDetailToResponse(d)),
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new BadRequestException(`Error al buscar la venta: ${message}`);
    }
  }

  async findSaleById(id: string): Promise<SaleDocument & { details: SaleDetailDocument[] }> {
    const sale = await this.saleModel.findById(id).exec();
    const details = await this.saleDetailModel.find({ saleId: id }).exec();
    if (!sale) throw new NotFoundException(`Venta con id ${id} no encontrada`);

    const saleObj = sale.toObject() as unknown as Record<string, unknown>;
    saleObj.details = details;
    return saleObj as unknown as SaleDocument & { details: SaleDetailDocument[] };
  }

  async update(
    id: string,
    updateSaleDto: UpdateSaleDto,
    user: UserDocument,
  ): Promise<SaleDocument & { details: SaleDetailDocument[] }> {
    const sale = await this.saleModel.findById(id).exec();
    if (!sale) throw new NotFoundException(`Sale with id ${id} not found`);

    const details = await this.saleDetailModel.find({ saleId: id }).exec();
    const detail = details[0];
    if (!detail) throw new BadRequestException("Sale has no details to update");

    const previousData = {
      sale: sale.toJSON(),
      detail: detail.toJSON(),
    };

    let quantity = detail.quantity;
    let beverageId = detail.beverageId;
    let unitPrice = Number(detail.unitPrice);

    if (updateSaleDto.quantity !== undefined) quantity = updateSaleDto.quantity;
    if (updateSaleDto.beverageId !== undefined)
      beverageId = new Types.ObjectId(updateSaleDto.beverageId) as unknown as Types.ObjectId;

    if (detail.type === SaleDetailType.BEVERAGE && beverageId) {
      const beverage = await this.beverageService.findOne(beverageId.toString());
      unitPrice = Number(beverage.price);
    } else if (updateSaleDto.unitPrice !== undefined) {
      unitPrice = Number(updateSaleDto.unitPrice);
    }

    const subtotal = Number((unitPrice * quantity).toFixed(2));

    // Ajuste de stock al modificar venta de bebida
    if (detail.type === SaleDetailType.BEVERAGE) {
      const oldQuantity = detail.quantity;
      const oldBeverageId = detail.beverageId?.toString();
      const newBeverageId = beverageId?.toString();

      if (oldBeverageId && newBeverageId) {
        if (oldBeverageId === newBeverageId) {
          const deltaQty = quantity - oldQuantity;
          if (deltaQty > 0) {
            await this.beverageService.decrementStock(newBeverageId, deltaQty);
          } else if (deltaQty < 0) {
            await this.beverageService.incrementStock(oldBeverageId, -deltaQty);
          }
        } else {
          await this.beverageService.incrementStock(oldBeverageId, oldQuantity);
          await this.beverageService.decrementStock(newBeverageId, quantity);
        }
      }
    }

    const newTotal = details.reduce((acc: number, d) => {
      if (d._id.toString() === detail._id.toString()) return acc + subtotal;
      return acc + Number(d.subtotal);
    }, 0);
    const totalPrice = Number(newTotal.toFixed(2));

    if (updateSaleDto.sellerId) sale.userDocument = updateSaleDto.sellerId;
    if (updateSaleDto.tableNumber !== undefined) sale.tableNumber = updateSaleDto.tableNumber;
    sale.totalPrice = totalPrice;
    await sale.save();

    await this.saleDetailModel
      .updateOne({ _id: detail._id }, { beverageId, quantity, unitPrice, subtotal })
      .exec();

    await this.saleHistoryModel.create({
      saleId: new Types.ObjectId(id),
      updatedByUserId: user._id,
      previousData,
      changeDescription: updateSaleDto.changeDescription ?? "Actualización",
    });

    const updated = await this.findSaleById(id);
    return updated as SaleDocument & { details: SaleDetailDocument[] };
  }

  private mapDetailToResponse(d: {
    _id?: unknown;
    saleId?: unknown;
    beverageId?: unknown;
    [key: string]: unknown;
  }): Record<string, unknown> {
    const beverageId =
      d.beverageId && typeof d.beverageId === "object" && "_id" in d.beverageId
        ? (d.beverageId as { _id: { toString: () => string } })._id?.toString()
        : (d.beverageId as { toString?: () => string })?.toString?.();
    const beverage =
      d.beverageId && typeof d.beverageId === "object" && "name" in d.beverageId
        ? d.beverageId
        : undefined;
    return {
      ...d,
      id: (d._id as { toString?: () => string })?.toString?.(),
      beverageId: beverageId ?? null,
      beverage,
      saleId: (d.saleId as { toString?: () => string })?.toString?.(),
    };
  }

  private summaryBySeller(
    sales: Array<{
      userDocument: number;
      user?: { document: number; name: string } | null;
      details: Array<{ quantity?: number } | Record<string, unknown>>;
    }>,
  ): Record<string, { sellerId: number; name?: string; totalQuantity: number }> {
    const summaryBySeller: Record<
      string,
      { sellerId: number; name?: string; totalQuantity: number }
    > = {};
    for (const sale of sales) {
      const user = sale.user;
      const seller = user ? user.document : sale.userDocument;
      const sellerName = user ? user.name : "Vendedor Eliminado";
      const details = sale.details || [];
      const qty = details.reduce((acc, d) => acc + Number(d.quantity), 0);
      if (!summaryBySeller[seller])
        summaryBySeller[seller] = {
          sellerId: seller,
          name: sellerName,
          totalQuantity: 0,
        };
      summaryBySeller[seller].totalQuantity += qty;
    }
    return summaryBySeller;
  }
}
