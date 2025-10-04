import { SaleDetail } from "../../entities/sale-detail.entity";
import { Sale } from "../../entities/sale.entity";

export class CreateSaleResponseDto {
  sale: Sale;
  detail: SaleDetail;
}