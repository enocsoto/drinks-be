import { IsNotEmpty, IsNumber, IsDate, IsString } from "class-validator";

export class CreateSaleDto {
  @IsNumber(
    {
      allowInfinity: false,
      allowNaN: false,
      maxDecimalPlaces: 0,
    },
    { message: "el id de la bebida debe ser un. numero" },
  )
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
  quantity: number;

  @IsString()
  @IsNotEmpty()
  sellerId: string;
}
