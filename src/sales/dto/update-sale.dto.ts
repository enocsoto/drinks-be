import { PartialType } from '@nestjs/mapped-types';
import { CreateSaleDto } from './create-sale.dto';

export class UpdateSaleDto extends PartialType(CreateSaleDto) {
  // Opcional: quien realiza la actualización (para registrar en el historial)
  updatedByUserId?: string;
}
