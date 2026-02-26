import { DailyClosingDataDto } from "../dto/daily-closing-data.dto";

/**
 * Contrato para estrategias de generación de documentos de cierre del día.
 * Permite añadir nuevos formatos (PDF, CSV, Excel) sin modificar la lógica de negocio (Open/Closed).
 */
export interface IDocumentGeneratorStrategy {
  /**
   * Genera el documento a partir de los datos del cierre del día.
   * @returns Buffer del documento (PDF, etc.)
   */
  generate(data: DailyClosingDataDto): Promise<Buffer>;

  /**
   * Identificador del formato para Content-Type y extensión de archivo.
   */
  readonly format: string;

  /**
   * Extensión de archivo sugerida (ej: "pdf", "csv").
   */
  readonly fileExtension: string;
}

export const DOCUMENT_STRATEGY_TOKEN = "DOCUMENT_GENERATOR_STRATEGY";
