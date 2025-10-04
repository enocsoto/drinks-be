import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { BeverageService } from './beverage.service';
import { CreateBeverageDto } from './dto/create-beverage.dto';

@Controller('beverage')
export class BeverageController {
  constructor(private readonly beverageService: BeverageService) {}

  @Post()
  create(@Body() createBeverageDto: CreateBeverageDto) {
    return this.beverageService.create(createBeverageDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.beverageService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.beverageService.remove(+id);
  }
}
