import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { UserRole } from "../enum/user-roles.enum";

export type UserDocument = User & Document;

@Schema({ timestamps: true, collection: "users" })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ required: false, unique: true, sparse: true })
  document: number;

  @Prop({ type: [String], enum: Object.values(UserRole), default: [UserRole.SELLER] })
  role: UserRole[];

  @Prop({ default: true })
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.virtual("id").get(function () {
  return this._id?.toString();
});

UserSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc: unknown, ret: unknown) => {
    const r = ret as Record<string, unknown>;
    r.id = r._id?.toString();
    delete r._id;
    delete r.__v;
    return r;
  },
});
