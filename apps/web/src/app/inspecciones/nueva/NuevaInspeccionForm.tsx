"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
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
import { crearInspeccion } from "./actions";
import {
  especieLabels,
  resultadoOptions,
  tipoDefectoOptions,
  calibresCereza,
  calibresCerezaPremiumAsia,
} from "@/lib/labels";
import { Field, inputClass } from "@/components/ui/FormField";
import { Card, CardTitle } from "@/components/ui/Card";
import type { EspecieFruta } from "@prisma/client";
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

export default function NuevaInspeccionForm({
  lotes,
  inspectores,
  usuarioActual,
}: {
  lotes: LoteOpcion[];
  inspectores: InspectorOpcion[];
  usuarioActual: SesionUsuario | null;
}) {
  // Un inspector registra sus propias inspecciones — no puede elegir a otra
  // persona en el select. Un administrador sí puede (ej: cargar una
  // inspección en nombre de otro inspector). El server action vuelve a
  // forzar esto igual, así que esto es solo comodidad de UI, no el control
  // de seguridad real.
  const puedeElegirInspector = usuarioActual?.rol === "ADMINISTRADOR";
  const [loteId, setLoteId] = useState("");

  // Filas de defectos: se identifican por un id estable (para las keys de
  // React y para poder quitar una fila del medio sin sorpresas), pero el
  // nombre de los campos que lee el server action (`defectoTipo_0`,
  // `defectoTipo_1`, ...) se arma con la posición actual en pantalla — el
  // server action ya ignora las filas vacías, así que da igual si al quitar
  // una fila los índices de las que quedan se corren.
  const nextRowId = useRef(1);
  const [defectRows, setDefectRows] = useState<number[]>([0]);

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
    // Padding inferior extra: deja espacio para que la barra de acción fija
    // (ver más abajo) no tape el último campo en pantallas chicas.
    <form action={crearInspeccion} className="space-y-4 pb-20 md:pb-4">
      <p className="text-sm text-fg-muted">
        Completa los datos de la inspección en terreno. Los campos con{" "}
        <span className="font-semibold text-state-danger">*</span> son obligatorios;
        el resto puedes dejarlo en blanco si no aplica o no lo mediste.
      </p>

      <Card>
        <SectionTitle icon={ClipboardList}>Datos generales</SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            {puedeElegirInspector ? (
              <select name="inspectorId" required className={inputClass}>
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
                  value={usuarioActual?.nombre ?? ""}
                  disabled
                  className={`${inputClass} disabled:opacity-70`}
                />
                <input type="hidden" name="inspectorId" value={usuarioActual?.id ?? ""} />
              </>
            )}
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
        </div>
      </Card>

      <Card>
        <SectionTitle icon={Gauge}>Parámetros de calidad</SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
      </Card>

      {esCereza ? (
        <Card>
          <SectionTitle icon={Droplets}>Control de hidroenfriado</SectionTitle>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            {defectRows.map((rowId, i) => (
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
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <SectionTitle icon={MessageSquareText}>Observaciones</SectionTitle>
        <textarea
          name="observaciones"
          rows={3}
          className={inputClass}
          placeholder="Notas generales de la inspección…"
        />
      </Card>

      <Card>
        <SectionTitle icon={Camera}>Fotos</SectionTitle>
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
            href="/inspecciones"
            className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-fg hover:bg-surface"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            className="rounded-lg bg-brand-700 px-5 py-2.5 text-sm font-semibold text-cream hover:bg-brand-800"
          >
            Guardar inspección
          </button>
        </div>
      </div>
    </form>
  );
}
