import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { JwtAuthGuard } from '../auth/guard/auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Role } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/enum/User-roles.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';


@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(UserRole.SELLER, UserRole.ADMIN)
  create(@Body() createSaleDto: CreateSaleDto, @CurrentUser() user: any) {
    // if sellerId not provided, use authenticated user id
    if (!createSaleDto.sellerId) createSaleDto.sellerId = user?.id;
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateSaleDto: UpdateSaleDto) {
    return this.salesService.update(+id, updateSaleDto);
  }

}
