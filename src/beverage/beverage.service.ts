import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
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
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new BadRequestException(`Error al crear la bebida: ${message}`);
    }
  }

  /**
   * Lista bebidas activas con paginación (para catálogo y registro de ventas).
   */
  async findAllPaginated(
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<{
    data: BeverageDocument[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (Math.max(1, page) - 1) * Math.max(1, limit);
    const take = Math.min(100, Math.max(1, limit));

    const filter: { isActive: boolean; name?: RegExp } = { isActive: true };
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
