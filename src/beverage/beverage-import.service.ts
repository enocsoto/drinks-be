import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import * as XLSX from "xlsx";
import { Beverage, BeverageDocument } from "./schemas/beverage.schema";
import { Model } from "mongoose";
import { DrinkType } from "./enum/drink-type.enum";
import { ContainerType } from "./enum/container-type.enum";

const VALID_TYPES = Object.values(DrinkType);
const VALID_CONTAINERS = Object.values(ContainerType);

function toStr(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return "";
}

export interface ImportResult {
  created: number;
  updated: number;
  errors: Array<{ row: number; message: string }>;
}

function parseRow(row: Record<string, unknown>, rowIndex: number): Record<string, unknown> | null {
  const nombre = toStr(row.nombre ?? row.name).trim();
  if (!nombre) return null;

  const precio = Number(row.precio ?? row.price ?? 0);
  if (!precio || precio < 1) {
    throw new Error(`Fila ${rowIndex + 2}: precio inválido o vacío`);
  }

  const tipoRaw = toStr(row.tipo ?? row.type)
    .trim()
    .toUpperCase();
  const tipo = VALID_TYPES.includes(tipoRaw as DrinkType)
    ? (tipoRaw as DrinkType)
    : DrinkType.ALCOHOLIC;

  const envaseRaw = toStr(row.envase ?? row.containerType)
    .trim()
    .toUpperCase();
  if (!envaseRaw) {
    throw new Error(`Fila ${rowIndex + 2}: envase es obligatorio`);
  }
  const envase = VALID_CONTAINERS.includes(envaseRaw as ContainerType)
    ? (envaseRaw as ContainerType)
    : ContainerType.OTRO;

  const tallaEnvase = toStr(row.talla_envase ?? row.containerSize).trim();
  const stock = Math.max(0, Number(row.stock ?? 0) || 0);
  const costPrice = Math.max(0, Number(row.costo ?? row.costPrice ?? 0) || 0);
  const imagen = toStr(row.imagen ?? row.imageUrl).trim();

  return {
    name: nombre,
    price: precio,
    type: tipo,
    containerType: envase,
    containerSize: tallaEnvase || undefined,
    stock,
    costPrice,
    imageUrl: imagen || undefined,
  };
}

@Injectable()
export class BeverageImportService {
  constructor(
    @InjectModel(Beverage.name)
    private readonly beverageModel: Model<BeverageDocument>,
  ) {}

  /**
   * Genera un buffer con la plantilla Excel para cargar bebidas.
   * Incluye hoja "Bebidas" con datos de ejemplo y hoja "Valores válidos" con referencias.
   */
  generateTemplate(): Buffer {
    const wsData = [
      ["nombre", "precio", "costo", "tipo", "envase", "talla_envase", "stock", "imagen"],
      [
        "Aguila Negra",
        3200,
        1800,
        "ALCOHOLICA",
        "LATA_350",
        "350 ml",
        50,
        "/beverages/aguila-negra-lata.png",
      ],
      ["Club Colombia", 3500, 1800, "ALCOHOLICA", "LATA_350", "350 ml", 30, ""],
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const colWidths = [
      { wch: 18 },
      { wch: 10 },
      { wch: 10 },
      { wch: 12 },
      { wch: 14 },
      { wch: 14 },
      { wch: 8 },
      { wch: 30 },
    ];
    ws["!cols"] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bebidas");

    const refData = [
      ["Columna", "Descripción", "Valores válidos / Ejemplo"],
      ["nombre", "Nombre del producto", "Aguila Negra, Club Colombia, Coca-Cola"],
      ["precio", "Precio de venta en COP (número)", "3200, 3500"],
      ["costo", "Precio de coste unitario en COP (opcional)", "1800 (ej: canasta 68.000/38)"],
      ["tipo", "Tipo de bebida", "ALCOHOLICA, GASEOSA, AGUA, JUGO, OTRO"],
      [
        "envase",
        "Tipo de envase",
        "LATA_350, BOTELLA_250, BOTELLA_330, BOTELLA_500, LITRO, LITRO_1_5, LITRO_2, LITRO_2_5, BOTELLA_375, OTRO",
      ],
      ["talla_envase", "Descripción opcional (ej. 350 ml)", "350 ml, 1 L"],
      ["stock", "Cantidad en inventario (número)", "0, 50, 100"],
      ["imagen", "Ruta opcional (ej. /beverages/nombre.png)", ""],
    ];
    const wsRef = XLSX.utils.aoa_to_sheet(refData);
    wsRef["!cols"] = [{ wch: 14 }, { wch: 35 }, { wch: 60 }];
    XLSX.utils.book_append_sheet(wb, wsRef, "Valores válidos");

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as ArrayBuffer;
    return Buffer.from(buf);
  }

  /**
   * Parsea el Excel y crea/actualiza bebidas.
   * Actualiza por coincidencia nombre+envase+talla.
   */
  async importFromBuffer(buffer: Buffer): Promise<ImportResult> {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0] ?? "Sheet1";
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

    const result: ImportResult = { created: 0, updated: 0, errors: [] };

    for (let i = 0; i < rows.length; i++) {
      try {
        const parsed = parseRow(rows[i], i);
        if (!parsed) continue;

        const existing = await this.beverageModel.findOne({
          name: parsed.name,
          containerType: parsed.containerType,
          containerSize: parsed.containerSize ?? "",
        });

        if (existing) {
          existing.stock = parsed.stock as number;
          existing.price = parsed.price as number;
          existing.type = parsed.type as DrinkType;
          if (parsed.costPrice != null) existing.costPrice = parsed.costPrice as number;
          if (parsed.imageUrl) existing.imageUrl = parsed.imageUrl as string;
          await existing.save();
          result.updated++;
        } else {
          await this.beverageModel.create({
            ...parsed,
            costPrice: (parsed.costPrice as number) ?? 0,
            isActive: true,
          });
          result.created++;
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        result.errors.push({ row: i + 2, message: msg });
      }
    }

    return result;
  }
}
