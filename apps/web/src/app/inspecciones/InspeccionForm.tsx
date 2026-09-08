"use client";

import { useActionState, useMemo, useState } from "react";
import Image from "next/image";
import {
  especieLabels,
  resultadoOptions,
  tipoDefectoOptions,
  calibresCereza,
  calibresCerezaPremiumAsia,
} from "@/lib/labels";
import { Field, campoClase, FormErrorBanner } from "@/components/ui/FormField";
import { ESTADO_INICIAL, type FormState } from "@/lib/validation";
import type { EspecieFruta, TipoDefecto } from "@prisma/client";
import type { SesionUsuario } from "@/lib/auth";

type LoteOpcion = {
  id: string;
  codigo: string;
  variedad: string;
  especie: EspecieFruta;
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
  const [nDefectos, setNDefectos] = useState(Math.max(1, inspeccion?.defectos.length ?? 1));
  const [loteId, setLoteId] = useState(inspeccion?.loteId ?? "");
  const [fotosAEliminar, setFotosAEliminar] = useState<Set<string>>(new Set());

  const especieSeleccionada = useMemo(
    () => lotes.find((l) => l.id === loteId)?.especie,
    [lotes, loteId]
  );
  const esCereza = especieSeleccionada === "CEREZA";

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
    <form action={formAction} className="space-y-8">
      {inspeccion ? <input type="hidden" name="inspeccionId" value={inspeccion.id} /> : null}

      <FormErrorBanner message={state.error} />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
      </section>

      <section>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.04em] text-fg-muted">
          Parámetros de calidad
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
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
              defaultValue={inspeccion?.muestraCajas ?? ""}
              className={`${campoClase(errores.muestraCajas)} font-mono tabular-nums`}
            />
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
      </section>

      {esCereza ? (
        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.04em] text-fg-muted">
            Control de hidroenfriado
          </h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
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
            <Field label="Tiempo exposición (min)" error={errores.hidrocoolerTiempoExposicionMin}>
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
        </section>
      ) : null}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-[0.04em] text-fg-muted">
            Defectos detectados
          </h3>
          <button
            type="button"
            onClick={() => setNDefectos((n) => Math.min(n + 1, 10))}
            className="text-sm font-medium text-brand-700 hover:underline dark:text-brand-500"
          >
            + Agregar defecto
          </button>
        </div>
        <div className="space-y-3">
          {Array.from({ length: nDefectos }).map((_, i) => {
            const defectoExistente = inspeccion?.defectos[i];
            const erroresFila = {
              tipo: errores[`defecto_${i}_tipo`],
              porcentaje: errores[`defecto_${i}_porcentaje`],
              cantidad: errores[`defecto_${i}_cantidad`],
            };
            return (
              <div
                key={i}
                className="grid grid-cols-1 gap-3 rounded-lg border border-border p-3 sm:grid-cols-3"
              >
                <Field label="Tipo de defecto" error={erroresFila.tipo}>
                  <select
                    name={`defectoTipo_${i}`}
                    className={campoClase(erroresFila.tipo)}
                    defaultValue={defectoExistente?.tipo ?? ""}
                  >
                    <option value="">Sin especificar</option>
                    {tipoDefectoOptions.map(([value, label]) => (
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
            );
          })}
        </div>
      </section>

      <section>
        <Field label="Observaciones" error={errores.observaciones}>
          <textarea
            name="observaciones"
            rows={3}
            defaultValue={inspeccion?.observaciones ?? ""}
            className={campoClase(errores.observaciones)}
            placeholder="Notas generales de la inspección…"
          />
        </Field>
      </section>

      {inspeccion && inspeccion.fotos.length > 0 ? (
        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.04em] text-fg-muted">
            Fotos ya cargadas
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
        </section>
      ) : null}

      <section>
        <Field label={inspeccion ? "Agregar fotos" : "Fotos"}>
          <input
            type="file"
            name="fotos"
            accept="image/*"
            multiple
            className="block w-full text-sm text-fg-muted file:mr-3 file:rounded-lg file:border-0 file:bg-brand-700 file:px-3 file:py-2 file:text-sm file:font-medium file:text-cream hover:file:bg-brand-800"
          />
        </Field>
      </section>

      <div className="flex justify-end gap-3 border-t border-border pt-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand-700 px-5 py-2.5 text-sm font-semibold text-cream hover:bg-brand-800 disabled:opacity-60"
        >
          {pending ? "Guardando…" : inspeccion ? "Guardar cambios" : "Guardar inspección"}
        </button>
      </div>
    </form>
  );
}
