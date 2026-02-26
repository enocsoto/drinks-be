/* eslint-disable @typescript-eslint/no-unsafe-call -- passport-jwt StrategyOptions and super() typings */
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-jwt";
import type { StrategyOptions } from "passport-jwt";
import { UserService } from "../../user/user.service";
import { ConfigService } from "@nestjs/config";
import { UserDocument } from "../../user/schemas/user.schema";
import { JwtPayload } from "../interfaces/jwt-payload.interface";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UserService,
    configService: ConfigService,
  ) {
    const opts: StrategyOptions = {
      secretOrKey: configService.get<string>("JWT_SECRET"),
      jwtFromRequest: (req: { headers?: { authorization?: string } }) => {
        const auth = req?.headers?.authorization;
        if (typeof auth === "string" && auth.startsWith("Bearer ")) return auth.slice(7);
        return null;
      },
    };
    super(opts);
  }

  async validate(payload: JwtPayload): Promise<UserDocument> {
    const user = await this.usersService.findUserByCriteria(payload.document);
    if (!user) throw new UnauthorizedException("Token inválido o usuario no encontrado.");

    if (!user.isActive) throw new UnauthorizedException("Usuario inactivo.");
    return user;
  }
}
