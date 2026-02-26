import { IsNumber, IsOptional, IsMongoId, IsEnum, IsString, Min, Max } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { SaleDetailType } from "../enum/sale-detail-type.enum";

export class CreateSaleDto {
  @ApiProperty({ example: 1, description: "Número de mesa (1 a 6)" })
  @IsNumber()
  @Min(1, { message: "La mesa debe ser entre 1 y 6." })
  @Max(6, { message: "La mesa debe ser entre 1 y 6." })
  @Type(() => Number)
  tableNumber: number;

  @ApiProperty({
    example: "BEVERAGE",
    description:
      "Tipo de venta: BEVERAGE (bebida), GLOVES (guantes), GAME (juego chicos/buchacara)",
    enum: SaleDetailType,
  })
  @IsEnum(SaleDetailType, {
    message: `El tipo debe ser: ${Object.values(SaleDetailType).join(", ")}`,
  })
  lineType: SaleDetailType;

  @ApiPropertyOptional({
    example: "507f1f77bcf86cd799439011",
    description: "ID de la bebida (obligatorio cuando lineType es BEVERAGE)",
  })
  @IsOptional()
  @IsMongoId({ message: "El id de la bebida debe ser un ObjectId válido." })
  beverageId?: string;

  @ApiProperty({ example: 2, description: "Cantidad" })
  @IsNumber(
    { allowInfinity: false, allowNaN: false, maxDecimalPlaces: 0 },
    { message: "La cantidad debe ser un número entero." },
  )
  @Min(1, { message: "La cantidad debe ser al menos 1." })
  @Type(() => Number)
  quantity: number;

  @ApiPropertyOptional({
    example: 1500,
    description: "Precio unitario en COP (obligatorio cuando lineType es GLOVES o GAME)",
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  unitPrice?: number;

  @ApiPropertyOptional({
    example: "Guantes mesa 2",
    description: "Descripción opcional para guantes o juego",
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 1234567890,
    description: "Documento del vendedor (opcional, usa el del usuario autenticado)",
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  sellerId?: number;
}
