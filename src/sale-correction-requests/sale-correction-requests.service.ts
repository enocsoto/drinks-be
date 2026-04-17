import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import {
  SaleCorrectionRequest,
  SaleCorrectionRequestDocument,
  SaleCorrectionRequestStatus,
} from "./schemas/sale-correction-request.schema";
import { Sale, SaleDocument } from "../sales/schemas/sale.schema";
import { CreateSaleCorrectionRequestDto } from "./dto/create-sale-correction-request.dto";
import { UserDocument } from "../user/schemas/user.schema";
import { UserRole } from "../user/enum/user-roles.enum";
import { AdminResolveCorrectionStatus } from "./dto/update-sale-correction-request.dto";

@Injectable()
export class SaleCorrectionRequestsService {
  constructor(
    @InjectModel(SaleCorrectionRequest.name)
    private readonly requestModel: Model<SaleCorrectionRequestDocument>,
    @InjectModel(Sale.name) private readonly saleModel: Model<SaleDocument>,
  ) {}

  async create(dto: CreateSaleCorrectionRequestDto, user: UserDocument) {
    const role = Array.isArray(user.role) ? user.role[0] : user.role;
    if (role !== UserRole.SELLER) {
      throw new ForbiddenException("Solo el mesero puede solicitar una corrección.");
    }
    const doc = user.document;
    if (doc == null) throw new BadRequestException("Usuario sin documento.");

    if (!Types.ObjectId.isValid(dto.saleId)) {
      throw new BadRequestException("saleId inválido.");
    }

    const sale = await this.saleModel.findById(dto.saleId).lean().exec();
    if (!sale) throw new NotFoundException("Venta no encontrada.");

    if (sale.userDocument !== doc) {
      throw new ForbiddenException("Solo puedes solicitar corrección sobre tus propias ventas.");
    }

    const pending = await this.requestModel
      .findOne({
        saleId: new Types.ObjectId(dto.saleId),
        status: SaleCorrectionRequestStatus.PENDING,
      })
      .exec();
    if (pending) {
      throw new BadRequestException(
        "Ya existe una solicitud de corrección pendiente para esta venta.",
      );
    }

    const created = await this.requestModel.create({
      saleId: new Types.ObjectId(dto.saleId),
      requestedByDocument: doc,
      reason: dto.reason?.trim() || undefined,
      status: SaleCorrectionRequestStatus.PENDING,
    });
    return created.toJSON();
  }

  async findAllForAdmin(status?: SaleCorrectionRequestStatus) {
    const filter = status ? { status } : {};
    const items = await this.requestModel.find(filter).sort({ createdAt: -1 }).limit(500).exec();
    return items.map(r => r.toJSON());
  }

  async countPending() {
    return this.requestModel.countDocuments({ status: SaleCorrectionRequestStatus.PENDING }).exec();
  }

  async updateStatus(
    id: string,
    dto: { status: AdminResolveCorrectionStatus },
    admin: UserDocument,
  ) {
    const role = Array.isArray(admin.role) ? admin.role[0] : admin.role;
    if (role !== UserRole.ADMIN) {
      throw new ForbiddenException("Solo el administrador puede resolver solicitudes.");
    }
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException("id inválido.");

    const req = await this.requestModel.findById(id).exec();
    if (!req) throw new NotFoundException("Solicitud no encontrada.");

    if (req.status !== SaleCorrectionRequestStatus.PENDING) {
      throw new BadRequestException("La solicitud ya fue atendida.");
    }

    req.status = dto.status as unknown as SaleCorrectionRequestStatus;
    req.resolvedAt = new Date();
    req.resolvedByDocument = admin.document ?? undefined;
    await req.save();
    return req.toJSON();
  }
}
