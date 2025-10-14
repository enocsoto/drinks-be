import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../user/enum/user-roles.enum';

export const ROLES_KEY = 'roles';

/**
 * Custom decorator for assigning required roles to an endpoint.
 * @param roles array of allowed roles (e.g., ['ADMIN', 'SELLER']).
 */
export const RoleProtected = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
