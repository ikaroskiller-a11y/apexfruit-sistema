import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import TopBar from "@/components/TopBar";
import { Card, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EspecieTag } from "@/components/ui/EspecieTag";
import { prisma } from "@/lib/prisma";
import { resultadoStatusMap, resultadoLabels, mercadoDestinoLabels } from "@/lib/labels";
import { formatFecha, formatNumero, formatPorcentaje } from "@/lib/format";

export default async function LoteDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const lote = await prisma.lote.findUnique({
    where: { id },
    include: {
      cliente: true,
      inspecciones: {
        include: { inspector: true },
        orderBy: { fecha: "desc" },
      },
    },
  });

  if (!lote) notFound();

  const valores = lote.inspecciones
    .map((i) => i.porcentajeRechazo)
    .filter((v): v is number => v !== null && v !== undefined);
  const promedio =
    valores.length > 0 ? valores.reduce((a, b) => a + b, 0) / valores.length : null;

  return (
    <>
      <TopBar title={`Lote ${lote.codigo}`} />
      <main className="flex-1 space-y-6 px-4 py-6 md:px-8">
        <Link href="/lotes" className="text-sm text-brand-700 hover:underline dark:text-brand-500">
          ← Volver a lotes
        </Link>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card>
            <CardTitle>Datos del lote</CardTitle>
            <dl className="space-y-2 text-sm">
              <Row
                label="Especie / Variedad"
                value={<EspecieTag especie={lote.especie} variedad={lote.variedad} />}
              />
              <Row label="Productor" value={lote.productor} />
              <Row label="Packing" value={lote.ubicacionPacking} />
              <Row label="Temporada" value={lote.temporada} />
              <Row
                label="Cliente"
                value={
                  <Link href={`/clientes/${lote.clienteId}`} className="text-brand-700 hover:underline dark:text-brand-500">
                    {lote.cliente.nombre}
                  </Link>
                }
              />
              <Row
                label="Mercado destino"
                value={lote.mercadoDestino ? mercadoDestinoLabels[lote.mercadoDestino] : "—"}
              />
            </dl>
          </Card>

          <Card>
            <CardTitle>Volumen</CardTitle>
            <dl className="space-y-2 text-sm">
              <Row label="Cajas totales" value={formatNumero(lote.cajasTotales, 0)} mono />
              <Row label="Kg totales" value={formatNumero(lote.kgTotales, 0)} mono />
              <Row label="Calibre predominante" value={lote.calibrePredominante ?? "—"} mono />
              <Row
                label="Fecha de cosecha"
                value={lote.fechaCosecha ? formatFecha(lote.fechaCosecha) : "—"}
              />
              <Row label="Fecha de ingreso" value={formatFecha(lote.fechaIngreso)} />
            </dl>
          </Card>

          <Card>
            <CardTitle>Resumen de calidad</CardTitle>
            <dl className="space-y-2 text-sm">
              <Row label="Inspecciones" value={String(lote.inspecciones.length)} mono />
              <Row label="% Rechazo promedio" value={formatPorcentaje(promedio)} mono />
            </dl>
            <Link
              href={`/inspecciones/nueva`}
              className="mt-4 inline-block rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-cream hover:bg-brand-800"
            >
              + Registrar inspección
            </Link>
          </Card>
        </div>

        {/* Desktop / tablet: tabla con encabezado sticky */}
        <Card className="hidden md:block !p-0">
          <div className="border-b border-border px-5 py-4">
            <CardTitle>Historial de inspecciones</CardTitle>
          </div>
          <div className="max-h-[60vh] overflow-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="sticky top-0 z-10 bg-card-header text-xs uppercase tracking-wide text-fg-muted">
                <tr>
                  <th className="px-4 py-2.5">Fecha</th>
                  <th className="px-4 py-2.5">Inspector</th>
                  <th className="px-4 py-2.5 text-right">% Rechazo</th>
                  <th className="px-4 py-2.5">Resultado</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {lote.inspecciones.map((insp) => {
                  const critica = insp.resultado === "OBJETADO";
                  return (
                    <tr
                      key={insp.id}
                      className={`h-10 odd:bg-card even:bg-card-alt hover:bg-surface ${
                        critica
                          ? "border-l-[3px] border-l-state-danger bg-state-danger-bg/40"
                          : ""
                      }`}
                    >
                      <td className="whitespace-nowrap px-4 py-2.5">{formatFecha(insp.fecha)}</td>
                      <td className="whitespace-nowrap px-4 py-2.5">{insp.inspector.nombre}</td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-right font-mono tabular-nums">
                        {formatPorcentaje(insp.porcentajeRechazo)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5">
                        <Badge status={resultadoStatusMap[insp.resultado]}>
                          {resultadoLabels[insp.resultado]}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-right">
                        <Link href={`/inspecciones/${insp.id}`} className="text-brand-700 hover:underline dark:text-brand-500">
                          Ver
                        </Link>
                      </td>
                    </tr>
                  );
                })}
                {lote.inspecciones.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-fg-muted">
                      Este lote todavía no tiene inspecciones.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Mobile (<md): tarjetas apiladas */}
        <div className="md:hidden">
          <h3 className="mb-3 text-base leading-[22px] font-semibold text-fg">
            Historial de inspecciones
          </h3>
          <div className="space-y-3">
            {lote.inspecciones.map((insp) => {
              const critica = insp.resultado === "OBJETADO";
              return (
                <Link key={insp.id} href={`/inspecciones/${insp.id}`}>
                  <Card
                    className={`!p-4 ${
                      critica
                        ? "border-l-[3px] border-l-state-danger bg-state-danger-bg/40"
                        : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-fg">{formatFecha(insp.fecha)}</p>
                        <p className="text-xs text-fg-muted">{insp.inspector.nombre}</p>
                      </div>
                      <Badge status={resultadoStatusMap[insp.resultado]}>
                        {resultadoLabels[insp.resultado]}
                      </Badge>
                    </div>
                    <p className="mt-2 text-right font-mono text-sm tabular-nums text-fg">
                      {formatPorcentaje(insp.porcentajeRechazo)}
                    </p>
                  </Card>
                </Link>
              );
            })}
            {lote.inspecciones.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-fg-muted">
                Este lote todavía no tiene inspecciones.
              </p>
            ) : null}
          </div>
        </div>
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
      <dd className={`text-right font-medium text-fg ${mono ? "font-mono tabular-nums" : ""}`}>
        {value}
      </dd>
    </div>
  );
}
