import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { DatabaseModule } from "./database.module";
import { User, UserSchema } from "../user/schemas/user.schema";
import { Beverage, BeverageSchema } from "../beverage/schemas/beverage.schema";
import { Sale, SaleSchema } from "../sales/schemas/sale.schema";
import { SaleDetail, SaleDetailSchema } from "../sales/schemas/sale-detail.schema";
import { DatabaseSeedService } from "./database-seed.service";

/**
 * Módulo mínimo para ejecutar el seed sin cargar UserModule/AuthModule (evita dependencia circular).
 * Uso: NestFactory.createApplicationContext(SeedBootstrapModule)
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ".env" }),
    DatabaseModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Beverage.name, schema: BeverageSchema },
      { name: Sale.name, schema: SaleSchema },
      { name: SaleDetail.name, schema: SaleDetailSchema },
    ]),
  ],
  providers: [DatabaseSeedService],
})
export class SeedBootstrapModule {}
