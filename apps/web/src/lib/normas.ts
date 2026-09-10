import { EspecieFruta, FirmezaUnidad, TipoDefecto, type MercadoDestino } from "@prisma/client";
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
  BLANDURA: "CONDICION", // ablandamiento fisiológico, evoluciona en tránsito
  OTRO: "CONDICION",

  // Catálogo ampliado manzana/pera/kiwi — clasificación tomada directo de la
  // columna "Q/C" (USDA Quality/Condition) de
  // docs/research/estandares-defectos-calidad.md §4: Quality = permanente,
  // ya estaba al empacar => CALIDAD; Condition = puede aparecer/agravarse en
  // tránsito => CONDICIÓN.
  CORTE_HERIDA: "CALIDAD",
  ROCE_RAMA: "CALIDAD",
  PICADURA_INSECTO_SANA: "CALIDAD",
  PERFORACION_GUSANO: "CALIDAD",
  DANO_ACARO: "CALIDAD",
  DANO_ESCAMA: "CALIDAD",
  PUDRICION_AZUL: "CONDICION",
  PUDRICION_GRIS: "CONDICION",
  PUDRICION_AMARGA: "CONDICION",
  PUDRICION_MUCOR: "CONDICION",
  PUDRICION_PEDUNCULAR: "CONDICION",
  BITTER_PIT: "CALIDAD",
  ESCALDADO_SUPERFICIAL: "CONDICION",
  ESCALDADO_SENESCENTE: "CONDICION",
  CORAZON_ACUOSO: "CALIDAD",
  MANCHA_CORCHOSA_ANJOU: "CALIDAD",
  DEGENERACION_PULPA: "CONDICION",
  DANO_FRIO: "CONDICION",
  DEFECTO_COLOR: "CALIDAD",
  FRUTA_APLANADA: "CALIDAD",
  MARCHITAMIENTO: "CONDICION", // pérdida de agua progresiva, igual criterio que PEDICELO_SECO
};

// ---------------------------------------------------------------------------
// Defectos relevantes por especie — usado para filtrar el selector de
// "Tipo de defecto" en el formulario de inspección (evita mostrar el
// catálogo completo, con términos de otra especie, en cada fila).
// ---------------------------------------------------------------------------

/** Comodines disponibles para cualquier especie. */
const defectosComodin: TipoDefecto[] = [TipoDefecto.OTRO];

