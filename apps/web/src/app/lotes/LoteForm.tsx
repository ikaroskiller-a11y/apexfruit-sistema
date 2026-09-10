"use client";

import { useActionState } from "react";
import Link from "next/link";
import { crearLote, actualizarLote } from "./actions";
import { Field, campoClase, FormErrorBanner } from "@/components/ui/FormField";
import { ESTADO_INICIAL } from "@/lib/validation";
import { especieOptions, mercadoDestinoOptions } from "@/lib/labels";
import type { EspecieFruta, MercadoDestino } from "@prisma/client";

type ClienteOpcion = { id: string; nombre: string };
type ProductorOpcion = { id: string; nombre: string };

type LoteExistente = {
  id: string;
  codigo: string;
  clienteId: string;
  especie: EspecieFruta;
  variedad: string;
  productorId: string;
  ubicacionPacking: string;
  temporada: string;
  fechaCosecha: Date | null;
  cajasTotales: number | null;
  kgTotales: number | null;
  calibrePredominante: string | null;
  mercadoDestino: MercadoDestino | null;
  notas: string | null;
};

export default function LoteForm({
  clientes,
  productores,
  lote,
}: {
  clientes: ClienteOpcion[];
  productores: ProductorOpcion[];
  lote?: LoteExistente;
}) {
  const accion = lote ? actualizarLote : crearLote;
  const [state, formAction, pending] = useActionState(accion, ESTADO_INICIAL);
  const errores = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-5">
      {lote ? <input type="hidden" name="loteId" value={lote.id} /> : null}

      <FormErrorBanner message={state.error} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Código de lote" required error={errores.codigo}>
          <input
            type="text"
            name="codigo"
            required
            placeholder="AF-2526-0001"
            defaultValue={lote?.codigo}
            className={`${campoClase(errores.codigo)} font-mono`}
          />
        </Field>

        <Field label="Cliente" required error={errores.clienteId}>
          <select
            name="clienteId"
            required
            defaultValue={lote?.clienteId ?? ""}
            className={campoClase(errores.clienteId)}
          >
            <option value="">Selecciona un cliente…</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Especie" required error={errores.especie}>
          <select
            name="especie"
            required
            defaultValue={lote?.especie ?? ""}
            className={campoClase(errores.especie)}
          >
            <option value="">Selecciona una especie…</option>
            {especieOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Variedad" required error={errores.variedad}>
          <input
            type="text"
            name="variedad"
            required
            placeholder="Gala, Lapins, Duke…"
            defaultValue={lote?.variedad}
            className={campoClase(errores.variedad)}
          />
        </Field>

        <Field label="Productor" required error={errores.productorId}>
          <select
            name="productorId"
            required
            defaultValue={lote?.productorId ?? ""}
            className={campoClase(errores.productorId)}
          >
            <option value="">Selecciona un productor…</option>
            {productores.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Packing / centro de acopio" required error={errores.ubicacionPacking}>
          <input
            type="text"
            name="ubicacionPacking"
            required
            defaultValue={lote?.ubicacionPacking}
            className={campoClase(errores.ubicacionPacking)}
          />
        </Field>

        <Field label="Temporada" required error={errores.temporada}>
          <input
            type="text"
            name="temporada"
            required
            placeholder="2025-2026"
            defaultValue={lote?.temporada}
            className={`${campoClase(errores.temporada)} font-mono`}
          />
        </Field>

        <Field label="Fecha de cosecha" error={errores.fechaCosecha}>
          <input
            type="date"
            name="fechaCosecha"
            defaultValue={lote?.fechaCosecha ? lote.fechaCosecha.toISOString().slice(0, 10) : ""}
            className={campoClase(errores.fechaCosecha)}
          />
        </Field>

        <Field label="Cajas totales" error={errores.cajasTotales}>
          <input
            type="number"
            name="cajasTotales"
            min={0}
            defaultValue={lote?.cajasTotales ?? ""}
            className={`${campoClase(errores.cajasTotales)} font-mono tabular-nums`}
          />
        </Field>

        <Field label="Kg totales" error={errores.kgTotales}>
          <input
            type="number"
            step="0.1"
            name="kgTotales"
            min={0}
            defaultValue={lote?.kgTotales ?? ""}
            className={`${campoClase(errores.kgTotales)} font-mono tabular-nums`}
          />
        </Field>

        <Field label="Calibre predominante" error={errores.calibrePredominante}>
          <input
            type="text"
            name="calibrePredominante"
            defaultValue={lote?.calibrePredominante ?? ""}
            className={`${campoClase(errores.calibrePredominante)} font-mono`}
          />
        </Field>

        <Field label="Mercado destino" error={errores.mercadoDestino}>
          <select
            name="mercadoDestino"
            defaultValue={lote?.mercadoDestino ?? ""}
            className={campoClase(errores.mercadoDestino)}
          >
            <option value="">Sin especificar</option>
            {mercadoDestinoOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Notas" error={errores.notas}>
        <textarea
          name="notas"
          rows={3}
          defaultValue={lote?.notas ?? ""}
          className={campoClase(errores.notas)}
        />
      </Field>

      <div className="flex justify-end gap-3 border-t border-border pt-4">
        <Link
          href={lote ? `/lotes/${lote.id}` : "/lotes"}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-fg hover:bg-surface"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand-700 px-5 py-2.5 text-sm font-semibold text-cream hover:bg-brand-800 disabled:opacity-60"
        >
          {pending ? "Guardando…" : lote ? "Guardar cambios" : "Crear lote"}
        </button>
      </div>
    </form>
  );
}
