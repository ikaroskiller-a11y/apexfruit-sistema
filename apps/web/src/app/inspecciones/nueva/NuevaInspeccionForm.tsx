"use client";

import { useState } from "react";
import { crearInspeccion } from "./actions";
import { especieLabels, resultadoOptions, tipoDefectoOptions } from "@/lib/labels";
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

  return (
    <form action={crearInspeccion} className="space-y-8">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Lote" required>
          <select name="loteId" required className={`${inputClass} font-mono`}>
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
          <select name="resultado" defaultValue="APROBADO" className={inputClass}>
            {resultadoOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
      </section>

      <section>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.04em] text-fg-muted">
          Parámetros de calidad
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <Field label="Calibre">
            <input
              type="text"
              name="calibre"
              placeholder="70-75mm"
              className={`${inputClass} font-mono`}
            />
          </Field>
          <Field label="Color">
            <input type="text" name="color" placeholder="80% cubrimiento" className={inputClass} />
          </Field>
          <Field label="Firmeza (kgF)">
            <input
              type="number"
              step="0.1"
              name="firmezaKgF"
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

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-[0.04em] text-fg-muted">
            Defectos detectados
          </h3>
          <button
            type="button"
            onClick={() => setNDefectos((n) => Math.min(n + 1, 6))}
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
