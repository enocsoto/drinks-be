import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    required: true,
    description: "User's document (identification) to login.",
    example: '12345678',
  })
  @IsString({ message: 'Document must be a string.' })
  @IsNotEmpty({ message: 'Document is required.' })
  document: string;

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
