import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { DrinkType } from "../enum/drink-type.enum";
import { ContainerType } from "../enum/container-type.enum";

export type BeverageDocument = Beverage & Document;

@Schema({ timestamps: true, collection: "beverages" })
export class Beverage {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, type: Number })
  price: number;

  @Prop({ type: String, enum: Object.values(DrinkType), default: DrinkType.ALCOHOLIC })
  type: DrinkType;

  @Prop({ type: String, enum: Object.values(ContainerType), default: ContainerType.OTRO })
  containerType: ContainerType;

  @Prop({ default: "" })
  containerSize: string;

  /** Ruta de la imagen (ej. /beverages/agua-cristal.png). Servida desde el frontend en public/beverages/. */
  @Prop({ default: "" })
  imageUrl: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const BeverageSchema = SchemaFactory.createForClass(Beverage);

BeverageSchema.index({ name: 1, containerType: 1, containerSize: 1 }, { unique: true });

BeverageSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc: unknown, ret: unknown) => {
    const r = ret as Record<string, unknown>;
    r.id = r._id?.toString();
    delete r._id;
    delete r.__v;
    return r;
  },
});
