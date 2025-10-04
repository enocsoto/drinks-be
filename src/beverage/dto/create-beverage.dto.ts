import { Type } from "class-transformer";
import { IsString, IsNotEmpty, IsNumber, IsPositive, IsEnum, IsInt, Min } from "class-validator";
import { DrinkType } from "../enum/drink-type.enum";

export class CreateBeverageDto {
  @IsString({ message: "El nombre debe ser un texto." })
  @IsNotEmpty({ message: "El nombre del producto es obligatorio." })
  name: string;

  @IsNumber({}, { message: "El precio debe ser un número." })
  @IsPositive({ message: "El precio debe ser un valor positivo." })
  @Type(() => Number) 
  @IsNotEmpty({ message: "El precio del producto es obligatorio." })
  price: number;

  @IsEnum(DrinkType, {
    message: `El tipo de producto debe ser: ${Object.values(DrinkType).join(", ")}`,
  })
  @IsNotEmpty({ message: "El tipo de producto es obligatorio." })
  type: DrinkType;
}
