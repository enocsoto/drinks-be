import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateSaleDto {
  @ApiProperty({ example: 1, description: 'ID de la bebida' })
  @IsNumber(
    { allowInfinity: false, allowNaN: false, maxDecimalPlaces: 0 },
    { message: 'El id de la bebida debe ser un número.' },
  )
  @Type(() => Number)
  @IsNotEmpty({ message: 'La bebida es obligatoria.' })
  beverageId: number;

  @ApiProperty({ example: 2, description: 'Cantidad a vender' })
  @IsNumber(
    { allowInfinity: false, allowNaN: false, maxDecimalPlaces: 0 },
    { message: 'La cantidad debe ser un número.' },
  )
  @Type(() => Number)
  @IsNotEmpty({ message: 'La cantidad es obligatoria.' })
  quantity: number;

  @ApiPropertyOptional({
    example: 1234567890,
    description: 'Documento del vendedor (opcional, usa el del usuario autenticado si no se envía)',
  })
  @IsOptional()
  @IsNumber(
    { allowInfinity: false, allowNaN: false, maxDecimalPlaces: 0 },
    { message: 'El documento del vendedor debe ser un número.' },
  )
  @Type(() => Number)
  sellerId?: number;
}
