import { IsMongoId, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateSaleCorrectionRequestDto {
  @IsMongoId()
  saleId: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  reason?: string;
}