export const defectosPorEspecie: Record<EspecieFruta, TipoDefecto[]> = {
  MANZANA: [
    TipoDefecto.MAGULLADURA,
    TipoDefecto.PITTING,
    TipoDefecto.CORTE_HERIDA,
    TipoDefecto.ROCE_RAMA,
    TipoDefecto.DANO_GRANIZO,
    TipoDefecto.QUEMADURA_SOL,
    TipoDefecto.PICADURA_INSECTO_SANA,
    TipoDefecto.PERFORACION_GUSANO,
    TipoDefecto.DANO_ESCAMA,
    TipoDefecto.PUDRICION_AZUL,
    TipoDefecto.PUDRICION_GRIS,
    TipoDefecto.PUDRICION_AMARGA,
    TipoDefecto.PUDRICION_MUCOR,
    TipoDefecto.BITTER_PIT,
    TipoDefecto.ESCALDADO_SUPERFICIAL,
    TipoDefecto.CORAZON_ACUOSO,
    TipoDefecto.RUSSET,
    TipoDefecto.DEFORME,
    TipoDefecto.MANCHA,
    TipoDefecto.DEFECTO_COLOR,
    ...defectosComodin,
  ],
  PERA: [
    TipoDefecto.MAGULLADURA,
    TipoDefecto.PITTING,
    TipoDefecto.CORTE_HERIDA,
    TipoDefecto.ROCE_RAMA,
    TipoDefecto.PICADURA_INSECTO_SANA,
    TipoDefecto.PERFORACION_GUSANO,
    TipoDefecto.DANO_ACARO,
    TipoDefecto.PUDRICION_AZUL,
    TipoDefecto.PUDRICION_GRIS,
    TipoDefecto.ESCALDADO_SUPERFICIAL,
    TipoDefecto.ESCALDADO_SENESCENTE,
    TipoDefecto.MANCHA_CORCHOSA_ANJOU,
    TipoDefecto.DEGENERACION_PULPA,
    TipoDefecto.RUSSET,
    TipoDefecto.DEFORME,
    TipoDefecto.MANCHA,
    ...defectosComodin,
  ],
  KIWI: [
    TipoDefecto.MAGULLADURA,
    TipoDefecto.PITTING,
    TipoDefecto.CORTE_HERIDA,
    TipoDefecto.ROCE_RAMA,
    TipoDefecto.PARTIDURA_CRACKING,
    TipoDefecto.DANO_ESCAMA,
    TipoDefecto.PUDRICION_GRIS,
    TipoDefecto.PUDRICION_PEDUNCULAR,
    TipoDefecto.DANO_FRIO,
    TipoDefecto.BLANDURA,
    TipoDefecto.DEFORME,
    TipoDefecto.FRUTA_APLANADA,
    TipoDefecto.MARCHITAMIENTO,
    TipoDefecto.INMADURO,
    ...defectosComodin,
  ],
  // Catálogo real de campo, sin cambios (ver comentario del enum en el schema).
  CEREZA: [
    TipoDefecto.RUSSET,
    TipoDefecto.FUERA_DE_COLOR,
    TipoDefecto.AUSENCIA_PEDICELO,
    TipoDefecto.DEFORME,
    TipoDefecto.MANCHA,
    TipoDefecto.SOBREMADURO,
    TipoDefecto.PARTIDURA_CRACKING,
    TipoDefecto.HERIDA_ABIERTA,
    TipoDefecto.PUDRICION_HUMEDA,
    TipoDefecto.PUDRICION_SECA,
    TipoDefecto.PITTING,
    TipoDefecto.MAGULLADURA,
    TipoDefecto.PEDICELO_SECO,
    TipoDefecto.MEDIALUNA,
    TipoDefecto.QUEMADURA_SOL,
    ...defectosComodin,
  ],
  // Especies fuera del alcance de esta ampliación: se dejan con el catálogo
  // legado que ya tenían más el comodín, para no perder opciones existentes.
  UVA_DE_MESA: [
    TipoDefecto.DESGRANE,
    TipoDefecto.PEDICELO_SECO,
    TipoDefecto.PUDRICION_HUMEDA,
    TipoDefecto.PARTIDURA_CRACKING,
    ...defectosComodin,
  ],
  ARANDANO: [
    TipoDefecto.BLANDURA,
    TipoDefecto.PUDRICION_HUMEDA,
    TipoDefecto.INMADURO,
    TipoDefecto.MANCHA,
    ...defectosComodin,
  ],
  CIRUELA: [TipoDefecto.MAGULLADURA, TipoDefecto.PARTIDURA_CRACKING, ...defectosComodin],
  OTRO: defectosComodin,
};

// ---------------------------------------------------------------------------
// Tolerancia de 3 niveles para cereza
// ---------------------------------------------------------------------------

export type ResultadoCereza = "CATEGORIA_1" | "CATEGORIA_2" | "OBJETADO";

export type DefectoEvaluable = { tipo: TipoDefecto; porcentaje: number | null | undefined };

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
// Clasificación de una Muestra individual (calidad A/B/C, condición 1-3)
// ---------------------------------------------------------------------------

export type ClasificacionMuestra = {
  calidad: "A" | "B" | "C";
  condicion: 1 | 2 | 3;
  causaCalidad: string | null;
  causaCondicion: string | null;
};

/**
 * ⚠️ UMBRALES PROVISIONALES — sin validar todavía con el dueño.
 *
 * A diferencia de `evaluarResultadoCereza` (cuyos cortes 6%/12% sí vienen
 * del manual operativo real de Apex Fruit), no existe ninguna fuente real
 * que defina cortes de A/B/C ni de condición 1/2/3 para una muestra
 * individual — esto es una propuesta de modelado propia, que reusa los
 * mismos cortes 6%/12% de condición por consistencia con la regla que ya
 * se usa a nivel de inspección completa. Antes de usar esto para decisiones
 * reales de negocio (rechazar/aceptar una muestra), hay que revisarlo con
 * el dueño y ajustar los números si no calzan con su criterio real.
 */
