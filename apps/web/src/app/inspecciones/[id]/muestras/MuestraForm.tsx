"use client";

import { useActionState, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, Camera, Package, Plus, X } from "lucide-react";
import { tipoDefectoLabels } from "@/lib/labels";
import { defectosPorEspecie } from "@/lib/normas";
import { Field, campoClase, FormErrorBanner } from "@/components/ui/FormField";
import { Card, CardTitle } from "@/components/ui/Card";
import { ESTADO_INICIAL, type FormState } from "@/lib/validation";
import type { EspecieFruta, TipoDefecto } from "@prisma/client";

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

export type MuestraExistente = {
  id: string;
  numero: number;
  embalaje: string;
  etiqueta: string | null;
  calibre: string | null;
  nFrutos: number | null;
  pesoKg: number | null;
  nSalida: string | null;
  embaladora: string | null;
  sinPLU: number | null;
  conPLU: number | null;
  sobreCalibrePct: number | null;
  bajoCalibrePct: number | null;
  notaApertura: string | null;
  notaEmbalaje: string | null;
  hora: string | null;
  defectos: DefectoExistente[];
  fotos: FotoExistente[];
};

const MAX_DEFECTOS = 6;

export default function MuestraForm({
  inspeccionId,
  loteCodigo,
  especie,
  embalajesExistentes,
  action,
  muestra,
}: {
  inspeccionId: string;
  loteCodigo: string;
  especie: EspecieFruta;
  embalajesExistentes: string[];
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  /** Presente en modo edición; ausente al crear una muestra nueva. */
  muestra?: MuestraExistente;
}) {
  const [state, formAction, pending] = useActionState(action, ESTADO_INICIAL);
  const errores = state.fieldErrors ?? {};

  const filasIniciales = Math.max(1, muestra?.defectos.length ?? 1);
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

  const opcionesDefecto: [TipoDefecto, string][] = defectosPorEspecie[especie].map((t) => [
    t,
    tipoDefectoLabels[t],
  ]);

  const [fotosAEliminar, setFotosAEliminar] = useState<Set<string>>(new Set());
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

  return (
    <form action={formAction} className="space-y-4 pb-20 md:pb-4">
      <input type="hidden" name="inspeccionId" value={inspeccionId} />
      {muestra ? <input type="hidden" name="muestraId" value={muestra.id} /> : null}

      <p className="text-sm text-fg-muted">
        Pensado para llenar rápido en terreno: lo único obligatorio es el embalaje.
        Registra los defectos que encuentres — la calidad y la condición de la
        muestra se calculan solas a partir de ellos.
      </p>

      <FormErrorBanner message={state.error} />

      {muestra ? (
        <p className="text-sm text-fg-muted">
          Folio <span className="font-mono font-semibold text-fg">{loteCodigo}-M{String(muestra.numero).padStart(2, "0")}</span>
        </p>
      ) : null}

      <Card>
        <CardTitle>
          <span className="flex items-center gap-2">
            <Package className="h-4 w-4 shrink-0 text-brand-700 dark:text-brand-500" aria-hidden />
            Datos rápidos
          </span>
        </CardTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Embalaje" required error={errores.embalaje}>
            <input
              type="text"
              name="embalaje"
              list="embalajes-existentes"
              required
              placeholder="A10PGAI"
              defaultValue={muestra?.embalaje ?? ""}
              className={`${campoClase(errores.embalaje)} font-mono`}
            />
            <datalist id="embalajes-existentes">
              {embalajesExistentes.map((e) => (
                <option key={e} value={e} />
              ))}
            </datalist>
          </Field>
          <Field label="Calibre" error={errores.calibre}>
            <input
              type="text"
              name="calibre"
              defaultValue={muestra?.calibre ?? ""}
              className={`${campoClase(errores.calibre)} font-mono`}
            />
          </Field>
          <Field label="N° Frutos" error={errores.nFrutos}>
            <input
              type="number"
              name="nFrutos"
              defaultValue={muestra?.nFrutos ?? ""}
              className={`${campoClase(errores.nFrutos)} font-mono tabular-nums`}
            />
          </Field>
          <Field label="Peso (kg)" error={errores.pesoKg}>
            <input
              type="number"
              step="0.01"
              name="pesoKg"
              defaultValue={muestra?.pesoKg ?? ""}
              className={`${campoClase(errores.pesoKg)} font-mono tabular-nums`}
            />
          </Field>
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex items-center justify-between gap-3">
          <CardTitle className="!mb-0">
            <span className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-brand-700 dark:text-brand-500" aria-hidden />
              Defectos de esta muestra
            </span>
          </CardTitle>
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
            Sin defectos registrados — esta muestra quedará en Calidad A / Condición 1.
          </p>
        ) : (
          <div className="space-y-3">
            {defectRows.map((rowId, i) => {
              const defectoExistente = muestra?.defectos[i];
              const erroresFila = {
                tipo: errores[`muestraDefecto_${i}_tipo`],
                porcentaje: errores[`muestraDefecto_${i}_porcentaje`],
                cantidad: errores[`muestraDefecto_${i}_cantidad`],
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
                        name={`muestraDefectoTipo_${i}`}
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
                        name={`muestraDefectoPorcentaje_${i}`}
                        defaultValue={defectoExistente?.porcentaje ?? ""}
                        className={`${campoClase(erroresFila.porcentaje)} font-mono tabular-nums`}
                      />
                    </Field>
                    <Field label="Cantidad (unidades)" error={erroresFila.cantidad}>
                      <input
                        type="number"
                        name={`muestraDefectoCantidad_${i}`}
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
        <details>
          <summary className="cursor-pointer text-sm font-semibold text-fg">
            Más detalles (opcional)
          </summary>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Etiqueta" error={errores.etiqueta}>
              <input
                type="text"
                name="etiqueta"
                defaultValue={muestra?.etiqueta ?? ""}
                className={campoClase(errores.etiqueta)}
              />
            </Field>
            <Field label="N° Salida" error={errores.nSalida}>
              <input
                type="text"
                name="nSalida"
                defaultValue={muestra?.nSalida ?? ""}
                className={`${campoClase(errores.nSalida)} font-mono`}
              />
            </Field>
            <Field label="Embaladora" error={errores.embaladora}>
              <input
                type="text"
                name="embaladora"
                defaultValue={muestra?.embaladora ?? ""}
                className={campoClase(errores.embaladora)}
              />
            </Field>
            <Field label="Sin PLU" error={errores.sinPLU}>
              <input
                type="number"
                name="sinPLU"
                defaultValue={muestra?.sinPLU ?? ""}
                className={`${campoClase(errores.sinPLU)} font-mono tabular-nums`}
              />
            </Field>
            <Field label="Con PLU" error={errores.conPLU}>
              <input
                type="number"
                name="conPLU"
                defaultValue={muestra?.conPLU ?? ""}
                className={`${campoClase(errores.conPLU)} font-mono tabular-nums`}
              />
            </Field>
            <Field label="Hora" error={errores.hora}>
              <input
                type="text"
                name="hora"
                placeholder="14:30"
                defaultValue={muestra?.hora ?? ""}
                className={`${campoClase(errores.hora)} font-mono`}
              />
            </Field>
            <Field label="% Sobre calibre" error={errores.sobreCalibrePct}>
              <input
                type="number"
                step="0.1"
                name="sobreCalibrePct"
                defaultValue={muestra?.sobreCalibrePct ?? ""}
                className={`${campoClase(errores.sobreCalibrePct)} font-mono tabular-nums`}
              />
            </Field>
            <Field label="% Bajo calibre" error={errores.bajoCalibrePct}>
              <input
                type="number"
                step="0.1"
                name="bajoCalibrePct"
                defaultValue={muestra?.bajoCalibrePct ?? ""}
                className={`${campoClase(errores.bajoCalibrePct)} font-mono tabular-nums`}
              />
            </Field>
            <Field label="Nota apertura" error={errores.notaApertura}>
              <input
                type="text"
                name="notaApertura"
                defaultValue={muestra?.notaApertura ?? ""}
                className={campoClase(errores.notaApertura)}
              />
            </Field>
            <Field label="Nota embalaje" error={errores.notaEmbalaje}>
              <input
                type="text"
                name="notaEmbalaje"
                defaultValue={muestra?.notaEmbalaje ?? ""}
                className={campoClase(errores.notaEmbalaje)}
              />
            </Field>
          </div>
        </details>
      </Card>

      <Card>
        <CardTitle>
          <span className="flex items-center gap-2">
            <Camera className="h-4 w-4 shrink-0 text-brand-700 dark:text-brand-500" aria-hidden />
            Fotos de la muestra
          </span>
        </CardTitle>

        {muestra && muestra.fotos.length > 0 ? (
          <div className="mb-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.04em] text-fg-muted">
              Fotos ya cargadas
            </p>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
              {muestra.fotos.map((foto) => {
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
                        alt={foto.descripcion ?? "Foto de muestra"}
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
                  {/* eslint-disable-next-line @next/next/no-img-element -- previsualización local de un File */}
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

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card px-4 py-3 shadow-[0_-2px_8px_rgba(0,0,0,0.06)] md:static md:z-auto md:mt-2 md:border-t md:bg-transparent md:px-0 md:py-0 md:shadow-none">
        <div className="mx-auto flex max-w-4xl justify-end gap-3">
          <Link
            href={`/inspecciones/${inspeccionId}/muestras`}
            className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-fg hover:bg-surface"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-brand-700 px-5 py-2.5 text-sm font-semibold text-cream hover:bg-brand-800 disabled:opacity-60"
          >
            {pending ? "Guardando…" : muestra ? "Guardar cambios" : "Guardar muestra"}
          </button>
        </div>
      </div>
    </form>
  );
}
