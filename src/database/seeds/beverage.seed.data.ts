import { DrinkType } from "../../beverage/enum/drink-type.enum";
import { ContainerType } from "../../beverage/enum/container-type.enum";

export interface BeverageSeedItem {
  name: string;
  price: number;
  type: DrinkType;
  containerType: ContainerType;
  containerSize: string;
}

const BEVERAGES_IMG_BASE = "/beverages";

/**
 * Ruta de imagen según nombre y envase. Archivos en drinks-fe/public/beverages/.
 * Solo devuelve ruta si existe imagen para esa bebida; si no, "".
 */
export function getBeverageImageUrl(name: string, containerType: ContainerType): string {
  const n = name.trim().toLowerCase();
  if (n.includes("agua cristal")) {
    return containerType === ContainerType.BOTELLA_330
      ? `${BEVERAGES_IMG_BASE}/agua-cristal-pequena.png`
      : `${BEVERAGES_IMG_BASE}/agua-cristal.png`;
  }
  if (n.includes("aguila negra")) {
    return containerType === ContainerType.LATA_350
      ? `${BEVERAGES_IMG_BASE}/aguila-negra-lata.png`
      : "";
  }
  if (n === "aguila" && containerType === ContainerType.LATA_350) {
    return `${BEVERAGES_IMG_BASE}/aguila-ligth-lata.png`;
  }
  if (n.includes("club colombia") && !n.includes("negra")) {
    if (containerType === ContainerType.LATA_350)
      return `${BEVERAGES_IMG_BASE}/club-colombia-lata-med.png`;
    if (containerType === ContainerType.BOTELLA_330)
      return `${BEVERAGES_IMG_BASE}/club-colombia-lata-peq.png`;
  }
  if (n.includes("budweiser")) return `${BEVERAGES_IMG_BASE}/budweiser.png`;
  return "";
}

/**
 * Bebidas típicas de billar en Colombia (cervezas y otras).
 * Precios referenciales en COP; envases según presentaciones habituales.
 */
