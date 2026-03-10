import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CreateBeverageDto } from "./dto/create-beverage.dto";
import { UpdateBeverageDto } from "./dto/update-beverage.dto";
import { Beverage, BeverageDocument } from "./schemas/beverage.schema";

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

@Injectable()
export class BeverageService {
  constructor(
    @InjectModel(Beverage.name)
    private readonly beverageModel: Model<BeverageDocument>,
  ) {}

  /**
   * Crea una nueva bebida en el catálogo.
   */
  async create(createBeverageDto: CreateBeverageDto): Promise<BeverageDocument> {
    try {
      return await this.beverageModel.create({
        ...createBeverageDto,
        containerSize: createBeverageDto.containerSize ?? "",
        stock: createBeverageDto.stock ?? 0,
        costPrice: Math.max(0, createBeverageDto.costPrice ?? 0),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new BadRequestException(`Error al crear la bebida: ${message}`);
    }
  }

  /**
   * Lista bebidas con paginación. Por defecto solo activas; con includeInactive=true incluye todas.
   */
  async findAllPaginated(
    page: number = 1,
    limit: number = 10,
    search?: string,
    includeInactive: boolean = false,
  ): Promise<{
    data: BeverageDocument[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (Math.max(1, page) - 1) * Math.max(1, limit);
    const take = Math.min(100, Math.max(1, limit));

    const filter: { isActive?: boolean; name?: RegExp } = {};
    if (!includeInactive) filter.isActive = true;
    if (search && search.trim()) {
      filter.name = new RegExp(escapeRegex(search.trim()), "i");
    }

    const [data, total] = await Promise.all([
      this.beverageModel
        .find(filter)
        .sort({ name: 1, containerType: 1 })
        .skip(skip)
        .limit(take)
        .lean()
        .exec(),
      this.beverageModel.countDocuments(filter).exec(),
    ]);

    const items = data.map((doc: { _id: { toString: () => string }; [key: string]: unknown }) => ({
      ...doc,
      id: doc._id.toString(),
    })) as BeverageDocument[];

    return {
      data: items,
      total,
      page: Math.max(1, page),
      limit: take,
      totalPages: Math.ceil(total / take) || 1,
    };
  }

  /**
   * Decrementa el stock de una bebida de forma atómica.
   * Lanza BadRequestException si no hay stock suficiente.
   */
  async decrementStock(beverageId: string, quantity: number): Promise<BeverageDocument> {
    const result = await this.beverageModel
      .findOneAndUpdate(
        { _id: new Types.ObjectId(beverageId), stock: { $gte: quantity } },
        { $inc: { stock: -quantity } },
        { new: true },
      )
      .exec();
    if (!result) {
      const beverage = await this.beverageModel
        .findById(beverageId)
        .select("name stock")
        .lean()
        .exec();
      const currentStock = beverage?.stock ?? 0;
      throw new BadRequestException(
        `Stock insuficiente para "${beverage?.name ?? "la bebida"}". Disponible: ${currentStock}, solicitado: ${quantity}`,
      );
    }
    return result;
  }

  /**
   * Incrementa el stock de una bebida (p. ej. al cancelar o modificar una venta).
   */
  async incrementStock(beverageId: string, quantity: number): Promise<BeverageDocument> {
    const result = await this.beverageModel
      .findByIdAndUpdate(beverageId, { $inc: { stock: quantity } }, { new: true })
      .exec();
    if (!result) {
      throw new NotFoundException(`La bebida con id ${beverageId} no existe.`);
    }
    return result;
  }

  async findOne(id: string): Promise<BeverageDocument> {
    const beverage = await this.beverageModel
      .findOne({
        _id: id,
        isActive: true,
      })
      .exec();
    if (!beverage) {
      throw new NotFoundException(`La bebida con id ${id} no existe.`);
    }
    return beverage;
  }

  /**
   * Actualiza una bebida existente (solo administradores).
   */
  async update(id: string, updateBeverageDto: UpdateBeverageDto): Promise<BeverageDocument> {
    const beverage = await this.beverageModel.findById(id).exec();
    if (!beverage) {
      throw new NotFoundException(`La bebida con id ${id} no existe.`);
    }
    if (updateBeverageDto.name != null) beverage.name = updateBeverageDto.name;
    if (updateBeverageDto.price != null) beverage.price = updateBeverageDto.price;
    if (updateBeverageDto.type != null) beverage.type = updateBeverageDto.type;
    if (updateBeverageDto.containerType != null)
      beverage.containerType = updateBeverageDto.containerType;
    if (updateBeverageDto.containerSize !== undefined)
      beverage.containerSize = updateBeverageDto.containerSize ?? "";
    if (updateBeverageDto.imageUrl !== undefined)
      beverage.imageUrl = updateBeverageDto.imageUrl ?? "";
    if (updateBeverageDto.isActive !== undefined) beverage.isActive = updateBeverageDto.isActive;
    if (updateBeverageDto.stock !== undefined)
      beverage.stock = Math.max(0, updateBeverageDto.stock);
    if (updateBeverageDto.costPrice !== undefined)
      beverage.costPrice = Math.max(0, updateBeverageDto.costPrice);
    await beverage.save();
    return beverage;
  }

  /**
   * Recibe inventario: añade cantidad al stock y opcionalmente actualiza el precio de coste.
   * Si se proporciona costTotal, costPrice = round(costTotal / quantity).
   * Ej: canasta 68.000 COP con 38 unidades → costPrice = 1.800 COP/unidad.
   */
  async receiveInventory(
    id: string,
    quantity: number,
    costTotal?: number,
  ): Promise<BeverageDocument> {
    const beverage = await this.beverageModel.findById(id).exec();
    if (!beverage) {
      throw new NotFoundException(`La bebida con id ${id} no existe.`);
    }
    const qty = Math.max(1, Math.floor(quantity));
    if (costTotal != null && costTotal > 0 && qty > 0) {
      beverage.costPrice = Math.round(costTotal / qty);
    }
    beverage.stock = (beverage.stock ?? 0) + qty;
    await beverage.save();
    return beverage;
  }

  async remove(id: string): Promise<boolean> {
    const beverage = await this.beverageModel.findById(id).exec();
    if (!beverage) {
      throw new NotFoundException(`La bebida con id ${id} no existe.`);
    }
    beverage.isActive = false;
    await beverage.save();
    return true;
  }
}
