"use client";

import { useActionState, useMemo, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  Camera,
  ClipboardList,
  Droplets,
  Gauge,
  MessageSquareText,
  Plus,
  X,
} from "lucide-react";
import {
  especieLabels,
  resultadoOptions,
  etapaInspeccionOptions,
  tipoDefectoLabels,
  calibresCereza,
  calibresCerezaPremiumAsia,
} from "@/lib/labels";
import { defectosPorEspecie, tamanoMuestraSugerido } from "@/lib/normas";
import { Field, campoClase, FormErrorBanner } from "@/components/ui/FormField";
import { Card, CardTitle } from "@/components/ui/Card";
import { ESTADO_INICIAL, type FormState } from "@/lib/validation";
import type { EspecieFruta, TipoDefecto } from "@prisma/client";
import type { SesionUsuario } from "@/lib/auth";

type LoteOpcion = {
  id: string;
  codigo: string;
  variedad: string;
  especie: EspecieFruta;
  cajasTotales: number | null;
  cliente: { nombre: string };
};

type InspectorOpcion = {
  id: string;
  nombre: string;
};

type DefectoExistente = {
  tipo: TipoDefecto;
  porcentaje: number | null;
  cantidad: number | null;
};

type FotoExistente = {
  id: string;
  url: string;
  descripcion: string | null;
};

export type InspeccionExistente = {
  id: string;
  loteId: string;
  inspectorId: string;
  fecha: Date;
  etapa: string;
  resultado: string;
  calibre: string | null;
  color: string | null;
  colorPorcentajeDark: number | null;
  colorPorcentajeLight: number | null;
  firmeza: number | null;
  brixGrados: number | null;
  acidez: number | null;
  pesoMuestraKg: number | null;
  muestraCajas: number | null;
  muestraUnidades: number | null;
  hidrocoolerTempAguaC: number | null;
  hidrocoolerCloroLibrePpm: number | null;
  hidrocoolerTiempoExposicionMin: number | null;
  hidrocoolerTempPulpaPostC: number | null;
  hidrocoolerEsperaMasDeUnaHora: boolean | null;
  porcentajeRechazo: number | null;
  observaciones: string | null;
  defectos: DefectoExistente[];
  fotos: FotoExistente[];
};

const MAX_DEFECTOS = 10;

// Título de sección con ícono: reutiliza CardTitle (mismo componente que las
// pantallas de detalle) con un ícono adelante que ayuda a ubicar cada bloque
// de un vistazo en un formulario largo — la señal no es decorativa, marca de
// qué tema es cada tarjeta sin tener que leer el título completo.
function SectionTitle({
  icon: Icon,
  children,
  className = "",
}: {
  icon: typeof Gauge;
  children: ReactNode;
  className?: string;
}) {
  return (
    <CardTitle className={className}>
      <span className="flex items-center gap-2">
        <Icon className="h-4 w-4 shrink-0 text-brand-700 dark:text-brand-500" aria-hidden />
        {children}
      </span>
    </CardTitle>
  );
}

