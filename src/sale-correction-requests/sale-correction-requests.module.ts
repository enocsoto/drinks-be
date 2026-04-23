import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
  SaleCorrectionRequest,
  SaleCorrectionRequestSchema,
} from "./schemas/sale-correction-request.schema";
import { Sale, SaleSchema } from "../sales/schemas/sale.schema";
import { SaleCorrectionRequestsService } from "./sale-correction-requests.service";
import { SaleCorrectionRequestsController } from "./sale-correction-requests.controller";
import { SaleCorrectionRequestsGateway } from "./sale-correction-requests.gateway";
import { AuthModule } from "../auth/auth.module";
import { UserModule } from "../user/user.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SaleCorrectionRequest.name, schema: SaleCorrectionRequestSchema },
      { name: Sale.name, schema: SaleSchema },
    ]),
    AuthModule,
    UserModule,
  ],
  controllers: [SaleCorrectionRequestsController],
  providers: [SaleCorrectionRequestsService, SaleCorrectionRequestsGateway],
  exports: [SaleCorrectionRequestsService],
})
export class SaleCorrectionRequestsModule {}
