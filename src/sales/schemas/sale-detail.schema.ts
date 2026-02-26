import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { SaleDetailType } from "../enum/sale-detail-type.enum";

export type SaleDetailDocument = SaleDetail & Document;

@Schema({ _id: true, timestamps: false })
export class SaleDetail {
  @Prop({ type: Types.ObjectId, ref: "Sale", required: true })
  saleId: Types.ObjectId;

  @Prop({ type: String, enum: Object.values(SaleDetailType), required: true })
  type: SaleDetailType;

  @Prop({ type: Types.ObjectId, ref: "Beverage", required: false })
  beverageId?: Types.ObjectId;

  @Prop({ default: "" })
  description: string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true, type: Number })
  unitPrice: number;

  @Prop({ required: true, type: Number })
  subtotal: number;
}

export const SaleDetailSchema = SchemaFactory.createForClass(SaleDetail);

SaleDetailSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc: unknown, ret: unknown) => {
    const r = ret as Record<string, unknown>;
    r.id = r._id?.toString();
    r.saleId = r.saleId?.toString();
    r.beverageId = r.beverageId?.toString();
    delete r._id;
    delete r.__v;
    return r;
  },
});
