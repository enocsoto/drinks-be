import { PartialType } from '@nestjs/mapped-types';
import { CreateBeverageDto } from './create-beverage.dto';

export class UpdateBeverageDto extends PartialType(CreateBeverageDto) {}
