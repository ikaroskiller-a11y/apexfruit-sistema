"use client";

import { useMemo, useState } from "react";
import { crearInspeccion } from "./actions";
import {
  especieLabels,
  resultadoOptions,
  tipoDefectoOptions,
  calibresCereza,
  calibresCerezaPremiumAsia,
} from "@/lib/labels";
import { Field, inputClass } from "@/components/ui/FormField";
import type { EspecieFruta } from "@prisma/client";

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

export default function NuevaInspeccionForm({
  lotes,
  inspectores,
}: {
  lotes: LoteOpcion[];
  inspectores: InspectorOpcion[];
}) {
  const [nDefectos, setNDefectos] = useState(1);
  const [loteId, setLoteId] = useState("");

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

  return (
    <form action={crearInspeccion} className="space-y-8">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Lote" required>
          <select
            name="loteId"
            required
            value={loteId}
            onChange={(e) => setLoteId(e.target.value)}
            className={`${inputClass} font-mono`}
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

        <Field label="Inspector" required>
          <select name="inspectorId" required className={inputClass}>
            <option value="">Selecciona un inspector…</option>
            {inspectores.map((i) => (
              <option key={i.id} value={i.id}>
                {i.nombre}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Fecha">
          <input
            type="date"
            name="fecha"
            defaultValue={new Date().toISOString().slice(0, 10)}
            className={inputClass}
          />
        </Field>

        <Field label="Resultado">
          <select name="resultado" defaultValue="CATEGORIA_1" className={inputClass}>
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
          <Field label="Calibre">
            {esCereza ? (
              <select name="calibre" defaultValue="" className={`${inputClass} font-mono`}>
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
                className={`${inputClass} font-mono`}
              />
            )}
          </Field>
          <Field label="Color">
            <input type="text" name="color" placeholder="80% cubrimiento" className={inputClass} />
          </Field>
          {esCereza ? (
            <>
              <Field label="% Dark">
                <input
                  type="number"
                  min={0}
                  max={100}
                  name="colorPorcentajeDark"
                  className={`${inputClass} font-mono tabular-nums`}
                />
              </Field>
              <Field label="% Light">
                <input
                  type="number"
                  min={0}
                  max={100}
                  name="colorPorcentajeLight"
                  className={`${inputClass} font-mono tabular-nums`}
                />
              </Field>
            </>
          ) : null}
          <Field label={firmezaLabel}>
            <input
              type="number"
              step="0.1"
              name="firmeza"
              className={`${inputClass} font-mono tabular-nums`}
            />
          </Field>
          <Field label="°Brix">
            <input
              type="number"
              step="0.1"
              name="brixGrados"
              className={`${inputClass} font-mono tabular-nums`}
            />
          </Field>
          <Field label="Acidez">
            <input
              type="number"
              step="0.01"
              name="acidez"
              className={`${inputClass} font-mono tabular-nums`}
            />
          </Field>
          <Field label="Peso muestra (kg)">
            <input
              type="number"
              step="0.1"
              name="pesoMuestraKg"
              className={`${inputClass} font-mono tabular-nums`}
            />
          </Field>
          <Field label="N° cajas muestreadas">
            <input
              type="number"
              name="muestraCajas"
              className={`${inputClass} font-mono tabular-nums`}
            />
          </Field>
          <Field label="N° unidades muestreadas">
            <input
              type="number"
              name="muestraUnidades"
              className={`${inputClass} font-mono tabular-nums`}
            />
          </Field>
          <Field label="% Rechazo total">
            <input
              type="number"
              step="0.1"
              name="porcentajeRechazo"
              className={`${inputClass} font-mono tabular-nums`}
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
            <Field label="T° agua (°C)">
              <input
                type="number"
                step="0.1"
                name="hidrocoolerTempAguaC"
                placeholder="0-2"
                className={`${inputClass} font-mono tabular-nums`}
              />
            </Field>
            <Field label="Cloro libre (ppm)">
              <input
                type="number"
                step="1"
                name="hidrocoolerCloroLibrePpm"
                placeholder="100-120"
                className={`${inputClass} font-mono tabular-nums`}
              />
            </Field>
            <Field label="Tiempo exposición (min)">
              <input
                type="number"
                step="0.1"
                name="hidrocoolerTiempoExposicionMin"
                placeholder="3-5"
                className={`${inputClass} font-mono tabular-nums`}
              />
            </Field>
            <Field label="T° pulpa post (°C)">
              <input
                type="number"
                step="0.1"
                name="hidrocoolerTempPulpaPostC"
                className={`${inputClass} font-mono tabular-nums`}
              />
            </Field>
            <Field label="Espera > 1h antes del hidrocooler">
              <select name="hidrocoolerEsperaMasDeUnaHora" defaultValue="" className={inputClass}>
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
          {Array.from({ length: nDefectos }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-1 gap-3 rounded-lg border border-border p-3 sm:grid-cols-3"
            >
              <Field label="Tipo de defecto">
                <select name={`defectoTipo_${i}`} className={inputClass} defaultValue="">
                  <option value="">Sin especificar</option>
                  {tipoDefectoOptions.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="% de la muestra">
                <input
                  type="number"
                  step="0.1"
                  name={`defectoPorcentaje_${i}`}
                  className={`${inputClass} font-mono tabular-nums`}
                />
              </Field>
              <Field label="Cantidad (unidades)">
                <input
                  type="number"
                  name={`defectoCantidad_${i}`}
                  className={`${inputClass} font-mono tabular-nums`}
                />
              </Field>
            </div>
          ))}
        </div>
      </section>

      <section>
        <Field label="Observaciones">
          <textarea
            name="observaciones"
            rows={3}
            className={inputClass}
            placeholder="Notas generales de la inspección…"
          />
        </Field>
      </section>

      <section>
        <Field label="Fotos">
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
          className="rounded-lg bg-brand-700 px-5 py-2.5 text-sm font-semibold text-cream hover:bg-brand-800"
        >
          Guardar inspección
        </button>
      </div>
    </form>
  );
}
