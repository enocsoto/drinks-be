import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type SaleCorrectionRequestDocument = SaleCorrectionRequest & Document;

export enum SaleCorrectionRequestStatus {
  PENDING = "PENDING",
  RESOLVED = "RESOLVED",
  REJECTED = "REJECTED",
}

@Schema({ timestamps: true, collection: "sale_correction_requests" })
export class SaleCorrectionRequest {
  @Prop({ type: Types.ObjectId, ref: "Sale", required: true })
  saleId: Types.ObjectId;

  /** Documento (cédula) del mesero que solicita */
  @Prop({ type: Number, required: true })
  requestedByDocument: number;

  @Prop({ type: String, trim: true })
  reason?: string;

  @Prop({
    type: String,
    enum: Object.values(SaleCorrectionRequestStatus),
    default: SaleCorrectionRequestStatus.PENDING,
  })
  status: SaleCorrectionRequestStatus;

  @Prop({ type: Number })
  resolvedByDocument?: number;

  @Prop({ type: Date })
  resolvedAt?: Date;
}

export const SaleCorrectionRequestSchema = SchemaFactory.createForClass(SaleCorrectionRequest);

SaleCorrectionRequestSchema.index({ saleId: 1, status: 1 });
SaleCorrectionRequestSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc: unknown, ret: unknown) => {
    const r = ret as Record<string, unknown>;
    r.id = r._id?.toString();
    delete r._id;
    delete r.__v;
    return r;
  },
});
