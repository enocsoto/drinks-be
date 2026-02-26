import { Controller, Get, Post, Body, Patch, Param, Query } from "@nestjs/common";
import { UserService } from "./user.service";
import { UpdateUserDto } from "./dto/update-user.dto";
import { CreateUserByAdminDto } from "./dto/create-user-by-admin.dto";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { Auth } from "../auth/decorators";
import { UserRole } from "../user/enum/user-roles.enum";

@ApiTags("User")
@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiBearerAuth()
  @Auth(UserRole.ADMIN)
  @ApiOperation({ summary: "Listar usuarios (solo administradores)" })
  @ApiQuery({
    name: "includeInactive",
    required: false,
    description: "Incluir usuarios desactivados",
  })
  findAll(@Query("includeInactive") includeInactive?: string) {
    const include = includeInactive === "true" || includeInactive === "1";
    return this.userService.findAll(include);
  }

  @Post()
  @ApiBearerAuth()
  @Auth(UserRole.ADMIN)
  @ApiOperation({ summary: "Crear usuario (solo administradores)" })
  create(@Body() createUserByAdminDto: CreateUserByAdminDto) {
    return this.userService.createUserByAdmin(createUserByAdminDto);
  }

  @Get(":id")
  @ApiBearerAuth()
  @Auth(UserRole.SELLER, UserRole.ADMIN)
  @ApiOperation({ summary: "Obtener usuario por id" })
  findOne(@Param("id") id: string) {
    return this.userService.findOne(id);
  }

  @Patch(":id")
  @ApiBearerAuth()
  @Auth(UserRole.ADMIN)
  @ApiOperation({ summary: "Actualizar usuario por id (incluye desactivar)" })
  update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }
}
