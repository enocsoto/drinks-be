/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreatePendingPaymentDto } from "./dto/create-pending-payment.dto";
import { UpdatePendingPaymentDto } from "./dto/update-pending-payment.dto";
import { PendingPayment, PendingPaymentDocument } from "./schemas/pending-payment.schema";
import { DrinkType } from "../beverage/enum/drink-type.enum";

const PDFDocument = require("pdfkit");

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function formatCop(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

const DRINK_TYPE_LABELS: Record<string, string> = {
  [DrinkType.ALCOHOLIC]: "Alcohólica",
  [DrinkType.SODA]: "Gaseosa",
  [DrinkType.WATER]: "Agua",
  [DrinkType.JUICE]: "Jugo",
  [DrinkType.OTHER]: "Otro",
};

@Injectable()
export class PendingPaymentsService {
  constructor(
    @InjectModel(PendingPayment.name)
    private readonly pendingPaymentModel: Model<PendingPaymentDocument>,
  ) {}

  async create(dto: CreatePendingPaymentDto): Promise<PendingPaymentDocument> {
    const amountPaid = Math.min(dto.amountPaid ?? 0, dto.amount);
    const doc = await this.pendingPaymentModel.create({
      personName: dto.personName,
      nickname: dto.nickname ?? "",
      debtDate: dto.debtDate,
      amount: dto.amount,
      amountPaid,
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
    if (dto.amountPaid != null) doc.amountPaid = Math.min(Math.max(0, dto.amountPaid), doc.amount);
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

  /**
   * Genera un PDF tipo comanda (80mm) con la información en dos columnas.
   * Tamaño impresión comanda térmica; reimprimible.
   */
  async generateComandaPdf(id: string): Promise<Buffer> {
    const doc = await this.findOne(id);
    const plain = doc.toObject ? doc.toObject() : (doc as unknown as Record<string, unknown>);
    const amount = Number(plain.amount) || 0;
    const amountPaid = Number(plain.amountPaid) || 0;
    const remaining = Math.max(0, amount - amountPaid);

    // 80mm x 200mm (tamaño comanda térmica estándar)
    const W = 227; // 80mm en puntos
    const H = 567; // 200mm
    const MARGIN = 8;
    const COL_W = (W - 2 * MARGIN) / 2;
    const LEFT = MARGIN;
    const RIGHT = MARGIN + COL_W;
    const FONT_SM = 8;
    const FONT_MD = 9;
    const FONT_LG = 11;
    const ROW = 14;

    return new Promise((resolve, reject) => {
      const pdf = new PDFDocument({
        size: [W, H],
        margin: MARGIN,
        autoFirstPage: true,
      });
      const chunks: Buffer[] = [];

      pdf.on("data", (chunk: Buffer) => chunks.push(chunk));
      pdf.on("end", () => resolve(Buffer.concat(chunks)));
      pdf.on("error", reject);

      const brand = "#DC2626";
      const text = "#111827";
      const muted = "#6B7280";

      let y = MARGIN;

      // Encabezado
      pdf
        .fontSize(FONT_LG)
        .fillColor(brand)
        .font("Helvetica-Bold")
        .text("PAGO PENDIENTE", 0, y, {
          width: W - 2 * MARGIN,
          align: "center",
        });
      y += ROW;
      pdf
        .fontSize(FONT_SM)
        .fillColor(muted)
        .font("Helvetica")
        .text("Comanda — reimprimible", 0, y, {
          width: W - 2 * MARGIN,
          align: "center",
        });
      y += ROW + 4;

      const drinkTypes = plain.drinkTypes as string[] | undefined;
      const tiposStr = drinkTypes?.length
        ? drinkTypes.map(t => DRINK_TYPE_LABELS[t] ?? t).join(", ")
        : "—";
      const extras: string[] = [];
      if (plain.hasGloves) extras.push("Guantes");
      if (plain.hasPendingGames) extras.push("Juegos");
      const extrasStr = extras.length ? extras.join(", ") : "—";
      const desc = (plain.description as string) || "—";
      const descShort = desc.length > 28 ? desc.slice(0, 27) + "…" : desc;

      // Columna izquierda
      pdf.fontSize(FONT_MD).fillColor(text).font("Helvetica");
      pdf.text(`Persona: ${(plain.personName as string) || "—"}`, LEFT, y, { width: COL_W - 4 });
      y += ROW;
      pdf.text(`Fecha: ${(plain.debtDate as string) || "—"}`, LEFT, y, { width: COL_W - 4 });
      y += ROW;
      pdf.text(`Total: ${formatCop(amount)} COP`, LEFT, y, { width: COL_W - 4 });
      y += ROW;
      pdf.text(`Pagado: ${formatCop(amountPaid)} COP`, LEFT, y, { width: COL_W - 4 });
      y += ROW;
      pdf
        .font("Helvetica-Bold")
        .fillColor(brand)
        .text(`Saldo: ${formatCop(remaining)} COP`, LEFT, y, {
          width: COL_W - 4,
        });
      pdf.fillColor(text);

      // Columna derecha
      let yR = MARGIN + ROW * 2 + 4;
      pdf
        .font("Helvetica")
        .text(`Apodo: ${(plain.nickname as string) || "—"}`, RIGHT, yR, { width: COL_W - 4 });
      yR += ROW;
      pdf.text(`Tipos: ${tiposStr}`, RIGHT, yR, { width: COL_W - 4 });
      yR += ROW;
      pdf.text(`Extras: ${extrasStr}`, RIGHT, yR, { width: COL_W - 4 });
      yR += ROW;
      pdf.text(`Desc: ${descShort}`, RIGHT, yR, { width: COL_W - 4 });

      // Pie
      y = H - ROW * 2 - MARGIN;
      pdf.fontSize(FONT_SM).fillColor(muted).font("Helvetica");
      pdf.text(`ID: ${id}`, 0, y, { width: W - 2 * MARGIN, align: "center" });
      pdf.text(
        `Gen: ${new Date().toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" })}`,
        0,
        y + ROW - 2,
        {
          width: W - 2 * MARGIN,
          align: "center",
        },
      );

      pdf.end();
    });
  }
}
