/**
 * Validación de formularios con zod, mensajes en español.
 *
 * Patrón usado en toda la app: cada Server Action de creación/edición recibe
 * `(prevState, formData)` (compatible con `useActionState` de React) y
 * devuelve un `FormState` — nunca lanza una excepción por un error de
 * validación esperado (ver node_modules/next/dist/docs/01-app/01-getting-started/10-error-handling.md,
 * "Handling expected errors": modelar como valores de retorno, no con
 * try/catch). Las excepciones (`throw`) quedan reservadas para errores no
 * esperados (bugs, fallas de infraestructura), que sí deben propagar a un
 * error boundary.
 */
import { z } from "zod";
import {
  EspecieFruta,
  EtapaInspeccion,
  MercadoDestino,
  ResultadoInspeccion,
  RolUsuario,
  TipoDefecto,
} from "@prisma/client";

// ---------------------------------------------------------------------------
// Estado genérico de un formulario manejado con useActionState
// ---------------------------------------------------------------------------

export type FormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  ok?: boolean;
};

export const ESTADO_INICIAL: FormState = {};

/**
 * Convierte el resultado de `safeParse` de zod en un `FormState` con
 * mensajes en español, agrupados por campo (`fieldErrors`) para que la UI
 * pueda mostrar el error justo debajo de cada input.
 */
export function estadoDesdeError(error: z.ZodError): FormState {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const campo = issue.path.join(".") || "_general";
    fieldErrors[campo] = [...(fieldErrors[campo] ?? []), issue.message];
  }
  return {
    error: "Revisa los campos marcados: hay datos inválidos o incompletos.",
    fieldErrors,
  };
}

// ---------------------------------------------------------------------------
// Helpers de parseo (FormData trae todo como string | File)
// ---------------------------------------------------------------------------

/** Convierte "" / null / undefined en `undefined`, deja el resto como string. */
function stringOVacio(v: unknown): unknown {
  // `formData.get("campo")` devuelve `null` (no "") cuando el input ni
  // siquiera existe en el DOM — ej: los campos de hidroenfriado, que solo
  // se renderizan para cereza. Sin este caso, un campo ausente terminaba
  // fallando la validación de tipo en vez de tratarse como "sin dato".
  if (v === null || v === undefined) return undefined;
  if (typeof v !== "string") return v;
  const t = v.trim();
  return t === "" ? undefined : t;
}

/** Igual que `stringOVacio` pero intenta parsear el string como número. */
function numeroOVacio(v: unknown): unknown {
  if (v === null || v === undefined) return undefined;
  if (typeof v !== "string") return v;
  const t = v.trim();
  if (t === "") return undefined;
  const n = Number(t);
  return Number.isNaN(n) ? t : n; // si no es número, se deja el string para que falle la validación con un mensaje claro
}

/**
 * Texto obligatorio. Preprocesa a "" (nunca a `undefined`) para que un campo
 * vacío caiga en la validación `.min()` con nuestro mensaje "es
 * obligatorio", en vez de fallar antes por tipo (undefined no es string)
 * con un mensaje genérico.
 *
 * Nota: separado de `textoOpcional` (en vez de un solo helper con flag
 * `requerido`) a propósito — con un único helper, TypeScript infiere el
 * tipo de retorno como la unión de ambas ramas (`string | undefined`)
 * porque no hay overloads, y eso rompe la asignación a campos no-nulables
 * de Prisma en los call sites.
 */
function textoRequerido(etiqueta: string, opts: { min?: number; max?: number } = {}) {
  const { min = 0, max = 500 } = opts;
  const base = z
    .string({ error: `${etiqueta} debe ser texto.` })
    .max(max, `${etiqueta} no puede tener más de ${max} caracteres.`);
  const minEfectivo = Math.max(min, 1);
  const mensaje =
    minEfectivo > 1
      ? `${etiqueta} debe tener al menos ${minEfectivo} caracteres.`
      : `${etiqueta} es obligatorio.`;
  return z.preprocess(
    (v) => (typeof v === "string" ? v.trim() : v === null || v === undefined ? "" : v),
    base.min(minEfectivo, mensaje)
  );
}

