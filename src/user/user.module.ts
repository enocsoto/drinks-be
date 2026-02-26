import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UserService } from "./user.service";
import { User, UserSchema } from "./schemas/user.schema";

/**
 * Módulo de dominio de usuarios (servicio + schema).
 * No importa AuthModule para evitar dependencia circular.
 * Las rutas protegidas están en UserApiModule.
 */
@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  providers: [UserService],
  exports: [UserService, MongooseModule],
})
export class UserModule {}
