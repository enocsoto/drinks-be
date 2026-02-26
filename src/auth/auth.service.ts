import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../user/user.service";
import { UserDocument } from "../user/schemas/user.schema";
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
  async validateUser(document: number, password: string): Promise<UserDocument> {
    const user = await this.userRepository.findUserByCriteria(document);

    if (!user || !user.isActive) {
      throw new UnauthorizedException("Credenciales inválidas.");
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new UnauthorizedException("Credenciales inválidas.");
    }
    return user;
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const user = await this.validateUser(loginDto.document, loginDto.password);

    const payload: JwtPayload = {
      sub: String(user.id ?? (user as { _id?: unknown })._id),
      document: Number(user.document),
      role: Array.isArray(user.role) ? user.role : [user.role],
    };

    const token = await this.generateJwtSecret(payload);

    const json = user.toJSON() as Record<string, unknown>;
    const safeUser = { ...json };
    delete safeUser.password;
    return {
      ...safeUser,
      access_token: token,
    } as LoginResponse;
  }

  async register(registerDto: CreateUserDto): Promise<Record<string, unknown>> {
    const user = (await this.userRepository.createUser(registerDto)) as {
      id: string;
      document: number;
      role: string[];
    };
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

  async checkAuthStatus(user: UserDocument) {
    const payload: JwtPayload = {
      sub: String(
        (user as { id?: string; _id?: { toString: () => string } }).id ?? user._id?.toString(),
      ),
      document: Number(user.document),
      role: Array.isArray(user.role) ? user.role : [user.role],
    };

    const token = await this.generateJwtSecret(payload);

    const json = user.toJSON() as Record<string, unknown>;
    const safeUser = { ...json };
    delete safeUser.password;
    return {
      ...safeUser,
      access_token: token,
    };
  }
}
