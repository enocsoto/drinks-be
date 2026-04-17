import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { Auth, CurrentUser } from "../auth/decorators";
import { UserRole } from "../user/enum/user-roles.enum";
import { UserDocument } from "../user/schemas/user.schema";
import { SaleCorrectionRequestsService } from "./sale-correction-requests.service";
import { CreateSaleCorrectionRequestDto } from "./dto/create-sale-correction-request.dto";
import { UpdateSaleCorrectionRequestDto } from "./dto/update-sale-correction-request.dto";
import { SaleCorrectionRequestStatus } from "./schemas/sale-correction-request.schema";

@ApiTags("Sale correction requests")
@Controller("sale-correction-requests")
export class SaleCorrectionRequestsController {
  constructor(private readonly service: SaleCorrectionRequestsService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: "Mesero: solicitar corrección de una venta propia (motivo opcional)" })
  @Auth(UserRole.SELLER)
  create(@Body() dto: CreateSaleCorrectionRequestDto, @CurrentUser() user: UserDocument) {
    return this.service.create(dto, user);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: "Administrador: listar solicitudes" })
  @ApiQuery({ name: "status", required: false, enum: SaleCorrectionRequestStatus })
  @Auth(UserRole.ADMIN)
  findAll(@Query("status") status?: SaleCorrectionRequestStatus) {
    return this.service.findAllForAdmin(status);
  }

  @Get("pending-count")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Administrador: cantidad de solicitudes pendientes" })
  @Auth(UserRole.ADMIN)
  pendingCount() {
    return this.service.countPending().then(count => ({ count }));
  }

  @Patch(":id")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Administrador: marcar solicitud como resuelta o rechazada" })
  @Auth(UserRole.ADMIN)
  update(
    @Param("id") id: string,
    @Body() dto: UpdateSaleCorrectionRequestDto,
    @CurrentUser() user: UserDocument,
  ) {
    return this.service.updateStatus(id, dto, user);
  }
}
