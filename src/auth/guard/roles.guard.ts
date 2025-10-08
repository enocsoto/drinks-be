import { CanActivate, ExecutionContext, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from "../../user/enum/User-roles.enum";

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles: UserRole[] = this.reflector.get(ROLES_KEY, context.getHandler());

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) throw new NotFoundException(`User not found`);

    const roles: string[] = Array.isArray(user.role) ? user.role : [user.role];

    for (const role of roles) {
      if (requiredRoles.includes(role as UserRole)) return true;
    }

    throw new ForbiddenException(`User ${user.name} needs to be an Admin`);
  }
}
