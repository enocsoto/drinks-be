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
import { Get } from '@nestjs/common';

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
    try {
      const user = await this.userRepository.findUserByCriteria(document);

      if (!user || !user.isActive) throw new UnauthorizedException("Invalid credentials");

      const stored = user.password;

      const match = await bcrypt.compare(password, stored);

      if (!match) throw new UnauthorizedException("Invalid credentials");
      return user;
    } catch (error) {
      throw new InternalServerErrorException(`Error validating user credentials: ${error.message}`);
    }
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const user = await this.validateUser(loginDto.document, loginDto.password);

    const payload: JwtPayload = {
      sub: user.id,
      document: user.document,
      role: user.role,
    };

    const token = await this.generateJwtSecret(payload);

    return {
      document: user.document,
      pass: user.password,
      access_token: token,
    };
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
      acces_token: token,
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
      return {
        ...user.dataValues,
        acces_token: token,
      };
    }
}
