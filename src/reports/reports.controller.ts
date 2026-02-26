import { Controller, Get, Query, StreamableFile } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { ReportDocumentService } from "./report-document.service";
import { DailyClosingService } from "./daily-closing.service";
import { Auth } from "../auth/decorators";
import { UserRole } from "../user/enum/user-roles.enum";
import { DailyClosingDataDto } from "./dto/daily-closing-data.dto";

@ApiTags("Reports")
@Controller("reports")
export class ReportsController {
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
    const date =
      dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)
        ? dateParam
        : new Date().toISOString().split("T")[0];
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
    const date =
      dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)
        ? dateParam
        : new Date().toISOString().split("T")[0];

    const { buffer, contentType, fileExtension } =
      await this.reportDocumentService.generateDailyClosingDocument(date);

    const filename = `cierre-del-dia-${date}.${fileExtension}`;
    return new StreamableFile(buffer, {
      type: contentType,
      disposition: `attachment; filename="${filename}"`,
    });
  }
}
