import { UserRole } from "../../user/enum/user-roles.enum";

/** Primer rol cuando el esquema permite array o valor único (Mongo / JWT). */
export function getPrimaryUserRole(
  role: UserRole | UserRole[] | undefined | null,
): UserRole | undefined {
  if (role == null) return undefined;
  return Array.isArray(role) ? role[0] : role;
}

export function isAdminUser(user: { role?: UserRole | UserRole[] } | null | undefined): boolean {
  return getPrimaryUserRole(user?.role) === UserRole.ADMIN;
}
