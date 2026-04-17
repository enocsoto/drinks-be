import { IsEnum } from "class-validator";

/** Solo estados finales que el administrador puede asignar */
export enum AdminResolveCorrectionStatus {
  RESOLVED = "RESOLVED",
  REJECTED = "REJECTED",
}

export class UpdateSaleCorrectionRequestDto {
  @IsEnum(AdminResolveCorrectionStatus)
  status: AdminResolveCorrectionStatus;
}
