import { Controller, Get, Post, Body, Param, Delete, Patch, Query } from "@nestjs/common";
import { BeverageService } from "./beverage.service";
import { CreateBeverageDto } from "./dto/create-beverage.dto";
import { UpdateBeverageDto } from "./dto/update-beverage.dto";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { Auth } from "../auth/decorators";
import { UserRole } from "../user/enum/user-roles.enum";

@ApiTags("Beverage")
@Controller("beverage")
export class BeverageController {
  constructor(private readonly beverageService: BeverageService) {}

  @Get()
  @ApiBearerAuth()
  @Auth(UserRole.ADMIN, UserRole.SELLER)
  @ApiOperation({ summary: "Listar bebidas activas con paginación (catálogo)" })
  @ApiQuery({ name: "page", required: false, description: "Página (default 1)" })
  @ApiQuery({ name: "limit", required: false, description: "Cantidad por página (default 10)" })
  @ApiQuery({ name: "search", required: false, description: "Filtrar por nombre" })
  @ApiResponse({ status: 200, description: "Lista paginada de bebidas" })
  findAll(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("search") search?: string,
  ) {
    const pageNum = Math.max(1, parseInt(page ?? "1", 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit ?? "10", 10) || 10));
    return this.beverageService.findAllPaginated(pageNum, limitNum, search);
  }

  @Post()
  @ApiBearerAuth()
  @Auth(UserRole.ADMIN)
  @ApiOperation({ summary: "Crear una bebida" })
  @ApiResponse({ status: 201, description: "Bebida creada" })
  create(@Body() createBeverageDto: CreateBeverageDto) {
    return this.beverageService.create(createBeverageDto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Obtener bebida por id" })
  findOne(@Param("id") id: string) {
    return this.beverageService.findOne(id);
  }

  @Patch(":id")
  @ApiBearerAuth()
  @Auth(UserRole.ADMIN)
  @ApiOperation({ summary: "Actualizar una bebida (solo administradores)" })
  @ApiResponse({ status: 200, description: "Bebida actualizada" })
  update(@Param("id") id: string, @Body() updateBeverageDto: UpdateBeverageDto) {
    return this.beverageService.update(id, updateBeverageDto);
  }

  @Delete(":id")
  @ApiBearerAuth()
  @Auth(UserRole.ADMIN)
  @ApiOperation({ summary: "Eliminar bebida (soft delete)" })
  remove(@Param("id") id: string) {
    return this.beverageService.remove(id);
  }
}
