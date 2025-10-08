import { PartialType } from "@nestjs/mapped-types";
import { CreateSaleDto } from "./create-sale.dto";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateSaleDto extends PartialType(CreateSaleDto) {
  @ApiProperty({ example: 2, description: "Cantidad a vender", required: false })
  quantity?: number | undefined;

  @ApiProperty({ example: 1234567890, description: "Documento del vendedor", required: false })
  sellerId?: number | undefined;

  @ApiProperty({
    example: "123e4567-e89b-12d3-a456-426614174000",
    description: "ID del usuario que actualiza",
    required: false,
  })
  updatedByUserId?: string;

  @ApiProperty({ example: 1, description: "ID de la bebida", required: false })
  beverageId?: number | undefined;
}