export default function InspeccionForm({
  lotes,
  inspectores,
  usuarioActual,
  action,
  inspeccion,
}: {
  lotes: LoteOpcion[];
  inspectores: InspectorOpcion[];
  usuarioActual: SesionUsuario | null;
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  /** Presente en modo edición; ausente al crear una inspección nueva. */
  inspeccion?: InspeccionExistente;
}) {
  const [state, formAction, pending] = useActionState(action, ESTADO_INICIAL);
  const errores = state.fieldErrors ?? {};

  // Un inspector registra sus propias inspecciones — no puede elegir a otra
  // persona en el select. Un administrador sí puede (ej: cargar una
  // inspección en nombre de otro inspector). El server action vuelve a
  // forzar esto igual, así que esto es solo comodidad de UI, no el control
  // de seguridad real.
  const puedeElegirInspector = usuarioActual?.rol === "ADMINISTRADOR";
  const [loteId, setLoteId] = useState(inspeccion?.loteId ?? "");
  const [fotosAEliminar, setFotosAEliminar] = useState<Set<string>>(new Set());

  // Filas de defectos: se identifican por un id estable (para las keys de
  // React y para poder quitar una fila del medio sin sorpresas), pero el
  // nombre de los campos que lee el server action (`defectoTipo_0`,
  // `defectoTipo_1`, ...) se arma con la posición actual en pantalla — el
  // server action ya ignora las filas vacías, así que da igual si al quitar
  // una fila los índices de las que quedan se corren. En modo edición se
  // arranca con una fila por cada defecto ya registrado.
  const filasIniciales = Math.max(1, inspeccion?.defectos.length ?? 1);
  const nextRowId = useRef(filasIniciales);
  const [defectRows, setDefectRows] = useState<number[]>(() =>
    Array.from({ length: filasIniciales }, (_, i) => i)
  );

  function agregarDefecto() {
    setDefectRows((rows) =>
      rows.length >= MAX_DEFECTOS ? rows : [...rows, nextRowId.current++]
    );
  }
  function quitarDefecto(id: number) {
    setDefectRows((rows) => rows.filter((r) => r !== id));
  }

  // Previsualización de fotos antes de enviar: el input de archivo por sí
  // solo no muestra nada útil una vez seleccionadas las fotos (a lo más "3
  // archivos" en algunos navegadores), así que en el packing es fácil no
  // notar que se seleccionó la foto equivocada. DataTransfer permite además
  // sacar una sola foto de la selección sin tener que volver a elegir todas.
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fotos, setFotos] = useState<File[]>([]);
  const soportaQuitarFoto = typeof DataTransfer !== "undefined";

  function onFotosChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFotos(e.target.files ? Array.from(e.target.files) : []);
  }
  function quitarFoto(index: number) {
    if (!soportaQuitarFoto || !fileInputRef.current) return;
    const restantes = fotos.filter((_, i) => i !== index);
    const dt = new DataTransfer();
    restantes.forEach((f) => dt.items.add(f));
    fileInputRef.current.files = dt.files;
    setFotos(restantes);
  }

  const loteSeleccionado = useMemo(
    () => lotes.find((l) => l.id === loteId),
    [lotes, loteId]
  );
  const especieSeleccionada = loteSeleccionado?.especie;
  const esCereza = especieSeleccionada === "CEREZA";

  // Opciones de "Tipo de defecto" filtradas por la especie del lote elegido
  // (defectosPorEspecie, src/lib/normas.ts) — sin lote seleccionado se
  // muestra el catálogo completo como respaldo.
  const opcionesDefecto: [TipoDefecto, string][] = useMemo(() => {
    const tipos = especieSeleccionada
      ? defectosPorEspecie[especieSeleccionada]
      : (Object.keys(tipoDefectoLabels) as TipoDefecto[]);
    return tipos.map((t) => [t, tipoDefectoLabels[t]]);
  }, [especieSeleccionada]);

  // Aviso de tamaño de muestra sugerido (no bloqueante, ver
  // src/lib/normas.ts#tamanoMuestraSugerido) comparado contra lo ingresado
  // en "N° cajas muestreadas".
  const [muestraCajasInput, setMuestraCajasInput] = useState(
    inspeccion?.muestraCajas != null ? String(inspeccion.muestraCajas) : ""
  );
  const sugerenciaMuestra = tamanoMuestraSugerido(loteSeleccionado?.cajasTotales);
  const avisoMuestraBaja =
    sugerenciaMuestra !== null &&
    muestraCajasInput !== "" &&
    Number(muestraCajasInput) < sugerenciaMuestra.cajasMuestra;

  const firmezaLabel =
    especieSeleccionada === "CEREZA"
      ? "Firmeza (UD Durofel)"
      : especieSeleccionada === "KIWI"
        ? "Firmeza (lb)"
        : especieSeleccionada === "MANZANA" || especieSeleccionada === "PERA"
          ? "Firmeza (kgF)"
          : "Firmeza";

  const inspectorIdActual = inspeccion?.inspectorId ?? usuarioActual?.id ?? "";
  const nombreInspectorActual =
    inspectores.find((i) => i.id === inspectorIdActual)?.nombre ??
    (inspeccion ? "" : (usuarioActual?.nombre ?? ""));

  return (
    // Padding inferior extra: deja espacio para que la barra de acción fija
    // (ver más abajo) no tape el último campo en pantallas chicas.
    <form action={formAction} className="space-y-4 pb-20 md:pb-4">
      {inspeccion ? <input type="hidden" name="inspeccionId" value={inspeccion.id} /> : null}

      <p className="text-sm text-fg-muted">
        Completa los datos de la inspección en terreno. Los campos con{" "}
        <span className="font-semibold text-state-danger">*</span> son obligatorios;
        el resto puedes dejarlo en blanco si no aplica o no lo mediste.
      </p>

      <FormErrorBanner message={state.error} />

      <Card>
        <SectionTitle icon={ClipboardList}>Datos generales</SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Lote" required error={errores.loteId}>
            <select
              name="loteId"
              required
              value={loteId}
              onChange={(e) => setLoteId(e.target.value)}
              className={`${campoClase(errores.loteId)} font-mono`}
            >
              <option value="">Selecciona un lote…</option>
              {lotes.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.codigo} · {especieLabels[l.especie]} {l.variedad} ·{" "}
                  {l.cliente.nombre}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Inspector" required error={errores.inspectorId}>
            {puedeElegirInspector ? (
              <select
                name="inspectorId"
                required
                defaultValue={inspectorIdActual}
                className={campoClase(errores.inspectorId)}
              >
                <option value="">Selecciona un inspector…</option>
                {inspectores.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.nombre}
                  </option>
                ))}
              </select>
            ) : (
              <>
                <input
                  type="text"
                  value={nombreInspectorActual}
                  disabled
                  readOnly
                  className={`${campoClase()} disabled:opacity-70`}
                />
                <input type="hidden" name="inspectorId" value={inspectorIdActual} />
              </>
            )}
          </Field>

          <Field label="Fecha" error={errores.fecha}>
            <input
              type="date"
              name="fecha"
              defaultValue={(inspeccion?.fecha ?? new Date()).toISOString().slice(0, 10)}
              className={campoClase(errores.fecha)}
            />
          </Field>

          <Field label="Etapa de la inspección" error={errores.etapa}>
            <select
              name="etapa"
              defaultValue={inspeccion?.etapa ?? "RECEPCION"}
              className={campoClase(errores.etapa)}
            >
              {etapaInspeccionOptions.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Resultado" error={errores.resultado}>
            <select
              name="resultado"
              defaultValue={inspeccion?.resultado ?? "CATEGORIA_1"}
              className={campoClase(errores.resultado)}
            >
              {resultadoOptions.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            {esCereza ? (
              <p className="mt-1 text-xs text-fg-muted">
                Para cereza, el resultado se recalcula automáticamente según el
                catálogo de defectos de condición (ver sección de defectos).
              </p>
            ) : null}
          </Field>
        </div>
      </Card>

      <Card>
        <SectionTitle icon={Gauge}>Parámetros de calidad</SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Calibre" error={errores.calibre}>
            {esCereza ? (
              <select
                name="calibre"
                defaultValue={inspeccion?.calibre ?? ""}
                className={`${campoClase(errores.calibre)} font-mono`}
              >
                <option value="">Selecciona…</option>
                {calibresCereza.map((c) => (
                  <option key={c} value={c}>
                    {c}
                    {calibresCerezaPremiumAsia.has(c) ? " · Premium Asia" : ""}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                name="calibre"
                placeholder="70-75mm"
                defaultValue={inspeccion?.calibre ?? ""}
                className={`${campoClase(errores.calibre)} font-mono`}
              />
            )}
          </Field>
          <Field label="Color" error={errores.color}>
            <input
              type="text"
              name="color"
              placeholder="80% cubrimiento"
              defaultValue={inspeccion?.color ?? ""}
              className={campoClase(errores.color)}
            />
          </Field>
          {esCereza ? (
            <>
              <Field label="% Dark" error={errores.colorPorcentajeDark}>
                <input
                  type="number"
                  min={0}
                  max={100}
                  name="colorPorcentajeDark"
                  defaultValue={inspeccion?.colorPorcentajeDark ?? ""}
                  className={`${campoClase(errores.colorPorcentajeDark)} font-mono tabular-nums`}
                />
              </Field>
              <Field label="% Light" error={errores.colorPorcentajeLight}>
                <input
                  type="number"
                  min={0}
                  max={100}
                  name="colorPorcentajeLight"
                  defaultValue={inspeccion?.colorPorcentajeLight ?? ""}
                  className={`${campoClase(errores.colorPorcentajeLight)} font-mono tabular-nums`}
                />
              </Field>
            </>
          ) : null}
          <Field label={firmezaLabel} error={errores.firmeza}>
            <input
              type="number"
              step="0.1"
              name="firmeza"
              defaultValue={inspeccion?.firmeza ?? ""}
              className={`${campoClase(errores.firmeza)} font-mono tabular-nums`}
            />
          </Field>
          <Field label="°Brix" error={errores.brixGrados}>
            <input
              type="number"
              step="0.1"
              name="brixGrados"
              defaultValue={inspeccion?.brixGrados ?? ""}
              className={`${campoClase(errores.brixGrados)} font-mono tabular-nums`}
            />
          </Field>
          <Field label="Acidez" error={errores.acidez}>
            <input
              type="number"
              step="0.01"
              name="acidez"
              defaultValue={inspeccion?.acidez ?? ""}
              className={`${campoClase(errores.acidez)} font-mono tabular-nums`}
            />
          </Field>
          <Field label="Peso muestra (kg)" error={errores.pesoMuestraKg}>
            <input
              type="number"
              step="0.1"
              name="pesoMuestraKg"
              defaultValue={inspeccion?.pesoMuestraKg ?? ""}
              className={`${campoClase(errores.pesoMuestraKg)} font-mono tabular-nums`}
            />
          </Field>
          <Field label="N° cajas muestreadas" error={errores.muestraCajas}>
            <input
              type="number"
              name="muestraCajas"
              value={muestraCajasInput}
              onChange={(e) => setMuestraCajasInput(e.target.value)}
              className={`${campoClase(errores.muestraCajas)} font-mono tabular-nums`}
            />
            {sugerenciaMuestra ? (
              <p className={`mt-1 text-xs ${avisoMuestraBaja ? "text-state-warning" : "text-fg-muted"}`}>
                Sugerido para este lote: {sugerenciaMuestra.cajasMuestra} cajas (mín.{" "}
                {sugerenciaMuestra.frutosMinimos} frutos) — plan de muestreo USDA/ISO 2859.
              </p>
            ) : null}
          </Field>
          <Field label="N° unidades muestreadas" error={errores.muestraUnidades}>
            <input
              type="number"
              name="muestraUnidades"
              defaultValue={inspeccion?.muestraUnidades ?? ""}
              className={`${campoClase(errores.muestraUnidades)} font-mono tabular-nums`}
            />
          </Field>
          <Field label="% Rechazo total" error={errores.porcentajeRechazo}>
            <input
              type="number"
              step="0.1"
              name="porcentajeRechazo"
              defaultValue={inspeccion?.porcentajeRechazo ?? ""}
              className={`${campoClase(errores.porcentajeRechazo)} font-mono tabular-nums`}
            />
          </Field>
        </div>
      </Card>

      {esCereza ? (
        <Card>
          <SectionTitle icon={Droplets}>Control de hidroenfriado</SectionTitle>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="T° agua (°C)" error={errores.hidrocoolerTempAguaC}>
              <input
                type="number"
                step="0.1"
                name="hidrocoolerTempAguaC"
                placeholder="0-2"
                defaultValue={inspeccion?.hidrocoolerTempAguaC ?? ""}
                className={`${campoClase(errores.hidrocoolerTempAguaC)} font-mono tabular-nums`}
              />
            </Field>
            <Field label="Cloro libre (ppm)" error={errores.hidrocoolerCloroLibrePpm}>
              <input
                type="number"
                step="1"
                name="hidrocoolerCloroLibrePpm"
                placeholder="100-120"
                defaultValue={inspeccion?.hidrocoolerCloroLibrePpm ?? ""}
                className={`${campoClase(errores.hidrocoolerCloroLibrePpm)} font-mono tabular-nums`}
              />
            </Field>
            <Field
              label="Tiempo exposición (min)"
              error={errores.hidrocoolerTiempoExposicionMin}
            >
              <input
                type="number"
                step="0.1"
                name="hidrocoolerTiempoExposicionMin"
                placeholder="3-5"
                defaultValue={inspeccion?.hidrocoolerTiempoExposicionMin ?? ""}
                className={`${campoClase(errores.hidrocoolerTiempoExposicionMin)} font-mono tabular-nums`}
              />
            </Field>
            <Field label="T° pulpa post (°C)" error={errores.hidrocoolerTempPulpaPostC}>
              <input
                type="number"
                step="0.1"
                name="hidrocoolerTempPulpaPostC"
                defaultValue={inspeccion?.hidrocoolerTempPulpaPostC ?? ""}
                className={`${campoClase(errores.hidrocoolerTempPulpaPostC)} font-mono tabular-nums`}
              />
            </Field>
            <Field label="Espera > 1h antes del hidrocooler">
              <select
                name="hidrocoolerEsperaMasDeUnaHora"
                defaultValue={
                  inspeccion?.hidrocoolerEsperaMasDeUnaHora === true
                    ? "true"
                    : inspeccion?.hidrocoolerEsperaMasDeUnaHora === false
                      ? "false"
                      : ""
                }
                className={campoClase()}
              >
                <option value="">Sin especificar</option>
                <option value="true">Sí</option>
                <option value="false">No</option>
              </select>
            </Field>
          </div>
        </Card>
      ) : null}

      <Card>
        <div className="mb-4 flex items-center justify-between gap-3">
          <SectionTitle icon={AlertTriangle} className="!mb-0">
            Defectos detectados
          </SectionTitle>
          <button
            type="button"
            onClick={agregarDefecto}
            disabled={defectRows.length >= MAX_DEFECTOS}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-fg hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Agregar defecto
          </button>
        </div>

        {defectRows.length === 0 ? (
          <p className="text-sm text-fg-muted">
            Sin defectos registrados. Usa &ldquo;Agregar defecto&rdquo; si encontraste
            alguno en la muestra.
          </p>
        ) : (
          <div className="space-y-3">
            {defectRows.map((rowId, i) => {
              const defectoExistente = inspeccion?.defectos[i];
              const erroresFila = {
                tipo: errores[`defecto_${i}_tipo`],
                porcentaje: errores[`defecto_${i}_porcentaje`],
                cantidad: errores[`defecto_${i}_cantidad`],
              };
              return (
                <div key={rowId} className="rounded-lg border border-border p-3">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-[0.04em] text-fg-muted">
                      Defecto {i + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => quitarDefecto(rowId)}
                      aria-label={`Quitar defecto ${i + 1}`}
                      title="Quitar este defecto"
                      className="flex h-9 w-9 items-center justify-center rounded-full text-fg-muted hover:bg-state-danger-bg hover:text-state-danger"
                    >
                      <X className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <Field label="Tipo de defecto" error={erroresFila.tipo}>
                      <select
                        name={`defectoTipo_${i}`}
                        className={campoClase(erroresFila.tipo)}
                        defaultValue={defectoExistente?.tipo ?? ""}
                      >
                        <option value="">Sin especificar</option>
                        {opcionesDefecto.map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="% de la muestra" error={erroresFila.porcentaje}>
                      <input
                        type="number"
                        step="0.1"
                        name={`defectoPorcentaje_${i}`}
                        defaultValue={defectoExistente?.porcentaje ?? ""}
                        className={`${campoClase(erroresFila.porcentaje)} font-mono tabular-nums`}
                      />
                    </Field>
                    <Field label="Cantidad (unidades)" error={erroresFila.cantidad}>
                      <input
                        type="number"
                        name={`defectoCantidad_${i}`}
                        defaultValue={defectoExistente?.cantidad ?? ""}
                        className={`${campoClase(erroresFila.cantidad)} font-mono tabular-nums`}
                      />
                    </Field>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card>
        <SectionTitle icon={MessageSquareText}>Observaciones</SectionTitle>
        <Field label="" error={errores.observaciones}>
          <textarea
            name="observaciones"
            rows={3}
            defaultValue={inspeccion?.observaciones ?? ""}
            className={campoClase(errores.observaciones)}
            placeholder="Notas generales de la inspección…"
          />
        </Field>
      </Card>

      <Card>
        <SectionTitle icon={Camera}>Fotos</SectionTitle>

        {inspeccion && inspeccion.fotos.length > 0 ? (
          <div className="mb-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.04em] text-fg-muted">
              Fotos ya cargadas
            </p>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
              {inspeccion.fotos.map((foto) => {
                const marcada = fotosAEliminar.has(foto.id);
                return (
                  <label
                    key={foto.id}
                    className={`relative block cursor-pointer overflow-hidden rounded-lg border ${
                      marcada ? "border-state-danger" : "border-border"
                    }`}
                  >
                    <input
                      type="checkbox"
                      name="eliminarFoto"
                      value={foto.id}
                      checked={marcada}
                      onChange={(e) => {
                        setFotosAEliminar((prev) => {
                          const next = new Set(prev);
                          if (e.target.checked) next.add(foto.id);
                          else next.delete(foto.id);
                          return next;
                        });
                      }}
                      className="absolute right-1.5 top-1.5 z-10 h-4 w-4 accent-state-danger"
                    />
                    <div className="relative aspect-square bg-card-alt">
                      <Image
                        src={foto.url}
                        alt={foto.descripcion ?? "Foto de inspección"}
                        fill
                        sizes="150px"
                        className={`object-cover ${marcada ? "opacity-40" : ""}`}
                      />
                    </div>
                    {marcada ? (
                      <span className="absolute inset-x-0 bottom-0 bg-state-danger-bg py-0.5 text-center text-[11px] font-medium text-state-danger">
                        Se eliminará
                      </span>
                    ) : null}
                  </label>
                );
              })}
            </div>
          </div>
        ) : null}

        <p className="mb-3 text-xs text-fg-muted">
          Puedes tomar fotos con la cámara del celular o elegir varias desde la
          galería.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          name="fotos"
          accept="image/*"
          multiple
          onChange={onFotosChange}
          className="block w-full text-sm text-fg-muted file:mr-3 file:rounded-lg file:border-0 file:bg-brand-700 file:px-3 file:py-2 file:text-sm file:font-medium file:text-cream hover:file:bg-brand-800"
        />

        {fotos.length > 0 ? (
          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {fotos.map((foto, i) => {
              const url = URL.createObjectURL(foto);
              return (
                <div
                  key={`${foto.name}-${foto.lastModified}-${i}`}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-card-alt"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- previsualización local de un File, no una URL remota que Next pueda optimizar */}
                  <img
                    src={url}
                    alt={`Foto seleccionada ${i + 1}: ${foto.name}`}
                    className="h-full w-full object-cover"
                    onLoad={() => URL.revokeObjectURL(url)}
                  />
                  {soportaQuitarFoto ? (
                    <button
                      type="button"
                      onClick={() => quitarFoto(i)}
                      aria-label={`Quitar foto ${i + 1}`}
                      title="Quitar esta foto"
                      className="absolute top-1 right-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-state-danger"
                    >
                      <X className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : null}
      </Card>

      {/* Barra de acción: fija al fondo en mobile (donde este formulario largo
          se llena de pie en la línea de packing y no conviene obligar a
          volver a subir hasta el final para guardar), en flujo normal en
          desktop. El botón "Cancelar" da una salida obvia sin perder el
          progreso silenciosamente. */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card px-4 py-3 shadow-[0_-2px_8px_rgba(0,0,0,0.06)] md:static md:z-auto md:mt-2 md:border-t md:bg-transparent md:px-0 md:py-0 md:shadow-none">
        <div className="mx-auto flex max-w-4xl justify-end gap-3">
          <Link
            href={inspeccion ? `/inspecciones/${inspeccion.id}` : "/inspecciones"}
            className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-fg hover:bg-surface"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-brand-700 px-5 py-2.5 text-sm font-semibold text-cream hover:bg-brand-800 disabled:opacity-60"
          >
            {pending ? "Guardando…" : inspeccion ? "Guardar cambios" : "Guardar inspección"}
          </button>
        </div>
      </div>
    </form>
  );
}
