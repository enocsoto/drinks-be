import { Injectable } from "@nestjs/common";
import PDFDocument from "pdfkit";
import { IDocumentGeneratorStrategy } from "./document-generator.interface";
import { DailyClosingDataDto } from "../dto/daily-closing-data.dto";

type PDFDoc = InstanceType<typeof PDFDocument>;

const MARGIN = 50;
const PAGE_WIDTH = 595;
const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN;
const ROW_HEIGHT = 22;
const HEADER_FONT_SIZE = 18;
const BODY_FONT_SIZE = 10;
const FOOTER_FONT_SIZE = 9;

/**
 * Estrategia concreta: genera el documento de cierre del día en PDF con estilos.
 * Responsabilidad única: formato y presentación del PDF (SOLID).
 */
@Injectable()
export class PdfDocumentStrategy implements IDocumentGeneratorStrategy {
  readonly format = "application/pdf";
  readonly fileExtension = "pdf";

  async generate(data: DailyClosingDataDto): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: MARGIN, size: "A4" });
      const chunks: Buffer[] = [];

      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      this.writeHeader(doc, data);
      doc.moveDown(0.5);
      this.writeTable(doc, data);
      doc.moveDown(1);
      this.writeTotals(doc, data);
      this.writeFooter(doc, data);

      doc.end();
    });
  }

  private writeHeader(doc: PDFDoc, data: DailyClosingDataDto): void {
    doc
      .fontSize(HEADER_FONT_SIZE)
      .fillColor("#1a365d")
      .font("Helvetica-Bold")
      .text("Cierre del día", { align: "center" });

    doc.moveDown(0.3);
    doc
      .fontSize(BODY_FONT_SIZE)
      .fillColor("#4a5568")
      .font("Helvetica")
      .text(`Fecha del cierre: ${data.date}`, { align: "center" });

    doc
      .fontSize(FOOTER_FONT_SIZE)
      .fillColor("#718096")
      .text(`Generado: ${data.generatedAt.toLocaleString("es-CO")}`, {
        align: "center",
      });
  }

  private writeTable(doc: PDFDoc, data: DailyClosingDataDto): void {
    const colWidths = {
      product: CONTENT_WIDTH * 0.45,
      qty: CONTENT_WIDTH * 0.15,
      unit: CONTENT_WIDTH * 0.2,
      subtotal: CONTENT_WIDTH * 0.2,
    };
    let y = doc.y;

    // Encabezado de tabla
    doc
      .fontSize(BODY_FONT_SIZE)
      .fillColor("#2d3748")
      .font("Helvetica-Bold")
      .rect(MARGIN, y, CONTENT_WIDTH, ROW_HEIGHT)
      .fillAndStroke("#e2e8f0", "#cbd5e0");

    doc
      .fillColor("#1a202c")
      .text("Producto", MARGIN + 8, y + 6, { width: colWidths.product })
      .text("Cant.", MARGIN + colWidths.product + 8, y + 6, {
        width: colWidths.qty,
      })
      .text("P. unit. (COP)", MARGIN + colWidths.product + colWidths.qty + 8, y + 6, {
        width: colWidths.unit,
      })
      .text(
        "Subtotal (COP)",
        MARGIN + colWidths.product + colWidths.qty + colWidths.unit + 8,
        y + 6,
        {
          width: colWidths.subtotal,
        },
      );

    y += ROW_HEIGHT;

    doc.font("Helvetica").fillColor("#2d3748");

    if (data.items.length === 0) {
      doc.fontSize(BODY_FONT_SIZE).text("No hay ventas registradas para este día.", MARGIN, y + 6);
      doc.y = y + ROW_HEIGHT;
      return;
    }

    for (let i = 0; i < data.items.length; i++) {
      const item = data.items[i];
      const fill = i % 2 === 0 ? "#f7fafc" : "#edf2f7";
      doc.rect(MARGIN, y, CONTENT_WIDTH, ROW_HEIGHT).fillAndStroke(fill, "#e2e8f0");

      doc
        .fontSize(BODY_FONT_SIZE)
        .fillColor("#2d3748")
        .text(item.beverageName, MARGIN + 8, y + 6, { width: colWidths.product })
        .text(String(item.quantity), MARGIN + colWidths.product + 8, y + 6, {
          width: colWidths.qty,
        })
        .text(
          this.formatCop(item.unitPrice),
          MARGIN + colWidths.product + colWidths.qty + 8,
          y + 6,
          {
            width: colWidths.unit,
          },
        )
        .text(
          this.formatCop(item.subtotal),
          MARGIN + colWidths.product + colWidths.qty + colWidths.unit + 8,
          y + 6,
          {
            width: colWidths.subtotal,
          },
        );

      y += ROW_HEIGHT;
    }

    doc.y = y;
  }

  private writeTotals(doc: PDFDoc, data: DailyClosingDataDto): void {
    const y = doc.y;
    doc
      .font("Helvetica-Bold")
      .fontSize(BODY_FONT_SIZE)
      .fillColor("#1a365d")
      .rect(MARGIN, y, CONTENT_WIDTH, ROW_HEIGHT * 1.2)
      .fillAndStroke("#edf2f7", "#2b6cb0");

    doc
      .text("Total unidades:", MARGIN + 8, y + 10, { width: CONTENT_WIDTH * 0.5 })
      .text(String(data.totalQuantity), MARGIN + CONTENT_WIDTH * 0.5, y + 10, {
        width: CONTENT_WIDTH * 0.5,
        align: "right",
      });

    doc
      .text("Total ventas (transacciones):", MARGIN + 8, y + 28, { width: CONTENT_WIDTH * 0.5 })
      .text(String(data.totalTransactions), MARGIN + CONTENT_WIDTH * 0.5, y + 28, {
        width: CONTENT_WIDTH * 0.5,
        align: "right",
      });

    doc
      .text("Total monto (COP):", MARGIN + 8, y + 46, { width: CONTENT_WIDTH * 0.5 })
      .text(this.formatCop(data.totalAmount), MARGIN + CONTENT_WIDTH * 0.5, y + 46, {
        width: CONTENT_WIDTH * 0.5,
        align: "right",
      });

    doc.y = y + ROW_HEIGHT * 1.2;
  }

  private writeFooter(doc: PDFDoc, data: DailyClosingDataDto): void {
    doc
      .font("Helvetica")
      .fontSize(FOOTER_FONT_SIZE)
      .fillColor("#718096")
      .text(`Documento de cierre del día — ${data.date} — Billar Drinks Colombia`, MARGIN, doc.y, {
        align: "center",
        width: CONTENT_WIDTH,
      });
  }

  private formatCop(value: number): string {
    return new Intl.NumberFormat("es-CO", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  }
}
