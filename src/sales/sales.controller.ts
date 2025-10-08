import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { UserRole } from '../user/enum/User-roles.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiOperation, ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RoleProtected } from '../auth/decorators/roles.decorator';
import { AuthGuard } from '@nestjs/passport';
import { UserRoleGuard } from '../auth/guard';

@ApiTags("Sales")
@Controller("sales")
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @ApiBearerAuth("Authorization")
  @RoleProtected(UserRole.SELLER, UserRole.ADMIN)
  @UseGuards(AuthGuard(), UserRoleGuard)
  @ApiOperation({ summary: "Create a new sale" })
  @ApiResponse({ status: 201, description: "Sale created" })
  create(@Body() createSaleDto: CreateSaleDto, @CurrentUser() user: any) {
    return this.salesService.create(createSaleDto, user);
  }

  @Get()
  @ApiBearerAuth("Authorization")
  @RoleProtected(UserRole.SELLER, UserRole.ADMIN)
  @UseGuards(AuthGuard(), UserRoleGuard)
  @ApiOperation({ summary: "List sales (optional date filter)" })
  findAll(@Query("date") date?: string) {
    return this.salesService.findAll(date);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get sale by id or by date/seller filter" })
  findOne(
    @Param("id") id: string,
    @Query("date") date?: string,
    @Query("sellerId") sellerId?: string,
  ) {
    return this.salesService.findOne(+id, date, sellerId);
  }

  @Patch(":id")
  @RoleProtected(UserRole.ADMIN)
  @UseGuards(AuthGuard(), UserRoleGuard)
  @ApiOperation({ summary: "Update a sale (admin only)" })
  @ApiResponse({ status: 200, description: "Sale updated" })
  update(@Param("id") id: string, @Body() updateSaleDto: UpdateSaleDto) {
    return this.salesService.update(+id, updateSaleDto);
  }
}
