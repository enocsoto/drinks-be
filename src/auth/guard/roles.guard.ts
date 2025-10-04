import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const { user } = request || {};

    // Normalize role reading to handle plain objects and Sequelize Model instances
    let userRole: string | undefined = undefined;
    if (!user) return false;

    // direct property
    if (user.role) userRole = user.role;

    // Sequelize instances often keep raw values on dataValues
    if (!userRole && (user as any).dataValues && (user as any).dataValues.role)
      userRole = (user as any).dataValues.role;

    // Sequelize getter
    if (!userRole && typeof (user as any).get === 'function')
      userRole = (user as any).get('role');

    if (!userRole) return false;

    return requiredRoles.includes(userRole as string);
  }
}
