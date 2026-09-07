import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  especieLabels,
  resultadoLabels,
  tipoDefectoLabels,
} from "@/lib/labels";
import { formatFecha, formatFechaHora, formatPorcentaje } from "@/lib/format";
import { PrintReportButton } from "@/components/PrintReportButton";

const resultadoTexto: Record<string, string> = {
  APROBADO: "El lote cumple el estándar de exportación definido para esta inspección.",
  APROBADO_CON_OBSERVACIONES:
    "El lote cumple el estándar, con observaciones que se deben monitorear en la próxima inspección.",
  RECHAZADO:
    "El lote no cumple el estándar de exportación. Se recomienda reproceso antes de continuar.",
};

export default async function ReporteInspeccionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const inspeccion = await prisma.inspeccion.findUnique({
    where: { id },
    include: {
      lote: { include: { cliente: true } },
      inspector: true,
      defectos: true,
      fotos: true,
    },
  });

  if (!inspeccion) notFound();

  const totalDefectos = inspeccion.defectos.reduce(
    (acc, d) => acc + (d.cantidad ?? 0),
    0
  );

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 print:max-w-none print:px-0 print:py-0">
      <div className="mb-4 flex items-center justify-between print:hidden">
        <Link
          href={`/inspecciones/${inspeccion.id}`}
          className="text-sm text-brand-700 hover:underline"
        >
          ← Volver a la inspección
        </Link>
        <PrintReportButton />
      </div>

      <article className="rounded-xl border border-brand-950/10 bg-white p-8 shadow-sm print:rounded-none print:border-0 print:p-0 print:shadow-none">
        {/* Encabezado */}
        <header className="flex items-start justify-between gap-4 border-b border-brand-950/10 pb-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-leaf text-lg font-bold text-brand-950">
              AF
            </span>
            <div>
              <p className="text-lg font-semibold text-brand-950">Apex Fruit SPA</p>
              <p className="text-xs text-ink/60">
                Control de calidad frutícola · Curicó / Teno, Región del Maule
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-ink/50">
              Reporte técnico de inspección
            </p>
            <p className="font-mono text-sm font-semibold text-brand-950">
              {inspeccion.lote.codigo}
            </p>
            <p className="text-xs text-ink/60">
              Emitido {formatFechaHora(new Date())}
            </p>
          </div>
        </header>

        {/* Resultado */}
        <section className="mt-5 flex items-center justify-between rounded-lg bg-cream px-4 py-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-ink/50">Resultado</p>
            <p className="text-base font-semibold text-brand-950">
              {resultadoLabels[inspeccion.resultado]}
            </p>
          </div>
          <p className="max-w-sm text-right text-xs text-ink/70">
            {resultadoTexto[inspeccion.resultado]}
          </p>
        </section>

        {/* Datos del lote */}
        <section className="mt-6">
          <SectionTitle>Datos del lote</SectionTitle>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
            <Field label="Especie / Variedad" value={`${especieLabels[inspeccion.lote.especie]} · ${inspeccion.lote.variedad}`} />
            <Field label="Productor" value={inspeccion.lote.productor} />
            <Field label="Packing" value={inspeccion.lote.ubicacionPacking} />
            <Field label="Cliente / Exportadora" value={inspeccion.lote.cliente.nombre} />
            <Field label="Temporada" value={inspeccion.lote.temporada} />
            <Field label="Destino" value={inspeccion.lote.destino ?? "—"} />
            <Field
              label="Fecha de cosecha"
              value={inspeccion.lote.fechaCosecha ? formatFecha(inspeccion.lote.fechaCosecha) : "—"}
            />
            <Field label="Cajas totales" value={inspeccion.lote.cajasTotales?.toLocaleString("es-CL") ?? "—"} />
          </dl>
        </section>

        {/* Parámetros de la inspección */}
        <section className="mt-6">
          <SectionTitle>Parámetros de la inspección</SectionTitle>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
            <Field label="Fecha de inspección" value={formatFechaHora(inspeccion.fecha)} />
            <Field label="Inspector responsable" value={inspeccion.inspector.nombre} />
            <Field label="Calibre" value={inspeccion.calibre ?? "—"} mono />
            <Field label="Color" value={inspeccion.color ?? "—"} />
            <Field label="Firmeza" value={inspeccion.firmezaKgF ? `${inspeccion.firmezaKgF} kgF` : "—"} mono />
            <Field label="°Brix" value={inspeccion.brixGrados ? `${inspeccion.brixGrados}°` : "—"} mono />
            <Field
              label="Tamaño de muestra"
              value={
                inspeccion.muestraUnidades
                  ? `${inspeccion.muestraUnidades} unidades (${inspeccion.muestraCajas ?? "—"} cajas)`
                  : "—"
              }
              mono
            />
            <Field label="Porcentaje de rechazo" value={formatPorcentaje(inspeccion.porcentajeRechazo)} mono />
          </dl>
        </section>

        {/* Defectos */}
        <section className="mt-6">
          <SectionTitle>Defectos registrados</SectionTitle>
          {inspeccion.defectos.length === 0 ? (
            <p className="text-sm text-ink/50">No se registraron defectos en esta inspección.</p>
          ) : (
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-brand-950/10 text-left text-xs uppercase tracking-wide text-ink/50">
                  <th className="py-2 pr-3 font-medium">Tipo de defecto</th>
                  <th className="py-2 pr-3 font-medium">% de la muestra</th>
                  <th className="py-2 pr-3 font-medium">Unidades</th>
                  <th className="py-2 font-medium">Crítico</th>
                </tr>
              </thead>
              <tbody>
                {inspeccion.defectos.map((d) => (
                  <tr key={d.id} className="border-b border-brand-950/5">
                    <td className="py-2 pr-3">{tipoDefectoLabels[d.tipo]}</td>
                    <td className="py-2 pr-3 font-mono">
                      {d.porcentaje ? `${d.porcentaje.toFixed(1)}%` : "—"}
                    </td>
                    <td className="py-2 pr-3 font-mono">{d.cantidad ?? "—"}</td>
                    <td className="py-2">{d.esCritico ? "Sí" : "No"}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td className="pt-2 text-xs text-ink/50" colSpan={4}>
                    Total de unidades con defecto en la muestra: {totalDefectos}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </section>

        {/* Observaciones */}
        {inspeccion.observaciones ? (
          <section className="mt-6">
            <SectionTitle>Observaciones</SectionTitle>
            <p className="text-sm text-ink/80">{inspeccion.observaciones}</p>
          </section>
        ) : null}

        {/* Fotos */}
        {inspeccion.fotos.length > 0 ? (
          <section className="mt-6 break-inside-avoid">
            <SectionTitle>Registro fotográfico</SectionTitle>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {inspeccion.fotos.map((foto) => (
                <div
                  key={foto.id}
                  className="relative aspect-square overflow-hidden rounded-lg border border-brand-950/10 bg-cream"
                >
                  <Image
                    src={foto.url}
                    alt={foto.descripcion ?? "Foto de inspección"}
                    fill
                    sizes="150px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* Firma */}
        <section className="mt-10 grid grid-cols-2 gap-8 break-inside-avoid text-sm">
          <div>
            <div className="h-12 border-b border-ink/30" />
            <p className="mt-1 text-xs text-ink/60">
              Firma inspector responsable · {inspeccion.inspector.nombre}
            </p>
          </div>
          <div>
            <div className="h-12 border-b border-ink/30" />
            <p className="mt-1 text-xs text-ink/60">Timbre / visto bueno Apex Fruit</p>
          </div>
        </section>

        <footer className="mt-8 border-t border-brand-950/10 pt-3 text-center text-[10px] text-ink/40">
          Apex Fruit SPA · Documento generado por el sistema interno de control de calidad · No válido sin firma
        </footer>
      </article>
    </main>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-800">
      {children}
    </h2>
  );
}

function Field({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wide text-ink/40">{label}</dt>
      <dd className={`font-medium text-ink ${mono ? "font-mono" : ""}`}>{value}</dd>
    </div>
  );
}
