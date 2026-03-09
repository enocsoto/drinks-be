import { PartialType } from "@nestjs/mapped-types";
import { CreatePendingPaymentDto } from "./create-pending-payment.dto";

export class UpdatePendingPaymentDto extends PartialType(CreatePendingPaymentDto) {}
