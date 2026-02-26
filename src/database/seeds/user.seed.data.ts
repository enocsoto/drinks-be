import { UserRole } from "../../user/enum/user-roles.enum";

export interface UserSeedItem {
  name: string;
  document: number;
  password: string;
  role: UserRole[];
}

/**
 * Usuarios iniciales para popular MongoDB (solo desarrollo/demo).
 * Contraseñas conocidas para entorno local; en producción usar variables de entorno.
 */
export const USER_SEED_DATA: UserSeedItem[] = [
  {
    name: "Admin Billar",
    document: 1234567890,
    password: "Admin123",
    role: [UserRole.ADMIN],
  },
  {
    name: "María Vendedora",
    document: 9876543210,
    password: "Seller123",
    role: [UserRole.SELLER],
  },
  {
    name: "Carlos Mesero",
    document: 1122334455,
    password: "Seller123",
    role: [UserRole.SELLER],
  },
];
