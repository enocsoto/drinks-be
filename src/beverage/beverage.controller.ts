import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Query,
  Req,
  HttpCode,
  HttpStatus,
  StreamableFile,
} from "@nestjs/common";
import { FastifyRequest } from "fastify";
import { BeverageService } from "./beverage.service";
import { BeverageImportService } from "./beverage-import.service";
import { CreateBeverageDto } from "./dto/create-beverage.dto";
import { UpdateBeverageDto } from "./dto/update-beverage.dto";
import { ReceiveInventoryDto } from "./dto/receive-inventory.dto";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from "@nestjs/swagger";
import { Auth } from "../auth/decorators";
import { UserRole } from "../user/enum/user-roles.enum";

@ApiTags("Beverage")
@Controller("beverage")
export class BeverageController {
  constructor(
    private readonly beverageService: BeverageService,
    private readonly beverageImportService: BeverageImportService,
  ) {}

  @Get()
  @ApiBearerAuth()
  @Auth(UserRole.ADMIN, UserRole.SELLER)
  @ApiOperation({ summary: "Listar bebidas activas con paginación (catálogo)" })
  @ApiQuery({ name: "page", required: false, description: "Página (default 1)" })
  @ApiQuery({ name: "limit", required: false, description: "Cantidad por página (default 10)" })
  @ApiQuery({ name: "search", required: false, description: "Filtrar por nombre" })
  @ApiQuery({
    name: "includeInactive",
    required: false,
    description: "Incluir bebidas inactivas (solo ADMIN)",
  })
  @ApiResponse({ status: 200, description: "Lista paginada de bebidas" })
  findAll(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("search") search?: string,
    @Query("includeInactive") includeInactive?: string,
  ) {
    const pageNum = Math.max(1, parseInt(page ?? "1", 10) || 1);
    const limitNum = Math.min(1000, Math.max(1, parseInt(limit ?? "10", 10) || 10));
    return this.beverageService.findAllPaginated(
      pageNum,
      limitNum,
      search,
      includeInactive === "true",
    );
  }

  @Post()
  @ApiBearerAuth()
  @Auth(UserRole.ADMIN)
  @ApiOperation({ summary: "Crear una bebida" })
  @ApiResponse({ status: 201, description: "Bebida creada" })
  create(@Body() createBeverageDto: CreateBeverageDto) {
    return this.beverageService.create(createBeverageDto);
  }

  @Get("import/template")
  @ApiBearerAuth()
  @Auth(UserRole.ADMIN)
  @ApiOperation({ summary: "Descargar plantilla Excel para cargar bebidas" })
  @ApiResponse({ status: 200, description: "Archivo Excel" })
  getImportTemplate() {
    const buffer = this.beverageImportService.generateTemplate();
    return new StreamableFile(buffer, {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      disposition: 'attachment; filename="plantilla-inventario-bebidas.xlsx"',
    });
  }

  @Post("import")
  @ApiBearerAuth()
  @Auth(UserRole.ADMIN)
  @ApiOperation({ summary: "Cargar bebidas desde archivo Excel" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: { type: "object", properties: { file: { type: "string", format: "binary" } } },
  })
  @ApiResponse({ status: 201, description: "Resultado de la importación" })
  async importFromExcel(@Req() req: FastifyRequest) {
    const data = await req.file();
    if (!data) {
      return {
        created: 0,
        updated: 0,
        errors: [{ row: 0, message: "No se recibió ningún archivo" }],
      };
    }
    const buffer = await data.toBuffer();
    const ext = (data.filename ?? "").toLowerCase();
    if (!ext.endsWith(".xlsx") && !ext.endsWith(".xls")) {
      return {
        created: 0,
        updated: 0,
        errors: [{ row: 0, message: "El archivo debe ser Excel (.xlsx o .xls)" }],
      };
    }
    return this.beverageImportService.importFromBuffer(buffer);
  }

  @Get(":id")
  @ApiOperation({ summary: "Obtener bebida por id" })
  findOne(@Param("id") id: string) {
    return this.beverageService.findOne(id);
  }

  @Post(":id/receive")
  @ApiBearerAuth()
  @Auth(UserRole.ADMIN)
  @ApiOperation({
    summary: "Recibir inventario",
    description:
      "Añade cantidad al stock. Si se proporciona costTotal, actualiza costPrice = round(costTotal/quantity). Ej: canasta 68.000 con 38 unidades → 1.800 COP/unidad.",
  })
  @ApiResponse({ status: 200, description: "Inventario recibido" })
  receiveInventory(@Param("id") id: string, @Body() dto: ReceiveInventoryDto) {
    return this.beverageService.receiveInventory(id, dto.quantity, dto.costTotal);
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
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @Auth(UserRole.ADMIN)
  @ApiOperation({ summary: "Eliminar bebida (soft delete)" })
  @ApiResponse({ status: 204, description: "Bebida eliminada (isActive=false)" })
  async remove(@Param("id") id: string): Promise<void> {
    await this.beverageService.remove(id);
  }
}
