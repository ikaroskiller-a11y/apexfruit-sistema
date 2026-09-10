import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import TopBar from "@/components/TopBar";
import { Card, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EspecieTag } from "@/components/ui/EspecieTag";
import { BotonEliminar } from "@/components/ui/BotonEliminar";
import { prisma } from "@/lib/prisma";
import { esAdmin, getCurrentUser } from "@/lib/auth";
import {
  resultadoStatusMap,
  resultadoLabels,
  etapaInspeccionLabels,
  tipoDefectoLabels,
  firmezaUnidadLabels,
  mercadoDestinoLabels,
} from "@/lib/labels";
import { formatFechaHora, formatPorcentaje } from "@/lib/format";
import {
  avisoFirmezaKiwi,
  clasificarFirmezaCereza,
  criterioObjecionCereza,
} from "@/lib/normas";
import { eliminarInspeccion } from "./actions";

export default async function InspeccionDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [inspeccion, usuarioActual] = await Promise.all([
    prisma.inspeccion.findUnique({
      where: { id },
      include: {
        lote: { include: { cliente: true, productorRef: true } },
        inspector: true,
        defectos: true,
        fotos: true,
        _count: { select: { muestras: true } },
      },
    }),
    getCurrentUser(),
  ]);

  if (!inspeccion) notFound();
  const puedeGestionar =
    !!usuarioActual && (esAdmin(usuarioActual) || usuarioActual.id === inspeccion.inspectorId);

  const esCereza = inspeccion.lote.especie === "CEREZA";
  const esKiwi = inspeccion.lote.especie === "KIWI";
  const firmezaCereza =
    esCereza && inspeccion.firmeza ? clasificarFirmezaCereza(inspeccion.firmeza) : null;
  const avisoKiwi = esKiwi
    ? avisoFirmezaKiwi(inspeccion.lote.mercadoDestino, inspeccion.firmeza)
    : null;
  const criterioObjecion =
    esCereza && inspeccion.resultado === "OBJETADO"
      ? criterioObjecionCereza(inspeccion.defectos)
      : null;

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
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-border px-2.5 py-1 text-xs font-medium text-fg-muted">
              {etapaInspeccionLabels[inspeccion.etapa]}
            </span>
            <Badge status={resultadoStatusMap[inspeccion.resultado]}>
              {resultadoLabels[inspeccion.resultado]}
            </Badge>
            <Link
              href={`/inspecciones/${inspeccion.id}/muestras`}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-fg hover:bg-surface"
            >
              Ver muestras ({inspeccion._count.muestras})
            </Link>
            <Link
              href={`/inspecciones/${inspeccion.id}/reporte`}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-700 px-3 py-1.5 text-sm font-medium text-cream shadow-sm transition-colors hover:bg-brand-800"
            >
              Ver reporte / PDF
            </Link>
            {puedeGestionar ? (
              <>
                <Link
                  href={`/inspecciones/${inspeccion.id}/editar`}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-fg hover:bg-surface"
                >
                  Editar
                </Link>
                <BotonEliminar
                  action={eliminarInspeccion}
                  hiddenFields={{ inspeccionId: inspeccion.id }}
                  confirmMessage={`¿Eliminar esta inspección del lote "${inspeccion.lote.codigo}"? Esta acción no se puede deshacer.`}
                />
              </>
            ) : null}
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
              <Row label="Productor" value={inspeccion.lote.productorRef.nombre} />
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
              <Row
                label="Mercado destino"
                value={
                  inspeccion.lote.mercadoDestino
                    ? mercadoDestinoLabels[inspeccion.lote.mercadoDestino]
                    : "—"
                }
              />
            </dl>
          </Card>

          <Card>
            <CardTitle>Parámetros de calidad</CardTitle>
            <dl className="space-y-2 text-sm">
              <Row label="Calibre" value={inspeccion.calibre ?? "—"} mono />
              <Row label="Color" value={inspeccion.color ?? "—"} />
              {esCereza ? (
                <Row
                  label="% Dark / % Light"
                  value={
                    inspeccion.colorPorcentajeDark !== null || inspeccion.colorPorcentajeLight !== null
                      ? `${inspeccion.colorPorcentajeDark ?? "—"}% / ${inspeccion.colorPorcentajeLight ?? "—"}%`
                      : "—"
                  }
                  mono
                />
              ) : null}
              <Row
                label="Firmeza"
                value={
                  inspeccion.firmeza
                    ? `${inspeccion.firmeza} ${inspeccion.firmezaUnidad ? firmezaUnidadLabels[inspeccion.firmezaUnidad] : ""}`
                    : "—"
                }
                mono
              />
              {esCereza && inspeccion.firmeza ? (
                <Row
                  label="Clasificación firmeza"
                  value={`${firmezaCereza!.clasificacion} · ${firmezaCereza!.embarqueRecomendado}`}
                />
              ) : null}
              {avisoKiwi ? (
                <Row label="Firmeza" value={<Badge status="warning">{avisoKiwi}</Badge>} />
              ) : null}
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

        {esCereza ? (
          <Card>
            <CardTitle>Control de hidroenfriado</CardTitle>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
              <Row
                label="T° agua"
                value={inspeccion.hidrocoolerTempAguaC !== null ? `${inspeccion.hidrocoolerTempAguaC}°C` : "—"}
                mono
              />
              <Row
                label="Cloro libre"
                value={
                  inspeccion.hidrocoolerCloroLibrePpm !== null
                    ? `${inspeccion.hidrocoolerCloroLibrePpm} ppm`
                    : "—"
                }
                mono
              />
              <Row
                label="Tiempo de exposición"
                value={
                  inspeccion.hidrocoolerTiempoExposicionMin !== null
                    ? `${inspeccion.hidrocoolerTiempoExposicionMin} min`
                    : "—"
                }
                mono
              />
              <Row
                label="T° pulpa post-hidrocooler"
                value={
                  inspeccion.hidrocoolerTempPulpaPostC !== null
                    ? `${inspeccion.hidrocoolerTempPulpaPostC}°C`
                    : "—"
                }
                mono
              />
              <Row
                label="Espera > 1h antes del hidrocooler"
                value={
                  inspeccion.hidrocoolerEsperaMasDeUnaHora === null ||
                  inspeccion.hidrocoolerEsperaMasDeUnaHora === undefined
                    ? "—"
                    : inspeccion.hidrocoolerEsperaMasDeUnaHora
                      ? "Sí"
                      : "No"
                }
              />
            </dl>
          </Card>
        ) : null}

        {criterioObjecion ? (
          <Card className="border-state-danger/30 bg-state-danger-bg/40">
            <CardTitle>Criterio de objeción aplicado</CardTitle>
            <p className="text-sm text-fg">{criterioObjecion}</p>
          </Card>
        ) : null}

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