function textoOpcional(etiqueta: string, opts: { min?: number; max?: number } = {}) {
  const { min = 0, max = 500 } = opts;
  const base = z
    .string({ error: `${etiqueta} debe ser texto.` })
    .max(max, `${etiqueta} no puede tener más de ${max} caracteres.`);
  const conMin = min > 0 ? base.min(min, `${etiqueta} debe tener al menos ${min} caracteres.`) : base;
  // OJO con el orden: preprocess DEBE ir por fuera de optional(), no al
  // revés. `optional()` solo hace bypass del schema interno cuando el valor
  // crudo YA es `undefined`; un FormData vacío llega como "" (no
  // `undefined`), así que con `optional(preprocess(...))` la conversión
  // "" -> undefined ocurre demasiado tarde (dentro del schema no-opcional) y
  // termina fallando con "debe ser texto". `preprocess(fn, optional(base))`
  // convierte primero y recién después optional() ve el `undefined`.
  return z.preprocess(stringOVacio, z.optional(conMin));
}

function schemaNumero(
  etiqueta: string,
  opts: { min?: number; max?: number; entero?: boolean } = {}
) {
  const { min, max, entero = false } = opts;
  let base = z.number({ error: `${etiqueta} debe ser un número válido.` });
  if (entero) base = base.int(`${etiqueta} debe ser un número entero.`);
  if (min !== undefined) base = base.min(min, `${etiqueta} no puede ser menor que ${min}.`);
  if (max !== undefined) base = base.max(max, `${etiqueta} no puede ser mayor que ${max}.`);
  return z.preprocess(numeroOVacio, z.optional(base));
}

function schemaFecha(etiqueta: string) {
  return z.preprocess(stringOVacio, z.optional(z.iso.date(`${etiqueta} no es una fecha válida.`)));
}

// ---------------------------------------------------------------------------
// Cliente
// ---------------------------------------------------------------------------

export const clienteSchema = z.object({
  nombre: textoRequerido("El nombre", { min: 2, max: 200 }),
  rut: textoOpcional("El RUT", { max: 20 }),
  contacto: textoOpcional("El contacto", { max: 200 }),
  email: z.preprocess(
    stringOVacio,
    z.optional(z.email("El correo electrónico no es válido.").max(200))
  ),
  telefono: textoOpcional("El teléfono", { max: 50 }),
  direccion: textoOpcional("La dirección", { max: 300 }),
  notas: textoOpcional("Las notas", { max: 2000 }),
});

export type ClienteInput = z.infer<typeof clienteSchema>;

// ---------------------------------------------------------------------------
// Productor
// ---------------------------------------------------------------------------

export const productorSchema = z.object({
  nombre: textoRequerido("El nombre", { min: 2, max: 200 }),
  rut: textoOpcional("El RUT", { max: 20 }),
  contacto: textoOpcional("El contacto", { max: 200 }),
  email: z.preprocess(
    stringOVacio,
    z.optional(z.email("El correo electrónico no es válido.").max(200))
  ),
  telefono: textoOpcional("El teléfono", { max: 50 }),
  direccion: textoOpcional("La dirección", { max: 300 }),
  notas: textoOpcional("Las notas", { max: 2000 }),
});

export type ProductorInput = z.infer<typeof productorSchema>;

// ---------------------------------------------------------------------------
// Usuario
// ---------------------------------------------------------------------------

/**
 * Mínimo de 4 caracteres a propósito, sin exigir mayúsculas/números/símbolos:
 * mientras el sistema esté en uso interno reducido, cuentas simples tipo
 * "admin" deben poder crearse sin fricción. Endurecer esto (o agregar
 * recuperación de contraseña) es trabajo pendiente, no un olvido — ver README
 * "Qué falta por hacer".
 */
export const passwordSchema = z.preprocess(
  stringOVacio,
  z.optional(
    z
      .string({ error: "La contraseña debe ser texto." })
      .min(4, "La contraseña debe tener al menos 4 caracteres.")
      .max(100, "La contraseña no puede tener más de 100 caracteres.")
  )
);

export const usuarioSchema = z.object({
  nombre: textoRequerido("El nombre", { min: 2, max: 200 }),
  email: z.preprocess(
    stringOVacio,
    z.string({ error: "El correo es obligatorio." }).pipe(
      z.email("El correo electrónico no es válido.").max(200)
    )
  ),
  password: passwordSchema,
  rol: z.preprocess(stringOVacio, z.enum(RolUsuario, "Selecciona un rol válido.")),
  activo: z.preprocess((v) => v === "on", z.boolean()),
});

