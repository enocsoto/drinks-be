import { Module } from "@nestjs/common";
import { DatabaseModule } from "./database/database.module";
import { ConfigModule } from "@nestjs/config";
import { UserModule } from "./user/user.module";
import { BeverageModule } from "./beverage/beverage.module";
import { SalesModule } from "./sales/sales.module";
import { AuthModule } from "./auth/auth.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ".env" }),
    DatabaseModule,
    UserModule,
    BeverageModule,
    SalesModule,
    AuthModule
  ],
})
export class AppModule {}
