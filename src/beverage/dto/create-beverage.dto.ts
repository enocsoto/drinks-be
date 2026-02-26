import { Type } from "class-transformer";
import { IsString, IsNotEmpty, IsNumber, IsPositive, IsEnum, IsOptional } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { DrinkType } from "../enum/drink-type.enum";
import { ContainerType } from "../enum/container-type.enum";

export class CreateBeverageDto {
  @ApiProperty({ example: "Aguila Negra", description: "Nombre del producto" })
  @IsString({ message: "El nombre debe ser un texto." })
  @IsNotEmpty({ message: "El nombre del producto es obligatorio." })
  name: string;

  @ApiProperty({ example: 3500, description: "Precio en COP" })
  @IsNumber({}, { message: "El precio debe ser un número." })
  @IsPositive({ message: "El precio debe ser un valor positivo." })
  @Type(() => Number)
  @IsNotEmpty({ message: "El precio del producto es obligatorio." })
  price: number;

  @ApiProperty({ description: "Tipo de bebida", enum: DrinkType })
  @IsEnum(DrinkType, {
    message: `El tipo de producto debe ser: ${Object.values(DrinkType).join(", ")}`,
  })
  @IsNotEmpty({ message: "El tipo de producto es obligatorio." })
  type: DrinkType;

  @ApiProperty({ description: "Tipo de envase", enum: ContainerType })
  @IsEnum(ContainerType, {
    message: `El envase debe ser: ${Object.values(ContainerType).join(", ")}`,
  })
  @IsNotEmpty({ message: "El tipo de envase es obligatorio." })
  containerType: ContainerType;

  @ApiPropertyOptional({ example: "350 ml", description: "Talla/descripción del envase" })
  @IsOptional()
  @IsString()
  containerSize?: string;

  @ApiPropertyOptional({
    example: "/beverages/agua-cristal.png",
    description: "Ruta de la imagen del producto",
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}
