import { Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { WebSocketGateway, WebSocketServer, OnGatewayConnection } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { UserService } from "../user/user.service";
import { UserRole } from "../user/enum/user-roles.enum";
import type { JwtPayload } from "../auth/interfaces/jwt-payload.interface";

function parseSocketCorsOrigins(): string | string[] {
  const raw = process.env.CORS_ORIGINS ?? "http://localhost:3000";
  const list = raw
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
  return list.length === 1 ? list[0] : list;
}

/**
 * Tiempo real cuando cambian solicitudes de corrección (crear, resolver, rechazar).
 * Acepta ADMIN (listado + badge) y SELLER (estado "Atendida" / solicitud en la tabla del día).
 */
@WebSocketGateway({
  namespace: "/sale-corrections",
  cors: {
    origin: parseSocketCorsOrigins(),
    credentials: true,
  },
})
export class SaleCorrectionRequestsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(SaleCorrectionRequestsGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    const token = this.extractToken(client);
    if (!token) {
      this.logger.debug("sale-corrections WS: sin token");
      client.disconnect(true);
      return;
    }

    try {
      const secret = this.configService.get<string>("JWT_SECRET");
      if (!secret) {
        client.disconnect(true);
        return;
      }

      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, { secret });
      const user = await this.userService.findUserByCriteria(payload.document);
      if (!user?.isActive) {
        client.disconnect(true);
        return;
      }

      const role = Array.isArray(user.role) ? user.role[0] : user.role;
      if (role !== UserRole.ADMIN && role !== UserRole.SELLER) {
        this.logger.debug("sale-corrections WS: rol no permitido");
        client.disconnect(true);
      }
    } catch {
      client.disconnect(true);
    }
  }

  private extractToken(client: Socket): string | null {
    const auth = client.handshake.auth as { token?: unknown } | undefined;
    if (auth && typeof auth.token === "string" && auth.token.trim()) {
      return auth.token.trim();
    }

    const raw = client.handshake.headers.authorization;
    if (typeof raw === "string" && raw.startsWith("Bearer ")) {
      return raw.slice(7).trim();
    }
    return null;
  }

  /** Emite a todos los administradores conectados para que refresquen el listado. */
  emitCorrectionRefresh(): void {
    this.server.emit("corrections:refresh", { ts: Date.now() });
  }
}
