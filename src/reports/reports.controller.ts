import {
  Controller,
  Get,
  Query,
  StreamableFile,
  Logger,
  InternalServerErrorException,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { ReportDocumentService } from "./report-document.service";
import { DailyClosingService } from "./daily-closing.service";
import { Auth } from "../auth/decorators";
import { UserRole } from "../user/enum/user-roles.enum";
import { DailyClosingDataDto } from "./dto/daily-closing-data.dto";
import { todayColombia } from "../common/utils/date-colombia.util";

@ApiTags("Reports")
@Controller("reports")
export class ReportsController {
  private readonly logger = new Logger(ReportsController.name);

  constructor(
    private readonly reportDocumentService: ReportDocumentService,
    private readonly dailyClosingService: DailyClosingService,
  ) {}

  @Get("daily-closing/data")
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Datos del cierre del día (cuadre) para la UI",
  })
  @ApiQuery({
    name: "date",
    required: false,
    description: "Fecha en YYYY-MM-DD; por defecto hoy",
  })
  @Auth(UserRole.ADMIN)
  async getDailyClosingData(@Query("date") dateParam?: string): Promise<DailyClosingDataDto> {
    const date = dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : todayColombia();
    return this.dailyClosingService.getDataForDate(date);
  }

  @Get("daily-closing")
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Genera el documento PDF del cierre del día (productos vendidos)",
  })
  @ApiQuery({
    name: "date",
    required: false,
    description: "Fecha en YYYY-MM-DD; por defecto hoy",
  })
  @Auth(UserRole.ADMIN)
  async getDailyClosingDocument(@Query("date") dateParam?: string): Promise<StreamableFile> {
    const date = dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : todayColombia();

    try {
      const { buffer, contentType, fileExtension } =
        await this.reportDocumentService.generateDailyClosingDocument(date);

      const filename = `cierre-del-dia-${date}.${fileExtension}`;
      return new StreamableFile(buffer, {
        type: contentType,
        disposition: `attachment; filename="${filename}"`,
      });
    } catch (err) {
      this.logger.error(
        `Error al generar PDF cierre del día (date=${date}): ${err instanceof Error ? err.message : String(err)}`,
        err instanceof Error ? err.stack : undefined,
      );
      throw new InternalServerErrorException(
        "No se pudo generar el documento del cierre del día. Revisa los logs del servidor.",
      );
    }
  }
}
