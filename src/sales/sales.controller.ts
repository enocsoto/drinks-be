import { Controller, Get, Post, Body, Patch, Param, Query } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { UserRole } from '../user/enum/user-roles.enum';
import { ApiOperation, ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Auth, CurrentUser } from "../auth/decorators";
import { User } from '../user/entities/user.entity';

@ApiTags("Sales")
@Controller("sales")
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a new sale" })
  @ApiResponse({ status: 201, description: "Sale created" })
  @Auth(UserRole.SELLER, UserRole.ADMIN)
  create(@Body() createSaleDto: CreateSaleDto, @CurrentUser() user: User) {
    return this.salesService.create(createSaleDto, user);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: "List sales (optional date filter)" })
  @Auth(UserRole.SELLER, UserRole.ADMIN)
  findAll(@Query("date") date?: string) {
    return this.salesService.findAll(date);
  }

  @Get(":sellerId")
  @ApiOperation({ summary: "Get sale by id or by date/seller filter" })
  @Auth(UserRole.SELLER, UserRole.ADMIN)
  findOne(@Param("sellerId") sellerId: string, @Query("date") date?: string) {
    return this.salesService.findOne(+sellerId, date);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a sale (admin only)" })
  @ApiResponse({ status: 200, description: "Sale updated" })
  @Auth(UserRole.ADMIN)
  update(@Param("id") id: string, @Body() updateSaleDto: UpdateSaleDto, @CurrentUser() user: User) {
    return this.salesService.update(+id, updateSaleDto, user);
  }
}
