import { Module } from "@nestjs/common";
import { DatabaseModule } from "./database/database.module";
import { ConfigModule } from "@nestjs/config";
import { UserModule } from './user/user.module';
import { BeverageModule } from './beverage/beverage.module';
import { SalesModule } from './sales/sales.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, envFilePath: ".env" }), DatabaseModule, UserModule, BeverageModule, SalesModule],
})
export class AppModule {}
