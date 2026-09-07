import Link from "next/link";
import TopBar from "@/components/TopBar";
import { Card } from "@/components/ui/Card";
import { prisma } from "@/lib/prisma";
import { especieLabels } from "@/lib/labels";
import { formatFecha, formatNumero, formatPorcentaje } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function LotesPage() {
  const lotes = await prisma.lote.findMany({
    include: {
      cliente: true,
      inspecciones: { select: { porcentajeRechazo: true } },
    },
    orderBy: { fechaIngreso: "desc" },
  });

  return (
    <>
      <TopBar title="Lotes" />
      <main className="flex-1 px-4 py-6 md:px-8">
        <Card className="!p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-brand-950/5 text-xs uppercase tracking-wide text-brand-800">
                <tr>
                  <th className="px-4 py-3">Código</th>
                  <th className="px-4 py-3">Especie / Variedad</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Productor</th>
                  <th className="px-4 py-3">Temporada</th>
                  <th className="px-4 py-3">Cajas</th>
                  <th className="px-4 py-3">Ingreso</th>
                  <th className="px-4 py-3">% Rechazo prom.</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-950/10">
                {lotes.map((lote) => {
                  const valores = lote.inspecciones
                    .map((i) => i.porcentajeRechazo)
                    .filter((v): v is number => v !== null && v !== undefined);
                  const promedio =
                    valores.length > 0
                      ? valores.reduce((a, b) => a + b, 0) / valores.length
                      : null;
                  return (
                    <tr key={lote.id} className="hover:bg-brand-950/[0.03]">
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-brand-900">
                        {lote.codigo}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        {especieLabels[lote.especie]} · {lote.variedad}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        {lote.cliente.nombre}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        {lote.productor}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        {lote.temporada}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        {formatNumero(lote.cajasTotales, 0)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        {formatFecha(lote.fechaIngreso)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        {formatPorcentaje(promedio)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
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
                {lotes.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-ink/50">
                      No hay lotes registrados todavía.
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