export const BEVERAGE_SEED_DATA: BeverageSeedItem[] = [
  // Aguila
  {
    name: "Aguila",
    price: 2800,
    type: DrinkType.ALCOHOLIC,
    containerType: ContainerType.LATA_350,
    containerSize: "350 ml",
  },
  {
    name: "Aguila",
    price: 2200,
    type: DrinkType.ALCOHOLIC,
    containerType: ContainerType.BOTELLA_250,
    containerSize: "250 ml",
  },
  {
    name: "Aguila",
    price: 5500,
    type: DrinkType.ALCOHOLIC,
    containerType: ContainerType.LITRO,
    containerSize: "1 L",
  },
  // Aguila Negra
  {
    name: "Aguila Negra",
    price: 3200,
    type: DrinkType.ALCOHOLIC,
    containerType: ContainerType.LATA_350,
    containerSize: "350 ml",
  },
  {
    name: "Aguila Negra",
    price: 2600,
    type: DrinkType.ALCOHOLIC,
    containerType: ContainerType.BOTELLA_250,
    containerSize: "250 ml",
  },
  {
    name: "Aguila Negra",
    price: 6500,
    type: DrinkType.ALCOHOLIC,
    containerType: ContainerType.LITRO,
    containerSize: "1 L",
  },
  // Poker
  {
    name: "Poker",
    price: 2700,
    type: DrinkType.ALCOHOLIC,
    containerType: ContainerType.LATA_350,
    containerSize: "350 ml",
  },
  {
    name: "Poker",
    price: 2100,
    type: DrinkType.ALCOHOLIC,
    containerType: ContainerType.BOTELLA_250,
    containerSize: "250 ml",
  },
  {
    name: "Poker",
    price: 5200,
    type: DrinkType.ALCOHOLIC,
    containerType: ContainerType.LITRO,
    containerSize: "1 L",
  },
  // Club Colombia
  {
    name: "Club Colombia",
    price: 3800,
    type: DrinkType.ALCOHOLIC,
    containerType: ContainerType.LATA_350,
    containerSize: "350 ml",
  },
  {
    name: "Club Colombia",
    price: 3500,
    type: DrinkType.ALCOHOLIC,
    containerType: ContainerType.BOTELLA_330,
    containerSize: "330 ml",
  },
  {
    name: "Club Colombia Negra",
    price: 4000,
    type: DrinkType.ALCOHOLIC,
    containerType: ContainerType.LATA_350,
    containerSize: "350 ml",
  },
  // Costena
  {
    name: "Costena",
    price: 2600,
    type: DrinkType.ALCOHOLIC,
    containerType: ContainerType.LATA_350,
    containerSize: "350 ml",
  },
  {
    name: "Costena",
    price: 5000,
    type: DrinkType.ALCOHOLIC,
    containerType: ContainerType.LITRO,
    containerSize: "1 L",
  },
  // Redds / otras
  {
    name: "Redds",
    price: 3200,
    type: DrinkType.ALCOHOLIC,
    containerType: ContainerType.LATA_350,
    containerSize: "350 ml",
  },
  // Gaseosas (500 ml, 1 L, 1.5 L, 2 L, 2.5 L)
  {
    name: "Coca-Cola",
    price: 2500,
    type: DrinkType.SODA,
    containerType: ContainerType.BOTELLA_250,
    containerSize: "250 ml",
  },
  {
    name: "Coca-Cola",
    price: 3500,
    type: DrinkType.SODA,
    containerType: ContainerType.LATA_350,
    containerSize: "350 ml",
  },
  {
    name: "Coca-Cola",
    price: 4500,
    type: DrinkType.SODA,
    containerType: ContainerType.BOTELLA_500,
    containerSize: "500 ml",
  },
  {
    name: "Coca-Cola",
    price: 5500,
    type: DrinkType.SODA,
    containerType: ContainerType.LITRO,
    containerSize: "1 L",
  },
  {
    name: "Coca-Cola",
    price: 7500,
    type: DrinkType.SODA,
    containerType: ContainerType.LITRO_1_5,
    containerSize: "1.5 L",
  },
  {
    name: "Coca-Cola",
    price: 9500,
    type: DrinkType.SODA,
    containerType: ContainerType.LITRO_2,
    containerSize: "2 L",
  },
  {
    name: "Coca-Cola",
    price: 11000,
    type: DrinkType.SODA,
    containerType: ContainerType.LITRO_2_5,
    containerSize: "2.5 L",
  },
  {
    name: "Postobon",
    price: 4200,
    type: DrinkType.SODA,
    containerType: ContainerType.BOTELLA_500,
    containerSize: "500 ml",
  },
  {
    name: "Postobon",
    price: 5200,
    type: DrinkType.SODA,
    containerType: ContainerType.LITRO,
    containerSize: "1 L",
  },
  {
    name: "Postobon",
    price: 7000,
    type: DrinkType.SODA,
    containerType: ContainerType.LITRO_1_5,
    containerSize: "1.5 L",
  },
  {
    name: "Postobon",
    price: 9000,
    type: DrinkType.SODA,
    containerType: ContainerType.LITRO_2,
    containerSize: "2 L",
  },
  {
    name: "Postobon",
    price: 10500,
    type: DrinkType.SODA,
    containerType: ContainerType.LITRO_2_5,
    containerSize: "2.5 L",
  },
  {
    name: "Pony Malta",
    price: 2000,
    type: DrinkType.SODA,
    containerType: ContainerType.BOTELLA_330,
    containerSize: "330 ml",
  },
  // Aguardiente
  {
    name: "Aguardiente",
    price: 8000,
    type: DrinkType.ALCOHOLIC,
    containerType: ContainerType.BOTELLA_375,
    containerSize: "375 ml",
  },
  {
    name: "Aguardiente",
    price: 15000,
    type: DrinkType.ALCOHOLIC,
    containerType: ContainerType.OTRO,
    containerSize: "750 ml",
  },
  // Agua
  {
    name: "Agua Cristal",
    price: 1500,
    type: DrinkType.WATER,
    containerType: ContainerType.BOTELLA_330,
    containerSize: "330 ml",
  },
];
