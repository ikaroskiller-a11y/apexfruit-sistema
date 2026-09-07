import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import TopBar from "@/components/TopBar";
import { Card, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EspecieTag } from "@/components/ui/EspecieTag";
import { prisma } from "@/lib/prisma";
import {
  resultadoStatusMap,
  resultadoLabels,
  tipoDefectoLabels,
} from "@/lib/labels";
import { formatFechaHora, formatPorcentaje } from "@/lib/format";

export default async function InspeccionDetallePage({
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

  return (
    <>
      <TopBar title={`Inspección · ${inspeccion.lote.codigo}`} />
      <main className="flex-1 space-y-6 px-4 py-6 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link
              href="/inspecciones"
              className="text-sm text-brand-700 hover:underline dark:text-brand-500"
            >
              ← Volver a inspecciones
            </Link>
            <h2 className="mt-1 text-2xl leading-[30px] font-semibold text-fg">
              {formatFechaHora(inspeccion.fecha)} · {inspeccion.inspector.nombre}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <Badge status={resultadoStatusMap[inspeccion.resultado]}>
              {resultadoLabels[inspeccion.resultado]}
            </Badge>
            <Link
              href={`/inspecciones/${inspeccion.id}/reporte`}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-700 px-3 py-1.5 text-sm font-medium text-cream shadow-sm transition-colors hover:bg-brand-800"
            >
              Ver reporte / PDF
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card>
            <CardTitle>Lote</CardTitle>
            <dl className="space-y-2 text-sm">
              <Row label="Código" value={inspeccion.lote.codigo} mono />
              <Row
                label="Especie / Variedad"
                value={
                  <EspecieTag
                    especie={inspeccion.lote.especie}
                    variedad={inspeccion.lote.variedad}
                  />
                }
              />
              <Row label="Productor" value={inspeccion.lote.productor} />
              <Row label="Packing" value={inspeccion.lote.ubicacionPacking} />
              <Row
                label="Cliente"
                value={
                  <Link
                    href={`/clientes/${inspeccion.lote.clienteId}`}
                    className="text-brand-700 hover:underline dark:text-brand-500"
                  >
                    {inspeccion.lote.cliente.nombre}
                  </Link>
                }
              />
              <Row label="Temporada" value={inspeccion.lote.temporada} />
            </dl>
          </Card>

          <Card>
            <CardTitle>Parámetros de calidad</CardTitle>
            <dl className="space-y-2 text-sm">
              <Row label="Calibre" value={inspeccion.calibre ?? "—"} mono />
              <Row label="Color" value={inspeccion.color ?? "—"} />
              <Row
                label="Firmeza"
                value={inspeccion.firmezaKgF ? `${inspeccion.firmezaKgF} kgF` : "—"}
                mono
              />
              <Row
                label="°Brix"
                value={inspeccion.brixGrados ? `${inspeccion.brixGrados}°` : "—"}
                mono
              />
              <Row
                label="Muestra"
                value={
                  inspeccion.muestraUnidades
                    ? `${inspeccion.muestraUnidades} unidades (${inspeccion.muestraCajas ?? "—"} cajas)`
                    : "—"
                }
                mono
              />
              <Row
                label="% Rechazo"
                value={formatPorcentaje(inspeccion.porcentajeRechazo)}
                mono
              />
            </dl>
          </Card>

          <Card>
            <CardTitle>Defectos detectados</CardTitle>
            {inspeccion.defectos.length === 0 ? (
              <p className="text-sm text-fg-muted">Sin defectos registrados.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {inspeccion.defectos.map((d) => (
                  <li
                    key={d.id}
                    className="flex items-center justify-between border-b border-border pb-2 last:border-0"
                  >
                    <span>
                      {tipoDefectoLabels[d.tipo]}
                      {d.esCritico ? (
                        <Badge status="danger" className="ml-2">
                          Crítico
                        </Badge>
                      ) : null}
                    </span>
                    <span className="font-mono tabular-nums text-fg-muted">
                      {d.porcentaje ? `${d.porcentaje.toFixed(1)}%` : ""}
                      {d.cantidad ? ` (${d.cantidad} un.)` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {inspeccion.observaciones ? (
          <Card>
            <CardTitle>Observaciones</CardTitle>
            <p className="text-sm text-fg">{inspeccion.observaciones}</p>
          </Card>
        ) : null}

        <Card>
          <CardTitle>Fotos</CardTitle>
          {inspeccion.fotos.length === 0 ? (
            <p className="text-sm text-fg-muted">No se adjuntaron fotos.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {inspeccion.fotos.map((foto) => (
                <div
                  key={foto.id}
                  className="relative aspect-square overflow-hidden rounded-lg border border-border bg-card-alt"
                >
                  <Image
                    src={foto.url}
                    alt={foto.descripcion ?? "Foto de inspección"}
                    fill
                    sizes="200px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>
    </>
  );
}

function Row({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-fg-muted">{label}</dt>
      <dd
        className={`text-right font-medium text-fg ${mono ? "font-mono tabular-nums" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}
