import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, MinLength, IsNotEmpty } from 'class-validator';
export class RegisterDto {
  @ApiProperty({
    required: true,
    description: 'Name of the user.',
    example: 'John Doe',
  })
  @IsString({ message: 'Name must be a string.' })
  @IsNotEmpty({ message: 'Name is required.' })
  @MinLength(3, { message: 'Name must be at least 3 characters long.' })
  name: string;

  @ApiProperty({
    required: true,
    description: "User's document (identification).",
    example: '12345678',
  })
  @IsString({ message: 'Document must be a string.' })
  @IsNotEmpty({ message: 'Document is required.' })
  document: string;

  @ApiProperty({
    required: true,
    description: 'Password of the user.',
    example: 'password',
  })
  @MinLength(6, { message: 'Password must be at least 6 characters long.' })
  @IsString({ message: 'Password must be a string.' })
  @IsNotEmpty({ message: 'Password is required.' })
  password: string;

  @ApiProperty({
    required: true,
    description: 'Unique email of the user.',
    example: 'email@email.com',
  })
  @IsEmail({}, { message: 'The email format is invalid.' })
  @IsNotEmpty({ message: 'Email is required.' })
  email: string;
}
