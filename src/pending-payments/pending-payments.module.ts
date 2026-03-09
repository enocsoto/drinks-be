import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { PendingPayment, PendingPaymentSchema } from "./schemas/pending-payment.schema";
import { PendingPaymentsService } from "./pending-payments.service";
import { PendingPaymentsController } from "./pending-payments.controller";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: PendingPayment.name, schema: PendingPaymentSchema }]),
    AuthModule,
  ],
  controllers: [PendingPaymentsController],
  providers: [PendingPaymentsService],
  exports: [PendingPaymentsService],
})
export class PendingPaymentsModule {}
