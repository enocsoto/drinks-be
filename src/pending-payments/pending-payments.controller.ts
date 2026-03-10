import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Query,
  StreamableFile,
} from "@nestjs/common";
import { PendingPaymentsService } from "./pending-payments.service";
import { CreatePendingPaymentDto } from "./dto/create-pending-payment.dto";
import { UpdatePendingPaymentDto } from "./dto/update-pending-payment.dto";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { Auth } from "../auth/decorators";
import { UserRole } from "../user/enum/user-roles.enum";

@ApiTags("Pending Payments")
@Controller("pending-payments")
export class PendingPaymentsController {
  constructor(private readonly pendingPaymentsService: PendingPaymentsService) {}

  @Post()
  @ApiBearerAuth()
  @Auth(UserRole.ADMIN, UserRole.SELLER)
  @ApiOperation({ summary: "Registrar una persona con pago pendiente" })
  @ApiResponse({ status: 201, description: "Registro creado" })
  create(@Body() dto: CreatePendingPaymentDto) {
    return this.pendingPaymentsService.create(dto);
  }

  @Get()
  @ApiBearerAuth()
  @Auth(UserRole.ADMIN, UserRole.SELLER)
  @ApiOperation({ summary: "Listar personas con pagos pendientes (paginado)" })
  @ApiQuery({ name: "page", required: false, description: "Página (default 1)" })
  @ApiQuery({ name: "limit", required: false, description: "Cantidad por página (default 10)" })
  @ApiQuery({
    name: "search",
    required: false,
    description: "Buscar por nombre, apodo o descripción",
  })
  @ApiQuery({ name: "debtDateFrom", required: false, description: "Fecha desde (YYYY-MM-DD)" })
  @ApiQuery({ name: "debtDateTo", required: false, description: "Fecha hasta (YYYY-MM-DD)" })
  @ApiResponse({ status: 200, description: "Lista paginada de pagos pendientes" })
  findAll(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("search") search?: string,
    @Query("debtDateFrom") debtDateFrom?: string,
    @Query("debtDateTo") debtDateTo?: string,
  ) {
    const pageNum = Math.max(1, parseInt(page ?? "1", 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit ?? "10", 10) || 10));
    return this.pendingPaymentsService.findAllPaginated(
      pageNum,
      limitNum,
      search,
      debtDateFrom,
      debtDateTo,
    );
  }

  @Get(":id/pdf")
  @ApiBearerAuth()
  @Auth(UserRole.ADMIN, UserRole.SELLER)
  @ApiOperation({ summary: "Generar PDF comanda del pago pendiente (reimprimible)" })
  @ApiResponse({ status: 200, description: "PDF generado" })
  @ApiResponse({ status: 404, description: "No encontrado" })
  async getPdf(@Param("id") id: string): Promise<StreamableFile> {
    const buffer = await this.pendingPaymentsService.generateComandaPdf(id);
    const filename = `comanda-pago-pendiente-${id}.pdf`;
    return new StreamableFile(buffer, {
      type: "application/pdf",
      disposition: `inline; filename="${filename}"`,
    });
  }

  @Get(":id")
  @ApiBearerAuth()
  @Auth(UserRole.ADMIN, UserRole.SELLER)
  @ApiOperation({ summary: "Obtener un registro de pago pendiente por id" })
  @ApiResponse({ status: 200, description: "Registro encontrado" })
  @ApiResponse({ status: 404, description: "No encontrado" })
  findOne(@Param("id") id: string) {
    return this.pendingPaymentsService.findOne(id);
  }

  @Patch(":id")
  @ApiBearerAuth()
  @Auth(UserRole.ADMIN, UserRole.SELLER)
  @ApiOperation({ summary: "Actualizar un registro de pago pendiente" })
  @ApiResponse({ status: 200, description: "Registro actualizado" })
  update(@Param("id") id: string, @Body() dto: UpdatePendingPaymentDto) {
    return this.pendingPaymentsService.update(id, dto);
  }

  @Delete(":id")
  @ApiBearerAuth()
  @Auth(UserRole.ADMIN, UserRole.SELLER)
  @ApiOperation({ summary: "Eliminar un registro de pago pendiente" })
  @ApiResponse({ status: 200, description: "Registro eliminado" })
  remove(@Param("id") id: string) {
    return this.pendingPaymentsService.remove(id);
  }
}
