import { PartialType } from '@nestjs/mapped-types';
import { CreateBeverageDto } from './create-beverage.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateBeverageDto extends PartialType(CreateBeverageDto) {
  @IsOptional()
  @IsBoolean({ message: "El estado activo debe ser un booleano." })
  isActive?: boolean;
}
