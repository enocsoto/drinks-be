import { BadRequestException } from "@nestjs/common";
import { isValidYyyyMmDdString, todayColombia } from "../../common/utils/date-colombia.util";

/**
 * Día contable (YYYY-MM-DD) para crear una venta: Colombia “hoy”, o la fecha
 * explícita solo si el actor es administrador.
 */
export function resolveNewSaleYyyyMmDd(
  requestedSaleDate: string | undefined,
  isAdmin: boolean,
): string {
  const trimmed = requestedSaleDate?.trim() ?? "";
  if (trimmed !== "" && !isAdmin) {
    throw new BadRequestException("Solo un administrador puede indicar la fecha de la venta.");
  }
  if (isAdmin && trimmed !== "") {
    if (!isValidYyyyMmDdString(trimmed)) {
      throw new BadRequestException("Fecha de venta no válida. Use YYYY-MM-DD (día en Colombia).");
    }
    return trimmed;
  }
  return todayColombia();
}
