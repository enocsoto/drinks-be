import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { BeverageService } from './beverage.service';
import { CreateBeverageDto } from './dto/create-beverage.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Beverage')

@Controller('beverage')
export class BeverageController {
  constructor(private readonly beverageService: BeverageService) {}

  @Post()
  @ApiOperation({ summary: 'Create a beverage' })
  @ApiResponse({ status: 201, description: 'Beverage created' })
  create(@Body() createBeverageDto: CreateBeverageDto) {
    return this.beverageService.create(createBeverageDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get beverage by id' })
  findOne(@Param('id') id: string) {
    return this.beverageService.findOne(+id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete beverage by id' })
  remove(@Param('id') id: string) {
    return this.beverageService.remove(+id);
  }
}
