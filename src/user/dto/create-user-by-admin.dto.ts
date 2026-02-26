import { IsEnum, IsOptional } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { CreateUserDto } from "./create-user.dto";
import { UserRole } from "../enum/user-roles.enum";

/**
 * DTO para que un administrador cree usuarios (incluye rol).
 * Extiende CreateUserDto con role opcional (default SELLER).
 */
export class CreateUserByAdminDto extends CreateUserDto {
  @ApiPropertyOptional({ enum: UserRole, default: UserRole.SELLER })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
