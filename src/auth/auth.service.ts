import {
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../user/user.service";
import { User } from "../user/entities/user.entity";
import { CreateUserDto } from "../user/dto/create-user.dto";
import { LoginDto, LoginResponse } from "./dto";
import * as bcrypt from "bcryptjs";
import { JwtPayload } from "./interfaces/jwt-payload.interface";

@Injectable()
export class AuthService {
  constructor(
    @Inject(UserService)
    private readonly userRepository: UserService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Validate user credentials and return the user when valid
   */
  async validateUser(document: number, password: string): Promise<User> {
    const user = await this.userRepository.findUserByCriteria(document);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }
    return user;
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const user = await this.validateUser(loginDto.document, loginDto.password);

    const payload: JwtPayload = {
      sub: user.id,
      document: user.document,
      role: user.role,
    };

    const token = await this.generateJwtSecret(payload);

    const { password: _pass, ...safeUser } = user.toJSON() as Record<string, unknown>;
    return {
      ...safeUser,
      access_token: token,
    } as LoginResponse;
  }

  async register(registerDto: CreateUserDto){
    const user = await this.userRepository.createUser(registerDto);
    const payload: JwtPayload = {
      sub: user.id,
      document: user.document,
      role: user.role,
    };
    const token = await this.generateJwtSecret(payload);

    return {
      ...user,
      access_token: token,
    };
  }

  private async generateJwtSecret(payload: JwtPayload) {
    return this.jwtService.signAsync(payload);
  }

  async checkAuthStatus(user: User){
    const payload: JwtPayload = {
        sub: user.id,
        document: user.document,
        role: user.role,
      };

      const token = await this.generateJwtSecret(payload);
      const { password: _pass, ...safeUser } = user.toJSON
        ? user.toJSON()
        : (user as unknown as Record<string, unknown>);
      return {
        ...safeUser,
        access_token: token,
      };
    }
}
