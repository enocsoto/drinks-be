import { IsNumber, IsOptional, Min } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class ReceiveInventoryDto {
  @ApiProperty({ example: 38, description: "Cantidad de unidades a añadir al inventario" })
  @IsNumber()
  @Min(1, { message: "La cantidad debe ser al menos 1." })
  @Type(() => Number)
  quantity: number;

  @ApiPropertyOptional({
    example: 68000,
    description:
      "Costo total del lote en COP. Si se proporciona, se calcula costPrice = round(costTotal/quantity). Ej: canasta 68.000 con 38 unidades → 1.800 COP/unidad",
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  costTotal?: number;
}
