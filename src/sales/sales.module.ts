import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { SalesController } from "./sales.controller";
import { SalesService } from "./sales.service";
import { Sale, SaleSchema } from "./schemas/sale.schema";
import { SaleDetail, SaleDetailSchema } from "./schemas/sale-detail.schema";
import { SaleHistory, SaleHistorySchema } from "./schemas/sale-history.schema";
import { User, UserSchema } from "../user/schemas/user.schema";
import { BeverageModule } from "../beverage/beverage.module";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Sale.name, schema: SaleSchema },
      { name: SaleDetail.name, schema: SaleDetailSchema },
      { name: SaleHistory.name, schema: SaleHistorySchema },
      { name: User.name, schema: UserSchema },
    ]),
    BeverageModule,
    AuthModule,
  ],
  controllers: [SalesController],
  providers: [SalesService],
  exports: [SalesService, MongooseModule],
})
export class SalesModule {}
