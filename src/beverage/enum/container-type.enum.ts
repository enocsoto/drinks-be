/**
 * Tipos de envase para bebidas (cervezas, gaseosas, aguardiente en Colombia).
 * Incluye presentaciones 500 ml y 1 / 1.5 / 2 / 2.5 L para gaseosas (Coca-Cola, Postobón).
 */
export enum ContainerType {
  LATA_350 = "LATA_350",
  BOTELLA_250 = "BOTELLA_250",
  BOTELLA_330 = "BOTELLA_330",
  BOTELLA_500 = "BOTELLA_500",
  LITRO = "LITRO",
  LITRO_1_5 = "LITRO_1_5",
  LITRO_2 = "LITRO_2",
  LITRO_2_5 = "LITRO_2_5",
  LITRO_REFILL = "LITRO_REFILL",
  BOTELLA_375 = "BOTELLA_375",
  OTRO = "OTRO",
}

export const CONTAINER_TYPE_LABELS: Record<ContainerType, string> = {
  [ContainerType.LATA_350]: "Lata 350 ml",
  [ContainerType.BOTELLA_250]: "Botella 250 ml",
  [ContainerType.BOTELLA_330]: "Botella 330 ml",
  [ContainerType.BOTELLA_500]: "Botella 500 ml",
  [ContainerType.LITRO]: "1 L",
  [ContainerType.LITRO_1_5]: "1.5 L",
  [ContainerType.LITRO_2]: "2 L",
  [ContainerType.LITRO_2_5]: "2.5 L",
  [ContainerType.LITRO_REFILL]: "Litro retornable",
  [ContainerType.BOTELLA_375]: "Botella 375 ml",
  [ContainerType.OTRO]: "Otro",
};
