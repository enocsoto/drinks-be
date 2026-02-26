import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type SaleHistoryDocument = SaleHistory & Document;

@Schema({ timestamps: true, collection: "sale_history" })
export class SaleHistory {
  @Prop({ type: Types.ObjectId, ref: "Sale", required: true })
  saleId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  updatedByUserId: Types.ObjectId;

  @Prop({ type: Object, required: true })
  previousData: Record<string, unknown>;

  @Prop({ required: true })
  changeDescription: string;
}

export const SaleHistorySchema = SchemaFactory.createForClass(SaleHistory);

SaleHistorySchema.set("toJSON", {
  virtuals: true,
  transform: (_doc: unknown, ret: unknown) => {
    const r = ret as Record<string, unknown>;
    r.id = r._id?.toString();
    r.saleId = r.saleId?.toString();
    r.updatedByUserId = r.updatedByUserId?.toString();
    delete r._id;
    delete r.__v;
    return r;
  },
});
