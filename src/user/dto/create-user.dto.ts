import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'email@example.com' })
  @IsEmail({}, {message: 'Invalid emaail format'})
  email: string;

  @ApiProperty({ example: 'Juan Perez' })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({ example: 'secret123' })
  @IsString()
  @MinLength(4)
  password: string;

}
