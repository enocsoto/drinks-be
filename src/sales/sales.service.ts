import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Sale } from './entities/sale.entity';
import { SaleDetail } from './entities/sale-detail.entity';
import { SaleHistory } from './entities/sale-history.entity';
import { Sequelize } from 'sequelize-typescript';
import { Op } from 'sequelize';
import { BeverageService } from '../beverage/beverage.service';
import { CreateSaleResponseDto } from './dto/response/create-sale.response.dto';
import { User } from '../user/entities/user.entity';

@Injectable()
export class SalesService {
  constructor(
    @InjectModel(Sale) private readonly saleModel: typeof Sale,
    @InjectModel(SaleDetail) private readonly saleDetailModel: typeof SaleDetail,
    @InjectModel(SaleHistory) private readonly saleHistoryModel: typeof SaleHistory,
    @Inject(BeverageService) private readonly beverageService: BeverageService,
    private readonly sequelize: Sequelize,
  ) {}

  async create(createSaleDto: CreateSaleDto, user:User): Promise<CreateSaleResponseDto> {
        if (!createSaleDto.sellerId) createSaleDto.sellerId = user?.document;
    
    const { beverageId, quantity, sellerId } = createSaleDto;

    const transaction = await this.sequelize.transaction();
    try {
      const beverage = await this.beverageService.findOne(beverageId);
      const unitPrice = Number(beverage.price);
      const subtotal = Number((unitPrice * quantity).toFixed(2));

      const computedTotal = subtotal;

      const sale: Sale = await this.saleModel.create(
        {
          userDocument: sellerId,
          totalPrice: computedTotal,
          DateSale: new Date(),
        },
        { transaction },
      );

      const detail: SaleDetail = await this.saleDetailModel.create(
        {
          saleId: sale.id,
          beverageId,
          quantity,
          unitPrice,
          subtotal,
        },
        { transaction },
      );

      await transaction.commit();

      return { sale: sale.toJSON(), detail: detail.toJSON() };
    } catch (error) {
      await transaction.rollback();
      throw new BadRequestException(`Error al crear la venta: ${error.message}`);
    }
  }

  /** Devuelve el rango start/end para una fecha dada (00:00:00.000 - inicio del siguiente día) */
  private getDayRange(date: string) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    return { start: dayStart, end: dayEnd };
  }

  /**
   * Devuelve ventas (y resumen por vendedor) opcionalmente filtradas por fecha.
   * Si no hay fecha, devuelve todas las ventas.
   */
  async findAll(date?: string) {
    const where: any = {};
    if (date) {
      const { start, end } = this.getDayRange(date);
      where.DateSale = { [Op.gte]: start, [Op.lt]: end };
    }

    const sales = await this.saleModel.findAll({
      where,
      include: [{ model: this.saleDetailModel }, { association: "user" }],
      order: [["DateSale", "DESC"]],
    });

    const summaryBySeller = this.summaryBySeller(sales)

    return { sales, summary: Object.values(summaryBySeller) };
  }

  /**
   * Buscar una venta por id, o si se pasan 'date' y 'sellerId',
   * devolver ventas de ese vendedor en la fecha.
   */
  async findOne(id: number, date?: string, sellerId?: string) {
    if (date && sellerId) {
      const { start, end } = this.getDayRange(date);
      const sales = await this.saleModel.findAll({
        where: { DateSale: { [Op.gte]: start, [Op.lt]: end }, userId: sellerId },
        include: [{ model: this.saleDetailModel }, { association: "user" }],
      });

      const summaryBySeller = this.summaryBySeller(sales);

      return { sales, summary: Object.values(summaryBySeller) };
    }

    return await this.saleModel.findOne({
      where: { id },
      include: [{ model: this.saleDetailModel }, { association: "user" }],
    });
  }

  update(id: number, updateSaleDto: UpdateSaleDto) {
    return this.sequelize.transaction(async transaction => {
      const sale = await this.saleModel.findByPk(id, {
        include: [{ model: this.saleDetailModel }],
        transaction,
      });
      if (!sale) throw new NotFoundException(`Sale with id ${id} not found`);

      const detail = sale.details && sale.details[0];
      if (!detail) throw new BadRequestException("Sale has no details to update");

      const previousData = { sale: sale.toJSON(), detail: detail.toJSON() };

      let fieldsToUpdate;

      let quantity = detail.quantity;
      let beverageId = detail.beverageId;
      if (updateSaleDto.quantity !== undefined) quantity = updateSaleDto.quantity;
      if (updateSaleDto.beverageId !== undefined)
        beverageId = updateSaleDto.beverageId;

      let unitPrice = Number(detail.unitPrice);
      if (updateSaleDto.beverageId !== undefined) {
        const beverage = await this.beverageService.findOne(beverageId);
        unitPrice = Number(beverage.price);
      }

      const subtotal = Number((unitPrice * quantity).toFixed(2));
      await this.saleDetailModel.update(
        { beverageId, quantity, unitPrice, subtotal },
        { where: { saleId: sale.id }, transaction },
      );

      if (updateSaleDto.sellerId) fieldsToUpdate.userId = updateSaleDto.sellerId;

      const details = await this.saleDetailModel.findAll({
        where: { saleId: sale.id },
        transaction,
      });
      const newTotal = details.reduce((acc, d) => acc + Number(d.subtotal), 0);
      fieldsToUpdate.totalPrice = Number(newTotal.toFixed(2));

      await sale.update(fieldsToUpdate, { transaction });

      if (updateSaleDto.updatedByUserId) {
        await this.saleHistoryModel.create(
          {
            saleId: sale.id,
            updatedByUserId: updateSaleDto.updatedByUserId,
            previousData,
            changeDescription: `Detalle actualizado`,
          },
          { transaction },
        );
      }

      return this.findOne(id);
    });
  }

  private summaryBySeller(sales: Sale[]){
    const summaryBySeller: Record<
      string,
      { sellerId: number;
        name?: string;
        totalQuantity: number
      }
      > = {};
      for (const sale of sales) {
        const user = sale.user;
        const seller = user ? user.document : sale.userDocument;
        const sellerName = user ? user.name : "Vendedor Eliminado";
        const details = sale.details || [];
        const qty = details.reduce((acc: number, d: SaleDetail) => acc + Number(d.quantity), 0);
        if (!summaryBySeller[seller])
          summaryBySeller[seller] = { sellerId: seller, name: sellerName, totalQuantity: 0 };
        summaryBySeller[seller].totalQuantity += qty;
      }
      return Object.values(summaryBySeller);
  }
}

