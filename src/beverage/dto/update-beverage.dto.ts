import { PartialType } from "@nestjs/mapped-types";
import { CreateBeverageDto } from "./create-beverage.dto";
import { IsBoolean, IsNumber, IsOptional } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class UpdateBeverageDto extends PartialType(CreateBeverageDto) {
  @ApiPropertyOptional({ description: "Estado activo del producto", example: true })
  @IsOptional()
  @IsBoolean({ message: "El estado activo debe ser un booleano." })
  isActive?: boolean;

  @ApiPropertyOptional({ description: "Cantidad en inventario", example: 50 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  stock?: number;

  @ApiPropertyOptional({
    description: "Precio de coste unitario en COP (para margen de ganancia)",
    example: 1800,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  costPrice?: number;
}
