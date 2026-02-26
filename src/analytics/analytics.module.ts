import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AnalyticsController } from "./analytics.controller";
import { AnalyticsService } from "./analytics.service";
import { Sale, SaleSchema } from "../sales/schemas/sale.schema";
import { SaleDetail, SaleDetailSchema } from "../sales/schemas/sale-detail.schema";
import { Beverage, BeverageSchema } from "../beverage/schemas/beverage.schema";
import { User, UserSchema } from "../user/schemas/user.schema";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Sale.name, schema: SaleSchema },
      { name: SaleDetail.name, schema: SaleDetailSchema },
      { name: Beverage.name, schema: BeverageSchema },
      { name: User.name, schema: UserSchema },
    ]),
    AuthModule,
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
