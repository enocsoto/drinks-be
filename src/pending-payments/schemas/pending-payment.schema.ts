import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { DrinkType } from "../../beverage/enum/drink-type.enum";

export type PendingPaymentDocument = PendingPayment & Document;

@Schema({ timestamps: true, collection: "pending_payments" })
export class PendingPayment {
  @Prop({ required: true })
  personName: string;

  @Prop({ default: "" })
  nickname: string;

  /** Fecha en que queda debiendo (YYYY-MM-DD). */
  @Prop({ type: String, required: true })
  debtDate: string;

  /** Monto adeudado en COP. */
  @Prop({ type: Number, required: true, min: 0 })
  amount: number;

  /** Tipos de bebida asociados (pueden ser varios). */
  @Prop({ type: [String], enum: Object.values(DrinkType), default: [] })
  drinkTypes: DrinkType[];

  /** Incluye guantes pendientes. */
  @Prop({ default: false })
  hasGloves: boolean;

  /** Incluye juegos pendientes. */
  @Prop({ default: false })
  hasPendingGames: boolean;

  @Prop({ default: "" })
  description: string;
}

export const PendingPaymentSchema = SchemaFactory.createForClass(PendingPayment);

PendingPaymentSchema.index({ personName: 1, debtDate: 1 });
PendingPaymentSchema.index({ debtDate: 1 });

PendingPaymentSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc: unknown, ret: unknown) => {
    const r = ret as Record<string, unknown>;
    r.id = r._id?.toString();
    delete r._id;
    delete r.__v;
    return r;
  },
});