export type UsuarioInput = z.infer<typeof usuarioSchema>;

// ---------------------------------------------------------------------------
// Lote
// ---------------------------------------------------------------------------

export const loteSchema = z.object({
  codigo: textoRequerido("El código", { min: 2, max: 50 }),
  clienteId: textoRequerido("El cliente"),
  especie: z.preprocess(
    stringOVacio,
    z.enum(EspecieFruta, "Selecciona una especie válida.")
  ),
  variedad: textoRequerido("La variedad", { min: 1, max: 100 }),
  productorId: textoRequerido("El productor"),
  ubicacionPacking: textoRequerido("El packing", { min: 1, max: 200 }),
  temporada: textoRequerido("La temporada", { min: 4, max: 20 }),
  fechaCosecha: schemaFecha("La fecha de cosecha"),
  cajasTotales: schemaNumero("Las cajas totales", { min: 0, entero: true }),
  kgTotales: schemaNumero("Los kg totales", { min: 0 }),
  calibrePredominante: textoOpcional("El calibre predominante", { max: 50 }),
  mercadoDestino: z.preprocess(
    stringOVacio,
    z.optional(z.enum(MercadoDestino, "Selecciona un mercado válido."))
  ),
  notas: textoOpcional("Las notas", { max: 2000 }),
});

export type LoteInput = z.infer<typeof loteSchema>;

// ---------------------------------------------------------------------------
// Inspección (campos escalares — los defectos se validan aparte, ver abajo)
// ---------------------------------------------------------------------------

export const inspeccionSchema = z.object({
  loteId: textoRequerido("El lote"),
  inspectorId: textoRequerido("El inspector"),
  fecha: schemaFecha("La fecha"),
  etapa: z.preprocess(
    stringOVacio,
    z.optional(z.enum(EtapaInspeccion, "Selecciona una etapa válida."))
  ),
  resultado: z.preprocess(
    stringOVacio,
    z.optional(z.enum(ResultadoInspeccion, "Selecciona un resultado válido."))
  ),
  calibre: textoOpcional("El calibre", { max: 50 }),
  color: textoOpcional("El color", { max: 100 }),
  colorPorcentajeDark: schemaNumero("El % Dark", { min: 0, max: 100 }),
  colorPorcentajeLight: schemaNumero("El % Light", { min: 0, max: 100 }),
  firmeza: schemaNumero("La firmeza", { min: 0, max: 1000 }),
  brixGrados: schemaNumero("El °Brix", { min: 0, max: 100 }),
  acidez: schemaNumero("La acidez", { min: 0, max: 100 }),
  pesoMuestraKg: schemaNumero("El peso de muestra", { min: 0, max: 10000 }),
  muestraCajas: schemaNumero("El n° de cajas muestreadas", { min: 0, entero: true }),
  muestraUnidades: schemaNumero("El n° de unidades muestreadas", { min: 0, entero: true }),
  hidrocoolerTempAguaC: schemaNumero("La T° de agua", { min: -10, max: 50 }),
  hidrocoolerCloroLibrePpm: schemaNumero("El cloro libre", { min: 0, max: 1000 }),
  hidrocoolerTiempoExposicionMin: schemaNumero("El tiempo de exposición", { min: 0, max: 600 }),
  hidrocoolerTempPulpaPostC: schemaNumero("La T° de pulpa post-hidrocooler", { min: -10, max: 50 }),
  presizerNumeroBin: textoOpcional("El n° de bin", { max: 50 }),
  presizerDistribucionCalibres: textoOpcional("La distribución de calibres", { max: 1000 }),
  presizerDistribucionColor: textoOpcional("La distribución de color", { max: 1000 }),
  presizerFalsoRechazoPct: schemaNumero("El % de falso rechazo", { min: 0, max: 100 }),
  presizerFalsoAceptadoPct: schemaNumero("El % de falso aceptado", { min: 0, max: 100 }),
  presizerImpactosNuevosPct: schemaNumero("El % de impactos nuevos", { min: 0, max: 100 }),
  presizerPerdidaPedicelo: textoOpcional("La pérdida de pedicelo", { max: 200 }),
  porcentajeRechazo: schemaNumero("El % de rechazo", { min: 0, max: 100 }),
  observaciones: textoOpcional("Las observaciones", { max: 4000 }),
});

