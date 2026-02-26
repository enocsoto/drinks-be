import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type SaleDocument = Sale & Document;

export const TABLE_NUMBERS = [1, 2, 3, 4, 5, 6] as const;
export type TableNumber = (typeof TABLE_NUMBERS)[number];

@Schema({ timestamps: true, collection: "sales" })
export class Sale {
  @Prop({ type: Number, required: true })
  userDocument: number;

  @Prop({ type: Number, required: true, min: 1, max: 6, default: 1 })
  tableNumber: number;

  @Prop({ required: true, type: Number, default: 0 })
  totalPrice: number;

  /** Fecha de la venta en Colombia (YYYY-MM-DD). Se usa para filtrar sin problemas de zona horaria. */
  @Prop({ type: String })
  saleDate: string;

  @Prop({ required: true, default: Date.now })
  DateSale: Date;
}

export const SaleSchema = SchemaFactory.createForClass(Sale);

SaleSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc: unknown, ret: unknown) => {
    const r = ret as Record<string, unknown>;
    r.id = r._id?.toString();
    delete r._id;
    delete r.__v;
    return r;
  },
});
