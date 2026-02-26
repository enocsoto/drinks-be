import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserModule } from "./user.module";
import { AuthModule } from "../auth/auth.module";

/**
 * Módulo de API de usuarios. Importa UserModule (dominio) y AuthModule (guards).
 * Evita dependencia circular: UserModule no importa AuthModule.
 */
@Module({
  imports: [UserModule, AuthModule],
  controllers: [UserController],
})
export class UserApiModule {}
