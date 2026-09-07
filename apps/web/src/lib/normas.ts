import type { MercadoDestino, TipoDefecto } from "@prisma/client";
import { mercadoDestinoLabels } from "@/lib/labels";

/**
 * Reglas de negocio / normas de calidad reales de Apex Fruit.
 *
 * Fuente: docs/research/material-existente.md (plantilla de campo, manual
 * operativo de cereza y norma de un cliente exportador de kiwi). Todo lo
 * que aquí se implementa está descrito ahí; los umbrales que el material
 * no especifica exactamente quedan documentados con un comentario breve
 * explicando el criterio usado.
 *
 * Alcance actual: un único estándar global (materia prima), no hay perfiles
 * de norma por cliente ni tabla separada de producto terminado (queda
 * pendiente para otra fase, ver sección 8 del documento de investigación).
 */

// ---------------------------------------------------------------------------
// Catálogo de defectos de cereza — categoría (CALIDAD no detiene el lote,
// CONDICIÓN sí puede gatillar objeción). Lookup en código, no columna en BD.
// ---------------------------------------------------------------------------

export type CategoriaDefecto = "CALIDAD" | "CONDICION";

export const categoriaDefecto: Record<TipoDefecto, CategoriaDefecto> = {
  // Calidad (cereza)
  RUSSET: "CALIDAD",
  FUERA_DE_COLOR: "CALIDAD",
  AUSENCIA_PEDICELO: "CALIDAD",
  DEFORME: "CALIDAD",
  MANCHA: "CALIDAD",

  // Condición (cereza)
  SOBREMADURO: "CONDICION",
  PARTIDURA_CRACKING: "CONDICION",
  HERIDA_ABIERTA: "CONDICION",
  PUDRICION_HUMEDA: "CONDICION",
  PUDRICION_SECA: "CONDICION",
  PITTING: "CONDICION",
  MAGULLADURA: "CONDICION",
  PEDICELO_SECO: "CONDICION",
  MEDIALUNA: "CONDICION",
  QUEMADURA_SOL: "CONDICION",

  // Otras especies / legado: no forman parte del catálogo real de cereza,
  // se clasifican con el mejor criterio disponible por si se registran.
  DANO_INSECTO: "CONDICION",
  INMADURO: "CALIDAD",
  DANO_GRANIZO: "CALIDAD",
  DESGRANE: "CONDICION",
  BLANDURA: "CONDICION",
  OTRO: "CONDICION",
};

// ---------------------------------------------------------------------------
// Tolerancia de 3 niveles para cereza
// ---------------------------------------------------------------------------

export type ResultadoCereza = "CATEGORIA_1" | "CATEGORIA_2" | "OBJETADO";

type DefectoEvaluable = { tipo: TipoDefecto; porcentaje: number | null | undefined };

/**
 * Criterio de objeción real (manual operativo Apex Fruit, materia prima):
 * - Suma de % de defectos de CONDICIÓN > 12% => Objetado.
 * - Pudrición húmeda sola > 1% => Objetado, aunque el resto esté bien.
 *
 * El documento no da un corte exacto entre Categoría 1 y Categoría 2 cuando
 * no se gatilla objeción, así que se usa un criterio propio razonable:
 * condición entre 6% y 12% => Categoría 2 (hay defectos de condición que
 * ameritan seguimiento, pero no cruzan el máximo); por debajo de 6% =>
 * Categoría 1. Esto es una decisión de modelado, no un dato de la fuente.
 */
export function evaluarResultadoCereza(defectos: DefectoEvaluable[]): ResultadoCereza {
  const sumaCondicion = defectos
    .filter((d) => categoriaDefecto[d.tipo] === "CONDICION")
    .reduce((acc, d) => acc + (d.porcentaje ?? 0), 0);

  const pudricionHumeda = defectos
    .filter((d) => d.tipo === "PUDRICION_HUMEDA")
    .reduce((acc, d) => acc + (d.porcentaje ?? 0), 0);

  if (pudricionHumeda > 1 || sumaCondicion > 12) return "OBJETADO";
  if (sumaCondicion > 6) return "CATEGORIA_2";
  return "CATEGORIA_1";
}

/** Explica en lenguaje llano por qué una inspección quedó objetada. */
export function criterioObjecionCereza(defectos: DefectoEvaluable[]): string | null {
  const sumaCondicion = defectos
    .filter((d) => categoriaDefecto[d.tipo] === "CONDICION")
    .reduce((acc, d) => acc + (d.porcentaje ?? 0), 0);

  const pudricionHumeda = defectos
    .filter((d) => d.tipo === "PUDRICION_HUMEDA")
    .reduce((acc, d) => acc + (d.porcentaje ?? 0), 0);

  if (pudricionHumeda > 1) {
    return `Objetado por: pudrición húmeda ${pudricionHumeda.toFixed(1)}% supera el máximo tolerado de 1%.`;
  }
  if (sumaCondicion > 12) {
    return `Objetado por: suma de defectos de condición ${sumaCondicion.toFixed(1)}% supera el máximo de 12%.`;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Firmeza Durofel (cereza) — clasificación y recomendación de embarque
// ---------------------------------------------------------------------------

export type ClasificacionFirmezaCereza = {
  clasificacion: "Muy Firme" | "Firme" | "Blanda" | "Muy Blanda";
  embarqueRecomendado: string;
};

/**
 * Clasificación de firmeza Durofel (UD) y recomendación de tipo de
 * embarque, tal como la calcula la herramienta real de recepción de
 * cerezas (index.html, ver docs/research/material-existente.md §1).
 */
export function clasificarFirmezaCereza(ud: number): ClasificacionFirmezaCereza {
  if (ud >= 75) {
    return {
      clasificacion: "Muy Firme",
      embarqueRecomendado: "Marítimo · mercados lejanos (China, Asia Premium)",
    };
  }
  if (ud >= 70) {
    return {
      clasificacion: "Firme",
      embarqueRecomendado: "Marítimo · mercados cercanos",
    };
  }
  if (ud >= 65) {
    return {
      clasificacion: "Blanda",
      embarqueRecomendado: "Aéreo / terrestre",
    };
  }
  return {
    clasificacion: "Muy Blanda",
    embarqueRecomendado: "Aéreo / terrestre",
  };
}

// ---------------------------------------------------------------------------
// Firmeza mínima de kiwi por mercado de destino
// ---------------------------------------------------------------------------

/**
 * Firmeza mínima exigida (libras) por mercado de destino para kiwi, según
 * norma real de un cliente exportador (NC-KIW-CE-01, Exportadora Andes
 * Bhumi). `null` = sin umbral definido / no se valida.
 */
export const firmezaMinimaKiwiLbs: Record<MercadoDestino, number | null> = {
  USA: 6,
  EUROPA: 10,
  JAPON: 12,
  COREA: 12,
  CHINA: 12,
  INDIA: 12,
  LATAM: 6,
  OTRO: null,
};

/**
 * Devuelve un texto de aviso si la firmeza de kiwi está bajo el mínimo
 * exigido para el mercado de destino del lote, o `null` si cumple / no
 * aplica validación.
 */
export function avisoFirmezaKiwi(
  mercado: MercadoDestino | null | undefined,
  firmezaLbs: number | null | undefined
): string | null {
  if (!mercado || firmezaLbs === null || firmezaLbs === undefined) return null;
  const minimo = firmezaMinimaKiwiLbs[mercado];
  if (minimo === null) return null;
  if (firmezaLbs < minimo) {
    return `Bajo el mínimo exigido para ${mercadoDestinoLabels[mercado]} (${minimo} lb)`;
  }
  return null;
}