export function clasificarMuestra(defectos: DefectoEvaluable[]): ClasificacionMuestra {
  const sumaCalidad = defectos
    .filter((d) => categoriaDefecto[d.tipo] === "CALIDAD")
    .reduce((acc, d) => acc + (d.porcentaje ?? 0), 0);
  const sumaCondicion = defectos
    .filter((d) => categoriaDefecto[d.tipo] === "CONDICION")
    .reduce((acc, d) => acc + (d.porcentaje ?? 0), 0);

  const calidad: "A" | "B" | "C" = sumaCalidad <= 5 ? "A" : sumaCalidad <= 15 ? "B" : "C";
  const condicion: 1 | 2 | 3 = sumaCondicion <= 6 ? 1 : sumaCondicion <= 12 ? 2 : 3;

  const causaCalidad =
    calidad === "A"
      ? null
      : `Calidad ${calidad} por: defectos de calidad suman ${sumaCalidad.toFixed(1)}% de la muestra.`;
  const causaCondicion =
    condicion === 1
      ? null
      : `Condición ${condicion} por: defectos de condición suman ${sumaCondicion.toFixed(1)}% de la muestra.`;

  return { calidad, condicion, causaCalidad, causaCondicion };
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
 * Unidad de firmeza real por especie (manzana/pera -> kgF, cereza -> UD
 * Durofel, kiwi -> libras). Se deriva server-side de la especie del lote
 * para no depender de que el cliente la mande "bien". Vive en este módulo
 * (y no en un archivo de Server Actions) porque es una función síncrona —
 * un archivo con "use server" solo puede exportar funciones async.
 */
export function firmezaUnidadPorEspecie(especie: EspecieFruta): FirmezaUnidad | undefined {
  switch (especie) {
    case EspecieFruta.MANZANA:
    case EspecieFruta.PERA:
      return FirmezaUnidad.KGF;
    case EspecieFruta.CEREZA:
      return FirmezaUnidad.UD_DUROFEL;
    case EspecieFruta.KIWI:
      return FirmezaUnidad.LBS;
    default:
      return undefined;
  }
}

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

// ---------------------------------------------------------------------------
// Tamaño de muestra sugerido (plan de muestreo simplificado, USDA/ISO 2859)
// ---------------------------------------------------------------------------

/**
 * Tramos de tamaño de lote (n° de cajas) y n° de cajas a muestrear, según el
 * plan de muestreo simplificado de docs/research/estandares-defectos-calidad.md
 * §2.1/2.3 (USDA Lot Single Sampling Plan, tamaño de unidad de muestra = 6):
 * 6/13/21/29 cajas según el tramo del lote.
 *
 * La fuente da los 4 tramos (pequeño/mediano/grande/muy grande) y sus
 * tamaños de muestra, pero no publica los cortes exactos de n° de cajas por
 * tramo para un producto genérico (varían por commodity en la tabla oficial
 * completa) — los cortes de abajo son una aproximación razonable propia,
 * no un dato tomado literal de la fuente.
 */
const TRAMOS_MUESTREO: { hastaCajas: number; cajasMuestra: number }[] = [
  { hastaCajas: 500, cajasMuestra: 6 },
  { hastaCajas: 1200, cajasMuestra: 13 },
  { hastaCajas: 3200, cajasMuestra: 21 },
  { hastaCajas: Infinity, cajasMuestra: 29 },
];

/**
 * N° de cajas mínimo sugerido para muestrear, dado el tamaño total del lote
 * (en cajas). Cada caja de muestra implica revisar ~6 frutos, así que el
 * mínimo de frutos sugerido es `cajasMuestra * 6`. Devuelve `null` si no hay
 * `cajasTotales` con qué comparar — este cálculo es solo una guía en la UI,
 * nunca bloquea el guardado.
 */
export function tamanoMuestraSugerido(
  cajasTotales: number | null | undefined
): { cajasMuestra: number; frutosMinimos: number } | null {
  if (cajasTotales === null || cajasTotales === undefined || cajasTotales <= 0) return null;
  const tramo = TRAMOS_MUESTREO.find((t) => cajasTotales <= t.hastaCajas)!;
  return { cajasMuestra: tramo.cajasMuestra, frutosMinimos: tramo.cajasMuestra * 6 };
}
