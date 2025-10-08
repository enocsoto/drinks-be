import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, IsNotEmpty, IsNumber } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    required: true,
    description: "User's document (identification) to login.",
    example: 1234567890,
  })
  @IsNumber({}, { message: 'Document must be a number.' })
  @IsNotEmpty({ message: 'Document is required.' })
  document: number;

  @ApiProperty({
    required: true,
    description: 'Password of the user to login.',
    example: 'secret123',
  })
  @MinLength(6, { message: 'Password must be at least 6 characters long.' })
  @IsString({ message: 'Password must be a string.' })
  @IsNotEmpty({ message: 'Password is required.' })
  password: string;
}
