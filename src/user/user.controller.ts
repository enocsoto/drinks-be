import { Controller, Get, Body, Patch, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Auth } from '../auth/decorators';
import { UserRole } from '../user/enum/user-roles.enum';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  @ApiBearerAuth()
  @Auth(UserRole.SELLER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Obtener usuario por id' })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Auth(UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar usuario por id' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }
}
