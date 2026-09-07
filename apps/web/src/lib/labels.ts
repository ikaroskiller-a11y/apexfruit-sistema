import type {
  EspecieFruta,
  FirmezaUnidad,
  MercadoDestino,
  ResultadoInspeccion,
  RolUsuario,
  TipoDefecto,
} from "@prisma/client";

export const especieLabels: Record<EspecieFruta, string> = {
  MANZANA: "Manzana",
  UVA_DE_MESA: "Uva de mesa",
  CEREZA: "Cereza",
  ARANDANO: "Arándano",
  PERA: "Pera",
  KIWI: "Kiwi",
  CIRUELA: "Ciruela",
  OTRO: "Otro",
};

// Resultado en la terminología real de 3 niveles que usa Apex Fruit
// (plantilla de campo de cereza, ver docs/research/material-existente.md).
export const resultadoLabels: Record<ResultadoInspeccion, string> = {
  CATEGORIA_1: "Categoría 1",
  CATEGORIA_2: "Categoría 2",
  OBJETADO: "Objetado",
};

// Mapea el resultado de una inspección a uno de los 4 estados semánticos
// del panel (guía de diseño §1.2). Se usa junto con <Badge status={...}>,
// que agrega ícono + tinte de fondo — el estado nunca se comunica solo con
// color ni solo con texto suelto.
export const resultadoStatusMap: Record<
  ResultadoInspeccion,
  "success" | "warning" | "danger"
> = {
  CATEGORIA_1: "success",
  CATEGORIA_2: "warning",
  OBJETADO: "danger",
};

export const rolLabels: Record<RolUsuario, string> = {
  ADMINISTRADOR: "Administrador",
  INSPECTOR: "Inspector",
};

// Catálogo real de defectos de cereza (5 CALIDAD + 10 CONDICIÓN, ver
// src/lib/normas.ts para la categoría de cada uno) + valores de otras
// especies / legado que se mantienen por compatibilidad.
export const tipoDefectoLabels: Record<TipoDefecto, string> = {
  // Calidad (cereza)
  RUSSET: "Russet",
  FUERA_DE_COLOR: "Fuera de color",
  AUSENCIA_PEDICELO: "Ausencia de pedicelo",
  DEFORME: "Frutos deformes",
  MANCHA: "Manchas",

  // Condición (cereza)
  SOBREMADURO: "Sobremadurez",
  PARTIDURA_CRACKING: "Partiduras",
  HERIDA_ABIERTA: "Heridas abiertas",
  PUDRICION_HUMEDA: "Pudrición húmeda",
  PUDRICION_SECA: "Pudrición seca",
  PITTING: "Pitting",
  MAGULLADURA: "Machucón",
  PEDICELO_SECO: "Pedicelo deshidratado",
  MEDIALUNA: "Medialunas",
  QUEMADURA_SOL: "Golpe de sol",

  // Otras especies / legado
  DANO_INSECTO: "Daño por insecto",
  INMADURO: "Inmaduro",
  DANO_GRANIZO: "Daño por granizo",
  DESGRANE: "Desgrane",
  BLANDURA: "Blandura",
  OTRO: "Otro",
};

export const mercadoDestinoLabels: Record<MercadoDestino, string> = {
  USA: "Estados Unidos",
  EUROPA: "Europa",
  JAPON: "Japón",
  COREA: "Corea",
  CHINA: "China",
  INDIA: "India",
  LATAM: "Latinoamérica",
  OTRO: "Otro",
};

export const firmezaUnidadLabels: Record<FirmezaUnidad, string> = {
  KGF: "kgF",
  UD_DUROFEL: "UD Durofel",
  LBS: "lb",
};

// Calibres reales de cereza (plantilla de campo Apex Fruit). 2J/3J/4J son
// calibres grandes, muy valorados/premium en mercados asiáticos.
export const calibresCereza = ["Pre", "L", "XL", "J", "2J", "3J", "4J"] as const;
export const calibresCerezaPremiumAsia: ReadonlySet<string> = new Set([
  "2J",
  "3J",
  "4J",
]);

export const especieOptions = Object.entries(especieLabels) as [
  EspecieFruta,
  string,
][];

export const resultadoOptions = Object.entries(resultadoLabels) as [
  ResultadoInspeccion,
  string,
][];

export const tipoDefectoOptions = Object.entries(tipoDefectoLabels) as [
  TipoDefecto,
  string,
][];

export const mercadoDestinoOptions = Object.entries(mercadoDestinoLabels) as [
  MercadoDestino,
  string,
][];
