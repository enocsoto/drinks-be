import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { JwtAuthGuard } from '../auth/guard/auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Role } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/enum/User-roles.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('Sales')


@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(UserRole.SELLER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new sale' })
  @ApiResponse({ status: 201, description: 'Sale created' })
  create(@Body() createSaleDto: CreateSaleDto, @CurrentUser() user: any) {
    // if sellerId not provided, use authenticated user id
    if (!createSaleDto.sellerId) createSaleDto.sellerId = user?.id;
    return this.salesService.create(createSaleDto);
  }

  @Get()
  @ApiOperation({ summary: 'List sales (optional date filter)' })
  findAll(@Query('date') date?: string) {
    return this.salesService.findAll(date);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sale by id or by date/seller filter' })
  findOne(@Param('id') id: string, @Query('date') date?: string, @Query('sellerId') sellerId?: string) {
    return this.salesService.findOne(+id, date, sellerId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a sale (admin only)' })
  @ApiResponse({ status: 200, description: 'Sale updated' })
  update(@Param('id') id: string, @Body() updateSaleDto: UpdateSaleDto) {
    return this.salesService.update(+id, updateSaleDto);
  }

}
