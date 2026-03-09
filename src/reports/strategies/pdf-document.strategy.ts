/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { Injectable } from "@nestjs/common";
import { IDocumentGeneratorStrategy } from "./document-generator.interface";
import { DailyClosingDataDto } from "../dto/daily-closing-data.dto";

const PDFDocument = require("pdfkit");

type PDFDoc = ReturnType<typeof PDFDocument>;

function formatGeneratedAt(value: Date | string | undefined): string {
  if (value == null) return new Date().toISOString();
  if (typeof value === "string") return value;
  try {
    return value.toLocaleString("es-CO");
  } catch {
    return value.toISOString();
  }
}

const MARGIN = 50;
const PAGE_WIDTH = 595;
const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN;
const ROW_HEIGHT = 22;
const HEADER_FONT_SIZE = 18;
const BODY_FONT_SIZE = 10;
const FOOTER_FONT_SIZE = 9;
/** Espacio entre el bloque de totales y el footer */
const FOOTER_TOP_MARGIN = 24;

/** Paleta alineada con la app (globals.css): marca roja, grises, superficies */

const STYLES = {
  brandPrimary: "#DC2626",
  brandAccent: "#FEF2F2",
  textPrimary: "#111827",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
  bgSurface: "#F9FAFB",
  bgBase: "#FFFFFF",
  border: "#E5E7EB",
  borderFocus: "#DC2626",
} as const;

/**
 * Estrategia concreta: genera el documento de cierre del día en PDF con estilos.
 * Responsabilidad única: formato y presentación del PDF (SOLID).
 */
@Injectable()
export class PdfDocumentStrategy implements IDocumentGeneratorStrategy {
  readonly format = "application/pdf";
  readonly fileExtension = "pdf";

  async generate(data: DailyClosingDataDto): Promise<Buffer> {
    const safeData: DailyClosingDataDto = {
      date: data?.date ?? new Date().toISOString().split("T")[0],
      generatedAt: data?.generatedAt ?? new Date(),
      items: Array.isArray(data?.items) ? data.items : [],
      totalQuantity: Number(data?.totalQuantity) || 0,
      totalAmount: Number(data?.totalAmount) || 0,
      totalTransactions: Number(data?.totalTransactions) || 0,
    };

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: MARGIN, size: "A4" });
      const chunks: Buffer[] = [];

      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      try {
        this.writeHeader(doc, safeData);
        doc.moveDown(0.5);
        this.writeTable(doc, safeData);
        doc.moveDown(1);
        this.writeTotals(doc, safeData);
        this.writeFooter(doc, safeData);
      } catch (err) {
        reject(err instanceof Error ? err : new Error(String(err)));
        return;
      }

      doc.end();
    });
  }

  private writeHeader(doc: PDFDoc, data: DailyClosingDataDto): void {
    doc
      .fontSize(HEADER_FONT_SIZE)
      .fillColor(STYLES.brandPrimary)
      .font("Helvetica-Bold")
      .text("Cierre del día", { align: "center" });

    doc.moveDown(0.3);
    doc
      .fontSize(BODY_FONT_SIZE)
      .fillColor(STYLES.textSecondary)
      .font("Helvetica")
      .text(`Fecha del cierre: ${data.date}`, { align: "center" });

    doc
      .fontSize(FOOTER_FONT_SIZE)
      .fillColor(STYLES.textMuted)
      .text(`Generado: ${formatGeneratedAt(data.generatedAt)}`, {
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

    // Encabezado de tabla (bg-surface, border, text-primary)
    doc
      .fontSize(BODY_FONT_SIZE)
      .fillColor(STYLES.textPrimary)
      .font("Helvetica-Bold")
      .rect(MARGIN, y, CONTENT_WIDTH, ROW_HEIGHT)
      .fillAndStroke(STYLES.bgSurface, STYLES.border);

    doc
      .fillColor(STYLES.textPrimary)
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

    doc.font("Helvetica").fillColor(STYLES.textPrimary);

    if (data.items.length === 0) {
      doc
        .fontSize(BODY_FONT_SIZE)
        .fillColor(STYLES.textSecondary)
        .text("No hay ventas registradas para este día.", MARGIN, y + 6);
      doc.y = y + ROW_HEIGHT;
      return;
    }

    for (let i = 0; i < data.items.length; i++) {
      const item = data.items[i];
      const fill = i % 2 === 0 ? STYLES.bgBase : STYLES.bgSurface;
      doc.rect(MARGIN, y, CONTENT_WIDTH, ROW_HEIGHT).fillAndStroke(fill, STYLES.border);

      doc
        .fontSize(BODY_FONT_SIZE)
        .fillColor(STYLES.textPrimary)
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
    const totalsBoxHeight = 78;
    const line1Y = y + 14;
    const line2Y = y + 36;
    const line3Y = y + 58;

    doc
      .font("Helvetica-Bold")
      .fontSize(BODY_FONT_SIZE)
      .fillColor(STYLES.brandPrimary)
      .rect(MARGIN, y, CONTENT_WIDTH, totalsBoxHeight)
      .fillAndStroke(STYLES.brandAccent, STYLES.borderFocus);

    const labelsWidth = CONTENT_WIDTH * 0.58;
    const valuesStart = MARGIN + labelsWidth;
    const valuesWidth = CONTENT_WIDTH * 0.38;

    doc
      .fillColor(STYLES.textPrimary)
      .text("Total unidades:", MARGIN + 8, line1Y, { width: labelsWidth })
      .text(String(data.totalQuantity), valuesStart, line1Y, {
        width: valuesWidth,
        align: "right",
      });

    doc
      .text("Total ventas (transacciones):", MARGIN + 8, line2Y, { width: labelsWidth })
      .text(String(data.totalTransactions), valuesStart, line2Y, {
        width: valuesWidth,
        align: "right",
      });

    doc
      .text("Total monto (COP):", MARGIN + 8, line3Y, { width: labelsWidth })
      .text(this.formatCop(data.totalAmount), valuesStart, line3Y, {
        width: valuesWidth,
        align: "right",
      });

    doc.y = y + totalsBoxHeight + FOOTER_TOP_MARGIN;
  }

  private writeFooter(doc: PDFDoc, data: DailyClosingDataDto): void {
    doc
      .font("Helvetica")
      .fontSize(FOOTER_FONT_SIZE)
      .fillColor(STYLES.textMuted)
      .text(`Documento de cierre del día — ${data.date} — los Amigos`, MARGIN, doc.y, {
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
