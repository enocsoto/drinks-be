import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, MinLength, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    required: true,
    description: 'Email of the user to login.',
    example: 'email@email.com',
  })
  @IsEmail({}, { message: 'The email format is invalid.' })
  @IsNotEmpty({ message: 'Email is required.' })
  email: string;

  @ApiProperty({
    required: true,
    description: 'Password of the user to login.',
    example: 'password',
  })
  @MinLength(6, { message: 'Password must be at least 6 characters long.' })
  @IsString({ message: 'Password must be a string.' })
  @IsNotEmpty({ message: 'Password is required.' })
  password: string;
}
