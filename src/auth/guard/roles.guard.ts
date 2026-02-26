/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- getRequest() returns any in NestJS */
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/roles.decorator";
import { UserRole } from "../../user/enum/user-roles.enum";

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles: UserRole[] = this.reflector.get(ROLES_KEY, context.getHandler());

    if (!requiredRoles || !requiredRoles.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new NotFoundException("Usuario no encontrado.");
    }

    const roles: string[] = Array.isArray(user.role) ? user.role : [user.role].filter(Boolean);

    for (const role of roles) {
      if (requiredRoles.includes(role as UserRole)) return true;
    }

    const userName = user.name ?? "Unknown";
    throw new ForbiddenException(`El usuario ${userName} no tiene permisos para esta acción.`);
  }
}
