import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { BeverageService } from "./beverage.service";
import { BeverageController } from "./beverage.controller";
import { Beverage, BeverageSchema } from "./schemas/beverage.schema";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Beverage.name, schema: BeverageSchema }]),
    AuthModule,
  ],
  controllers: [BeverageController],
  providers: [BeverageService],
  exports: [BeverageService],
})
export class BeverageModule {}
