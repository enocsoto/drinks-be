import { Controller, Post, Body, HttpStatus, HttpCode, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { User } from '../user/entities/user.entity';
import { UserRole } from '../user/enum/user-roles.enum';
import { Auth, CurrentUser } from "./decorators";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 201, description: "User successfully created." })
  @ApiResponse({ status: 400, description: "Validation or duplicate error." })
  async register(@Body() registerDto: CreateUserDto) {
    return this.authService.register(registerDto);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: "User successfully logged in." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get("test")
  @Auth(UserRole.SELLER, UserRole.ADMIN)
  testingPrivateRoute(@CurrentUser() user: User) {
    return {
      message: "testing private route",
      user,
    };
  }
  @Get("test2")
  @Auth(UserRole.ADMIN)
  testingPrivateRoute2(@CurrentUser() user: User) {
    return {
      message: "testing private route",
      user,
    };
  }

  @Get("check-status")
  @Auth()
  checkAuthStatus(@CurrentUser() user: User) {
    return this.authService.checkAuthStatus(user);
  }
}
