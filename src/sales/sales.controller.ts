import { Controller, Get, Post, Body, Patch, Param, Query } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  create(@Body() createSaleDto: CreateSaleDto) {
    return this.salesService.create(createSaleDto);
  }

  @Get()
  findAll(@Query('date') date?: string) {
    return this.salesService.findAll(date);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query('date') date?: string, @Query('sellerId') sellerId?: string) {
    return this.salesService.findOne(+id, date, sellerId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSaleDto: UpdateSaleDto) {
    return this.salesService.update(+id, updateSaleDto);
  }

}
