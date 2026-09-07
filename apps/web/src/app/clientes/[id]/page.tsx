import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import TopBar from "@/components/TopBar";
import { Card, CardTitle } from "@/components/ui/Card";
import { prisma } from "@/lib/prisma";
import { especieLabels } from "@/lib/labels";
import { formatFecha, formatPorcentaje } from "@/lib/format";

export default async function ClienteDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const cliente = await prisma.cliente.findUnique({
    where: { id },
    include: {
      lotes: {
        include: { inspecciones: { select: { porcentajeRechazo: true } } },
        orderBy: { fechaIngreso: "desc" },
      },
    },
  });

  if (!cliente) notFound();

  return (
    <>
      <TopBar title={cliente.nombre} />
      <main className="flex-1 space-y-6 px-4 py-6 md:px-8">
        <Link href="/clientes" className="text-sm text-brand-700 hover:underline">
          ← Volver a clientes
        </Link>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardTitle>Datos de contacto</CardTitle>
            <dl className="space-y-2 text-sm">
              <Row label="RUT" value={cliente.rut ?? "—"} />
              <Row label="Contacto" value={cliente.contacto ?? "—"} />
              <Row label="Email" value={cliente.email ?? "—"} />
              <Row label="Teléfono" value={cliente.telefono ?? "—"} />
              <Row label="Dirección" value={cliente.direccion ?? "—"} />
            </dl>
          </Card>

          <Card className="lg:col-span-2">
            <CardTitle>Lotes ({cliente.lotes.length})</CardTitle>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-brand-800/70">
                  <tr>
                    <th className="py-2 pr-4">Código</th>
                    <th className="py-2 pr-4">Especie / Variedad</th>
                    <th className="py-2 pr-4">Ingreso</th>
                    <th className="py-2 pr-4">% Rechazo prom.</th>
                    <th className="py-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-950/10">
                  {cliente.lotes.map((lote) => {
                    const valores = lote.inspecciones
                      .map((i) => i.porcentajeRechazo)
                      .filter((v): v is number => v !== null && v !== undefined);
                    const promedio =
                      valores.length > 0
                        ? valores.reduce((a, b) => a + b, 0) / valores.length
                        : null;
                    return (
                      <tr key={lote.id}>
                        <td className="whitespace-nowrap py-2 pr-4 font-medium text-brand-900">
                          {lote.codigo}
                        </td>
                        <td className="whitespace-nowrap py-2 pr-4">
                          {especieLabels[lote.especie]} · {lote.variedad}
                        </td>
                        <td className="whitespace-nowrap py-2 pr-4">
                          {formatFecha(lote.fechaIngreso)}
                        </td>
                        <td className="whitespace-nowrap py-2 pr-4">
                          {formatPorcentaje(promedio)}
                        </td>
                        <td className="whitespace-nowrap py-2 text-right">
                          <Link
                            href={`/lotes/${lote.id}`}
                            className="text-brand-700 hover:underline"
                          >
                            Ver
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                  {cliente.lotes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-ink/50">
                        Este cliente todavía no tiene lotes.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {cliente.notas ? (
          <Card>
            <CardTitle>Notas</CardTitle>
            <p className="text-sm text-ink/80">{cliente.notas}</p>
          </Card>
        ) : null}
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

