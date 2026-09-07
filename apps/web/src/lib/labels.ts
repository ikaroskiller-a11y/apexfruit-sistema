import type {
  EspecieFruta,
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

export const resultadoLabels: Record<ResultadoInspeccion, string> = {
  APROBADO: "Aprobado",
  APROBADO_CON_OBSERVACIONES: "Aprobado con observaciones",
  RECHAZADO: "Rechazado",
};

// Mapea el resultado de una inspección a uno de los 4 estados semánticos
// del panel (guía de diseño §1.2). Se usa junto con <Badge status={...}>,
// que agrega ícono + tinte de fondo — el estado nunca se comunica solo con
// color ni solo con texto suelto.
export const resultadoStatusMap: Record<
  ResultadoInspeccion,
  "success" | "warning" | "danger"
> = {
  APROBADO: "success",
  APROBADO_CON_OBSERVACIONES: "warning",
  RECHAZADO: "danger",
};

export const rolLabels: Record<RolUsuario, string> = {
  ADMINISTRADOR: "Administrador",
  INSPECTOR: "Inspector",
};

export const tipoDefectoLabels: Record<TipoDefecto, string> = {
  PUDRICION: "Pudrición",
  MAGULLADURA: "Magulladura",
  RUSSET: "Russet",
  PARTIDURA_CRACKING: "Partidura / Cracking",
  DEFORME: "Deforme",
  MANCHA: "Mancha",
  DANO_INSECTO: "Daño por insecto",
  INMADURO: "Inmaduro",
  SOBREMADURO: "Sobremaduro",
  DANO_GRANIZO: "Daño por granizo",
  QUEMADURA_SOL: "Quemadura de sol",
  PEDICELO_SECO: "Pedicelo seco",
  DESGRANE: "Desgrane",
  BLANDURA: "Blandura",
  OTRO: "Otro",
};

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
