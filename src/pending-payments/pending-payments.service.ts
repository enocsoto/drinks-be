import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreatePendingPaymentDto } from "./dto/create-pending-payment.dto";
import { UpdatePendingPaymentDto } from "./dto/update-pending-payment.dto";
import { PendingPayment, PendingPaymentDocument } from "./schemas/pending-payment.schema";

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

@Injectable()
export class PendingPaymentsService {
  constructor(
    @InjectModel(PendingPayment.name)
    private readonly pendingPaymentModel: Model<PendingPaymentDocument>,
  ) {}

  async create(dto: CreatePendingPaymentDto): Promise<PendingPaymentDocument> {
    const doc = await this.pendingPaymentModel.create({
      personName: dto.personName,
      nickname: dto.nickname ?? "",
      debtDate: dto.debtDate,
      amount: dto.amount,
      drinkTypes: dto.drinkTypes ?? [],
      hasGloves: dto.hasGloves ?? false,
      hasPendingGames: dto.hasPendingGames ?? false,
      description: dto.description ?? "",
    });
    return doc;
  }

  async findAllPaginated(
    page: number = 1,
    limit: number = 10,
    search?: string,
    debtDateFrom?: string,
    debtDateTo?: string,
  ): Promise<{
    data: PendingPaymentDocument[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (Math.max(1, page) - 1) * Math.max(1, limit);
    const take = Math.min(100, Math.max(1, limit));

    const filter: Record<string, unknown> = {};
    if (search && search.trim()) {
      const regex = new RegExp(escapeRegex(search.trim()), "i");
      filter.$or = [{ personName: regex }, { nickname: regex }, { description: regex }];
    }
    if (debtDateFrom || debtDateTo) {
      filter.debtDate = {};
      if (debtDateFrom) (filter.debtDate as Record<string, string>).$gte = debtDateFrom;
      if (debtDateTo) (filter.debtDate as Record<string, string>).$lte = debtDateTo;
    }

    const [data, total] = await Promise.all([
      this.pendingPaymentModel
        .find(filter)
        .sort({ debtDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(take)
        .lean()
        .exec(),
      this.pendingPaymentModel.countDocuments(filter).exec(),
    ]);

    const items = data.map((doc: { _id: { toString: () => string }; [key: string]: unknown }) => ({
      ...doc,
      id: doc._id.toString(),
    })) as PendingPaymentDocument[];

    return {
      data: items,
      total,
      page: Math.max(1, page),
      limit: take,
      totalPages: Math.ceil(total / take) || 1,
    };
  }

  async findOne(id: string): Promise<PendingPaymentDocument> {
    const doc = await this.pendingPaymentModel.findById(id).exec();
    if (!doc) {
      throw new NotFoundException(`No existe el registro de pago pendiente con id ${id}.`);
    }
    return doc;
  }

  async update(id: string, dto: UpdatePendingPaymentDto): Promise<PendingPaymentDocument> {
    const doc = await this.pendingPaymentModel.findById(id).exec();
    if (!doc) {
      throw new NotFoundException(`No existe el registro de pago pendiente con id ${id}.`);
    }
    if (dto.personName != null) doc.personName = dto.personName;
    if (dto.nickname !== undefined) doc.nickname = dto.nickname ?? "";
    if (dto.debtDate != null) doc.debtDate = dto.debtDate;
    if (dto.amount != null) doc.amount = dto.amount;
    if (dto.drinkTypes !== undefined) doc.drinkTypes = dto.drinkTypes ?? [];
    if (dto.hasGloves !== undefined) doc.hasGloves = dto.hasGloves;
    if (dto.hasPendingGames !== undefined) doc.hasPendingGames = dto.hasPendingGames;
    if (dto.description !== undefined) doc.description = dto.description ?? "";
    await doc.save();
    return doc;
  }

  async remove(id: string): Promise<boolean> {
    const doc = await this.pendingPaymentModel.findByIdAndDelete(id).exec();
    if (!doc) {
      throw new NotFoundException(`No existe el registro de pago pendiente con id ${id}.`);
    }
    return true;
  }
}
