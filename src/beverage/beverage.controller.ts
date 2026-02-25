import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { BeverageService } from './beverage.service';
import { CreateBeverageDto } from './dto/create-beverage.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Auth } from '../auth/decorators';
import { UserRole } from '../user/enum/user-roles.enum';

@ApiTags('Beverage')
@Controller('beverage')
export class BeverageController {
  constructor(private readonly beverageService: BeverageService) {}

  @Post()
  @ApiBearerAuth()
  @Auth(UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear una bebida' })
  @ApiResponse({ status: 201, description: 'Bebida creada' })
  create(@Body() createBeverageDto: CreateBeverageDto) {
    return this.beverageService.create(createBeverageDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener bebida por id' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.beverageService.findOne(id);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Auth(UserRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar bebida (soft delete)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.beverageService.remove(id);
  }
}
