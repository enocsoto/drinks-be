import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { LoginDto, RegisterDto } from './dto';
import { LoginResponse } from './dto/response/login.respose.dto';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const isMatch = await this.userService.validateUserCredentials(
      email,
      password,
    );

    if (!isMatch) throw new UnauthorizedException('Credenciales inválidas.');

    return isMatch;
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(registerDto: RegisterDto): Promise<User> {
    const user = await this.userService.createUser(registerDto);
    return user;
  }
}
