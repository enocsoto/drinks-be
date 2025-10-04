import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Custom decorator for assigning required roles to an endpoint.
 * @param roles array of allowed roles (e.g., ['ADMIN', 'SELLER']).
 */
export const Role = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