export type InspeccionInput = z.infer<typeof inspeccionSchema>;

const defectoSchema = z.object({
  tipo: z.enum(TipoDefecto, "Tipo de defecto inválido."),
  porcentaje: schemaNumero("El % del defecto", { min: 0, max: 100 }),
  cantidad: schemaNumero("La cantidad del defecto", { min: 0, entero: true }),
});

export type DefectoInput = z.infer<typeof defectoSchema>;

const MAX_DEFECTOS = 10;

/**
 * Extrae y valida las filas de defectos del formulario (`defectoTipo_0`,
 * `defectoPorcentaje_0`, `defectoCantidad_0`, ...). Devuelve las filas
 * válidas, o un `FormState` con errores si alguna fila es inválida. Las
 * filas vacías (sin tipo seleccionado) se ignoran silenciosamente.
 *
 * `opts.prefix` permite reusar el mismo parseo con otro juego de nombres de
 * campo (ej. `muestraDefecto` para el form de Muestra, que convive en la
 * misma página con las filas de defectos de otro formulario) y `opts.max`
 * baja el tope de filas cuando el formulario es más acotado.
 */
export function parsearDefectos(
  formData: FormData,
  opts: { prefix?: string; max?: number } = {}
): { defectos: DefectoInput[] } | { error: FormState } {
  const { prefix = "defecto", max = MAX_DEFECTOS } = opts;
  const defectos: DefectoInput[] = [];
  const fieldErrors: Record<string, string[]> = {};

  for (let i = 0; i < max; i++) {
    const tipo = formData.get(`${prefix}Tipo_${i}`);
    if (typeof tipo !== "string" || tipo.trim() === "") continue;

    const resultado = defectoSchema.safeParse({
      tipo,
      porcentaje: formData.get(`${prefix}Porcentaje_${i}`),
      cantidad: formData.get(`${prefix}Cantidad_${i}`),
    });

    if (!resultado.success) {
      for (const issue of resultado.error.issues) {
        const campo = `${prefix}_${i}_${issue.path.join(".")}`;
        fieldErrors[campo] = [...(fieldErrors[campo] ?? []), issue.message];
      }
      continue;
    }

    // Fila sin porcentaje ni cantidad: se ignora (no aporta información).
    if (resultado.data.porcentaje === undefined && resultado.data.cantidad === undefined) {
      continue;
    }

    defectos.push(resultado.data);
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      error: {
        error: "Revisa los defectos marcados: hay datos inválidos.",
        fieldErrors,
      },
    };
  }

  return { defectos };
}

// ---------------------------------------------------------------------------
// Muestra (dentro de una Inspección)
// ---------------------------------------------------------------------------

export const muestraSchema = z.object({
  embalaje: textoRequerido("El embalaje", { min: 1, max: 100 }),
  etiqueta: textoOpcional("La etiqueta", { max: 100 }),
  calibre: textoOpcional("El calibre", { max: 50 }),
  nFrutos: schemaNumero("El n° de frutos", { min: 0, entero: true }),
  pesoKg: schemaNumero("El peso", { min: 0, max: 10000 }),
  nSalida: textoOpcional("El n° de salida", { max: 50 }),
  embaladora: textoOpcional("La embaladora", { max: 100 }),
  sinPLU: schemaNumero("Sin PLU", { min: 0, entero: true }),
  conPLU: schemaNumero("Con PLU", { min: 0, entero: true }),
  sobreCalibrePct: schemaNumero("El % sobre calibre", { min: 0, max: 100 }),
  bajoCalibrePct: schemaNumero("El % bajo calibre", { min: 0, max: 100 }),
  notaApertura: textoOpcional("La nota de apertura", { max: 500 }),
  notaEmbalaje: textoOpcional("La nota de embalaje", { max: 500 }),
  hora: textoOpcional("La hora", { max: 10 }),
});

export type MuestraInput = z.infer<typeof muestraSchema>;
