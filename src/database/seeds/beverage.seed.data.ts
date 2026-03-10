import { DrinkType } from "../../beverage/enum/drink-type.enum";
import { ContainerType } from "../../beverage/enum/container-type.enum";

export interface BeverageSeedItem {
  name: string;
  price: number;
  type: DrinkType;
  containerType: ContainerType;
  containerSize: string;
  stock?: number;
  costPrice?: number;
}

const BEVERAGES_IMG_BASE = "/beverages";

/**
 * Ruta de imagen según nombre y envase. Archivos en drinks-fe/public/beverages/.
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
  if (n.includes("aguila") && n.includes("light")) {
    return containerType === ContainerType.LATA_350
      ? `${BEVERAGES_IMG_BASE}/aguila-ligth-lata.png`
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
 * Bebidas del billar (Colombia).
 * Precios y stock según compras: canastas, pacas, cajas.
 * Cervezas lata/botella: 3000 (excepto Club Colombia lata: 4000).
 */
export const BEVERAGE_SEED_DATA: BeverageSeedItem[] = [
  // --- CERVEZAS BOTELLA (canasta x 38) — 3000 c/u ---
  // Coste canasta ~68.000 → costPrice ≈ 1800
  {
    name: "Aguila Light",
    price: 3000,
    type: DrinkType.ALCOHOLIC,
    containerType: ContainerType.BOTELLA_330,
    containerSize: "330 ml",
    stock: 38,
    costPrice: 1800,
  },
  {
    name: "Aguila Negra",
    price: 3000,
    type: DrinkType.ALCOHOLIC,
    containerType: ContainerType.BOTELLA_330,
    containerSize: "330 ml",
    stock: 38,
    costPrice: 1800,
  },
  {
    name: "Poker",
    price: 3000,
    type: DrinkType.ALCOHOLIC,
    containerType: ContainerType.BOTELLA_330,
    containerSize: "330 ml",
    stock: 38,
    costPrice: 1800,
  },
  {
    name: "Costeñita",
    price: 3000,
    type: DrinkType.ALCOHOLIC,
    containerType: ContainerType.BOTELLA_330,
    containerSize: "330 ml",
    stock: 38,
    costPrice: 1800,
  },

  // --- CORONA (caja 24) — 4000 c/u ---
  // Coste 68.000 / 24 ≈ 2833
  {
    name: "Corona Pequeña",
    price: 4000,
    type: DrinkType.ALCOHOLIC,
    containerType: ContainerType.BOTELLA_250,
    containerSize: "269 ml",
    stock: 24,
    costPrice: 2833,
  },
  {
    name: "Corona Grande",
    price: 4000,
    type: DrinkType.ALCOHOLIC,
    containerType: ContainerType.BOTELLA_330,
    containerSize: "330 ml",
    stock: 24,
    costPrice: 2833,
  },

  // --- CERVEZAS LATA (paca x 24) — 3000 c/u (Club Colombia: 4000) ---
  {
    name: "Budweiser",
    price: 3000,
    type: DrinkType.ALCOHOLIC,
    containerType: ContainerType.LATA_350,
    containerSize: "350 ml",
    stock: 24,
    costPrice: 1800,
  },
  {
    name: "Aguila Negra",
    price: 3000,
    type: DrinkType.ALCOHOLIC,
    containerType: ContainerType.LATA_350,
    containerSize: "350 ml",
    stock: 24,
    costPrice: 1800,
  },
  {
    name: "Aguila Light",
    price: 3000,
    type: DrinkType.ALCOHOLIC,
    containerType: ContainerType.LATA_350,
    containerSize: "350 ml",
    stock: 24,
    costPrice: 1800,
  },
  {
    name: "Club Colombia",
    price: 4000,
    type: DrinkType.ALCOHOLIC,
    containerType: ContainerType.BOTELLA_330,
    containerSize: "330 ml",
    stock: 24,
    costPrice: 1800,
  },
  {
    name: "Club Colombia",
    price: 4000,
    type: DrinkType.ALCOHOLIC,
    containerType: ContainerType.LATA_350,
    containerSize: "350 ml",
    stock: 24,
    costPrice: 1800,
  },

  // --- GASEOSA (caja 30) — coste 25.000 → costPrice 833 ---
  // Precio venta estimado 2500
  {
    name: "Coca-Cola",
    price: 2500,
    type: DrinkType.SODA,
    containerType: ContainerType.BOTELLA_250,
    containerSize: "250 ml",
    stock: 30,
    costPrice: 833,
  },

  // --- AGUA (paca 20 / 24 / 12) ---
  // Paca 20 unidades
  {
    name: "Agua Cristal",
    price: 1500,
    type: DrinkType.WATER,
    containerType: ContainerType.BOTELLA_330,
    containerSize: "330 ml",
    stock: 20,
    costPrice: 500,
  },
  // Grande (1L o 2L) — 2000 c/u, por 24 o 12
  {
    name: "Agua Cristal",
    price: 2000,
    type: DrinkType.WATER,
    containerType: ContainerType.LITRO,
    containerSize: "1 L",
    stock: 24,
    costPrice: 600,
  },

  // --- GATORADE — 5000 ---
  {
    name: "Gatorade",
    price: 5000,
    type: DrinkType.SODA,
    containerType: ContainerType.BOTELLA_500,
    containerSize: "500 ml",
    stock: 12,
    costPrice: 2500,
  },

  // --- AGUARDIENTE LIMOCINA GARRAFÓN — 75.000 ---
  // Coste 58.000
  {
    name: "Aguardiente Limocina",
    price: 75000,
    type: DrinkType.ALCOHOLIC,
    containerType: ContainerType.OTRO,
    containerSize: "Garrafón",
    stock: 1,
    costPrice: 58000,
  },
];
