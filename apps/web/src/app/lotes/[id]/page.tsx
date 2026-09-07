import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import TopBar from "@/components/TopBar";
import { Card, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { prisma } from "@/lib/prisma";
import {
  especieLabels,
  resultadoBadgeClasses,
  resultadoLabels,
} from "@/lib/labels";
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
        <Link href="/lotes" className="text-sm text-brand-700 hover:underline">
          ← Volver a lotes
        </Link>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card>
            <CardTitle>Datos del lote</CardTitle>
            <dl className="space-y-2 text-sm">
              <Row label="Especie / Variedad" value={`${especieLabels[lote.especie]} · ${lote.variedad}`} />
              <Row label="Productor" value={lote.productor} />
              <Row label="Packing" value={lote.ubicacionPacking} />
              <Row label="Temporada" value={lote.temporada} />
              <Row
                label="Cliente"
                value={
                  <Link href={`/clientes/${lote.clienteId}`} className="text-brand-700 hover:underline">
                    {lote.cliente.nombre}
                  </Link>
                }
              />
              <Row label="Destino" value={lote.destino ?? "—"} />
            </dl>
          </Card>

          <Card>
            <CardTitle>Volumen</CardTitle>
            <dl className="space-y-2 text-sm">
              <Row label="Cajas totales" value={formatNumero(lote.cajasTotales, 0)} />
              <Row label="Kg totales" value={formatNumero(lote.kgTotales, 0)} />
              <Row label="Calibre predominante" value={lote.calibrePredominante ?? "—"} />
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
              <Row label="Inspecciones" value={String(lote.inspecciones.length)} />
              <Row label="% Rechazo promedio" value={formatPorcentaje(promedio)} />
            </dl>
            <Link
              href={`/inspecciones/nueva`}
              className="mt-4 inline-block rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-cream hover:bg-brand-800"
            >
              + Registrar inspección
            </Link>
          </Card>
        </div>

        <Card className="!p-0">
          <div className="border-b border-brand-950/10 px-5 py-4">
            <CardTitle>Historial de inspecciones</CardTitle>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-brand-950/5 text-xs uppercase tracking-wide text-brand-800">
                <tr>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Inspector</th>
                  <th className="px-4 py-3">% Rechazo</th>
                  <th className="px-4 py-3">Resultado</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-950/10">
                {lote.inspecciones.map((insp) => (
                  <tr key={insp.id} className="hover:bg-brand-950/[0.03]">
                    <td className="whitespace-nowrap px-4 py-3">{formatFecha(insp.fecha)}</td>
                    <td className="whitespace-nowrap px-4 py-3">{insp.inspector.nombre}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {formatPorcentaje(insp.porcentajeRechazo)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Badge className={resultadoBadgeClasses[insp.resultado]}>
                        {resultadoLabels[insp.resultado]}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <Link href={`/inspecciones/${insp.id}`} className="text-brand-700 hover:underline">
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
                {lote.inspecciones.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-ink/50">
                      Este lote todavía no tiene inspecciones.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-ink/50">{label}</dt>
      <dd className="text-right font-medium text-ink">{value}</dd>
    </div>
  );
}
