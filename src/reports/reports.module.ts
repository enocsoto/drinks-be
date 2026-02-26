import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Sale, SaleSchema } from "../sales/schemas/sale.schema";
import { SaleDetail, SaleDetailSchema } from "../sales/schemas/sale-detail.schema";
import { AuthModule } from "../auth/auth.module";
import { DailyClosingService } from "./daily-closing.service";
import { ReportDocumentService } from "./report-document.service";
import { ReportsController } from "./reports.controller";
import { PdfDocumentStrategy } from "./strategies/pdf-document.strategy";
import { DOCUMENT_STRATEGY_TOKEN } from "./strategies/document-generator.interface";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Sale.name, schema: SaleSchema },
      { name: SaleDetail.name, schema: SaleDetailSchema },
    ]),
    AuthModule,
  ],
  controllers: [ReportsController],
  providers: [
    DailyClosingService,
    ReportDocumentService,
    PdfDocumentStrategy,
    {
      provide: DOCUMENT_STRATEGY_TOKEN,
      useExisting: PdfDocumentStrategy,
    },
  ],
  exports: [DailyClosingService],
})
export class ReportsModule {}
