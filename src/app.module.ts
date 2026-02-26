import { Module } from "@nestjs/common";
import { DatabaseModule } from "./database/database.module";
import { ConfigModule } from "@nestjs/config";
import { UserApiModule } from "./user/user-api.module";
import { BeverageModule } from "./beverage/beverage.module";
import { SalesModule } from "./sales/sales.module";
import { AuthModule } from "./auth/auth.module";
import { AnalyticsModule } from "./analytics/analytics.module";
import { ReportsModule } from "./reports/reports.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ".env" }),
    DatabaseModule,
    UserApiModule,
    BeverageModule,
    SalesModule,
    AuthModule,
    AnalyticsModule,
    ReportsModule,
  ],
})
export class AppModule {}
