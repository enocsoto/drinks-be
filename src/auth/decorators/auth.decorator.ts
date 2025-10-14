import { applyDecorators, UseGuards } from "@nestjs/common";
import { UserRole } from "../../user/enum/User-roles.enum";
import { AuthGuard } from "@nestjs/passport";
import { RoleProtected } from "./roles.decorator";
import { UserRoleGuard } from "../guard";

export function Auth(...roles: UserRole[]) {
  return applyDecorators(RoleProtected(...roles), UseGuards(AuthGuard(), UserRoleGuard));
}
