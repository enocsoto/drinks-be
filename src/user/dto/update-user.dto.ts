import { PartialType } from "@nestjs/mapped-types";
import { CreateUserDto } from "./create-user.dto";
import { IsBoolean, IsOptional } from "class-validator";
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({ description: 'Flag to activate/deactivate user' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
