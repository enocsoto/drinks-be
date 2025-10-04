import { Module } from "@nestjs/common";
import { SalesService } from "./sales.service";
import { SalesController } from "./sales.controller";
import { SaleHistory } from "./entities/sale-history.entity";
import { Sale } from "./entities/sale.entity";
import { SaleDetail } from "./entities/sale-detail.entity";
import { SequelizeModule } from "@nestjs/sequelize";
import { Beverage } from "../beverage/entities/beverage.entity";
import { BeverageModule } from "../beverage/beverage.module";

@Module({
  imports: [SequelizeModule.forFeature([
      Sale, 
      SaleHistory, 
      SaleDetail, 
      Beverage]),
      BeverageModule
    ],
  controllers: [SalesController],
  providers: [SalesService],
})
export class SalesModule {}
