import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
  SaleCorrectionRequest,
  SaleCorrectionRequestSchema,
} from "./schemas/sale-correction-request.schema";
import { Sale, SaleSchema } from "../sales/schemas/sale.schema";
import { SaleCorrectionRequestsService } from "./sale-correction-requests.service";
import { SaleCorrectionRequestsController } from "./sale-correction-requests.controller";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SaleCorrectionRequest.name, schema: SaleCorrectionRequestSchema },
      { name: Sale.name, schema: SaleSchema },
    ]),
    AuthModule,
  ],
  controllers: [SaleCorrectionRequestsController],
  providers: [SaleCorrectionRequestsService],
  exports: [SaleCorrectionRequestsService],
})
export class SaleCorrectionRequestsModule {}
