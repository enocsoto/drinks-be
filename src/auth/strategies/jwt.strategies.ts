import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserService } from "../../user/user.service";
import { ConfigService } from "@nestjs/config";
import { User } from "../../user/entities/user.entity";
import { JwtPayload } from "../interfaces/jwt-payload.interface";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UserService,
    configService: ConfigService,
  ) {
    super({
      secretOrKey: configService.get<string>("JWT_SECRET"),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const user = await this.usersService.findUserByCriteria(payload.document);
    if (!user) 
      throw new UnauthorizedException("Token inválido o usuario no encontrado.");
    
    if (!user.isActive) 
      throw new UnauthorizedException("Usuario inactivo.");
    return user;
  }
}
