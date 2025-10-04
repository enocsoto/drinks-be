import { IsString, IsNotEmpty } from 'class-validator';

export class CreateWaiterDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}