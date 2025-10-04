import { PartialType } from '@nestjs/mapped-types';
import { CreateBeverageDto } from './create-beverage.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBeverageDto extends PartialType(CreateBeverageDto) {
  @ApiPropertyOptional({ description: 'Estado activo del producto', example: true })
  @IsOptional()
  @IsBoolean({ message: "El estado activo debe ser un booleano." })
  isActive?: boolean;
}
