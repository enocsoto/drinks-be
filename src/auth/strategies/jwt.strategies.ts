import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../../user/user.service';
import { ConfigService } from '@nestjs/config';
import { User } from '../../user/entities/user.entity';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(JwtStrategy.name);
  constructor(
    private readonly usersService: UserService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    this.logger.debug(`Validating JWT payload: ${JSON.stringify(payload)}`);
    const user = await this.usersService.findUser(payload.sub);
    this.logger.debug(`User lookup for sub=${payload.sub}: ${user ? 'FOUND' : 'NOT FOUND'}`);

    if (!user) {
      this.logger.warn(`JWT validation failed: user not found (sub=${payload.sub})`);
      throw new UnauthorizedException('Token inválido o usuario no encontrado.');
    }

    return user;
  }
}
