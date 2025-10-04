import { IsNotEmpty, IsNumber, IsDate, IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class CreateSaleDto {
  @IsNumber(
    {
      allowInfinity: false,
      allowNaN: false,
      maxDecimalPlaces: 0,
    },
    { message: "el id de la bebida debe ser un. numero" },
  )
  @ApiProperty({ example: 1, description: 'ID de la bebida' })
  @IsNotEmpty()
  beverageId: number;
  @IsNumber(
    {
      allowInfinity: false,
      allowNaN: false,
      maxDecimalPlaces: 0,
    },
    { message: "la cantidad debe ser un numero" },
  )
  @ApiProperty({ example: 2, description: 'Cantidad a vender' })
  quantity: number;

  @ApiProperty({ example: 'uuid-vendedor', description: 'ID del vendedor (opcional - se toma del token si no se envía)' })
  @IsString()
  @IsNotEmpty()
  sellerId: string;
}
