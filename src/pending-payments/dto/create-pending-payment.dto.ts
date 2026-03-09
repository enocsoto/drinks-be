import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
  IsArray,
  IsEnum,
  IsBoolean,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { DrinkType } from "../../beverage/enum/drink-type.enum";

export class CreatePendingPaymentDto {
  @ApiProperty({ example: "Juan Pérez", description: "Nombre de la persona" })
  @IsString({ message: "El nombre debe ser un texto." })
  @IsNotEmpty({ message: "El nombre es obligatorio." })
  personName: string;

  @ApiPropertyOptional({ example: "Juancho", description: "Apodo de la persona" })
  @IsOptional()
  @IsString()
  nickname?: string;

  @ApiProperty({
    example: "2025-03-02",
    description: "Fecha en que queda debiendo (YYYY-MM-DD)",
  })
  @IsString()
  @IsNotEmpty({ message: "La fecha de la deuda es obligatoria." })
  debtDate: string;

  @ApiProperty({ example: 15000, description: "Monto adeudado en COP" })
  @IsNumber({}, { message: "La cantidad debe ser un número." })
  @Min(0, { message: "La cantidad no puede ser negativa." })
  @Type(() => Number)
  @IsNotEmpty({ message: "La cantidad es obligatoria." })
  amount: number;

  @ApiPropertyOptional({
    description: "Tipos de bebida (pueden ser varios)",
    enum: DrinkType,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(DrinkType, { each: true, message: "Cada tipo debe ser un DrinkType válido." })
  drinkTypes?: DrinkType[];

  @ApiPropertyOptional({ description: "Incluye guantes pendientes", default: false })
  @IsOptional()
  @IsBoolean({ message: "hasGloves debe ser true o false." })
  @Type(() => Boolean)
  hasGloves?: boolean;

  @ApiPropertyOptional({ description: "Incluye juegos pendientes", default: false })
  @IsOptional()
  @IsBoolean({ message: "hasPendingGames debe ser true o false." })
  @Type(() => Boolean)
  hasPendingGames?: boolean;

  @ApiPropertyOptional({ description: "Descripción o notas adicionales" })
  @IsOptional()
  @IsString()
  description?: string;
}
