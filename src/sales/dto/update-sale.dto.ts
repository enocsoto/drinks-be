import { PartialType } from "@nestjs/mapped-types";
import { CreateSaleDto } from "./create-sale.dto";
import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateSaleDto extends PartialType(CreateSaleDto) {
  @ApiProperty({ example: 2, description: "Cantidad a vender", required: false })
  quantity?: number | undefined;

  @ApiProperty({ example: 1234567890, description: "Documento del vendedor", required: false })
  sellerId?: number | undefined;

  @ApiProperty({
    example: "Detalle actualizado de la venta",
    description: "Motivo de la actualización (auditoría)",
    required: false,
  })
  @IsOptional()
  @IsString()
  changeDescription?: string;

  @ApiProperty({
    example: "507f1f77bcf86cd799439011",
    description: "ID de la bebida (MongoDB ObjectId)",
    required: false,
  })
  beverageId?: string | undefined;
}
