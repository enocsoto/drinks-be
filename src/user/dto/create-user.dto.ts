import { IsNumber, IsString, Matches, Min, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'Juan Perez' })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({ example: 'secret123' })
  @IsString()
  @MinLength(6)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{4,}$/, {
    message:
      'Password must contain at least one letter and one number, and can include special characters @$!%*#?&',
  })
  password: string;

  @IsNumber()
  @Min(10)
  @ApiProperty({ example: 1234567890})
  document: number;

}
