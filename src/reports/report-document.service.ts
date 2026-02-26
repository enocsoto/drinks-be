import { Inject, Injectable } from "@nestjs/common";
import {
  DOCUMENT_STRATEGY_TOKEN,
  IDocumentGeneratorStrategy,
} from "./strategies/document-generator.interface";
import { DailyClosingService } from "./daily-closing.service";

/**
 * Orquestador: obtiene datos del cierre del día y delega la generación del documento
 * a la estrategia inyectada (Strategy + Dependency Inversion). Permite cambiar el formato
 * (PDF, CSV, etc.) sin modificar este servicio (Open/Closed).
 */
@Injectable()
export class ReportDocumentService {
  constructor(
    private readonly dailyClosingService: DailyClosingService,
    @Inject(DOCUMENT_STRATEGY_TOKEN) private readonly strategy: IDocumentGeneratorStrategy,
  ) {}

  async generateDailyClosingDocument(date: string): Promise<{
    buffer: Buffer;
    contentType: string;
    fileExtension: string;
  }> {
    const data = await this.dailyClosingService.getDataForDate(date);
    const buffer = await this.strategy.generate(data);
    return {
      buffer,
      contentType: this.strategy.format,
      fileExtension: this.strategy.fileExtension,
    };
  }
}
