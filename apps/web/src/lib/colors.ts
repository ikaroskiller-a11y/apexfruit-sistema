import type { EspecieFruta } from "@prisma/client";

/**
 * Color categórico por variedad para gráficos (guía de diseño §1.3).
 * Se referencian como custom property CSS ("var(--color-variedad-x)") en vez
 * de hex fijo para que los gráficos (recharts) respondan solos al toggle de
 * modo oscuro sin lógica adicional — los valores light/dark de cada token
 * viven en globals.css.
 *
 * Manzana y cereza mantienen su hue original. Kiwi y pera heredan los hues
 * que en la guía original correspondían a arándano y uva de mesa (el demo
 * cambió esas 2 frutas por kiwi/pera — ver prisma/seed.ts). Arándano y uva
 * de mesa, si volvieran a aparecer, y ciruela/otro usan el gris neutro de
 * fallback para no pisar un hue ya asignado a una variedad activa.
 */
export const especieColorVar: Record<EspecieFruta, string> = {
  MANZANA: "var(--color-variedad-manzana)",
  PERA: "var(--color-variedad-pera)",
  KIWI: "var(--color-variedad-kiwi)",
  CEREZA: "var(--color-variedad-cereza)",
  ARANDANO: "var(--color-variedad-otro)",
  UVA_DE_MESA: "var(--color-variedad-otro)",
  CIRUELA: "var(--color-variedad-otro)",
  OTRO: "var(--color-variedad-otro)",
};
