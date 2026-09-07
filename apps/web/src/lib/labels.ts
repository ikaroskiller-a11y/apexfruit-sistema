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

export const resultadoBadgeClasses: Record<ResultadoInspeccion, string> = {
  APROBADO: "bg-brand-leaf/20 text-brand-800 ring-1 ring-inset ring-brand-leaf/40",
  APROBADO_CON_OBSERVACIONES:
    "bg-brand-gold/20 text-amber-900 ring-1 ring-inset ring-brand-gold/50",
  RECHAZADO: "bg-red-100 text-red-800 ring-1 ring-inset ring-red-300",
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
