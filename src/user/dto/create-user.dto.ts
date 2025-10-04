import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, {message: 'Invalid emaail format'})
  email: string;

  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  @MinLength(4)
  password: string;

}
