import Link from "next/link";
import TopBar from "@/components/TopBar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { prisma } from "@/lib/prisma";
import { especieLabels, resultadoBadgeClasses, resultadoLabels } from "@/lib/labels";
import { formatFecha, formatPorcentaje } from "@/lib/format";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

type SearchParams = {
  clienteId?: string;
  loteCodigo?: string;
  desde?: string;
  hasta?: string;
};

export default async function InspeccionesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const where: Prisma.InspeccionWhereInput = {};

  if (params.clienteId) {
    where.lote = { clienteId: params.clienteId };
  }
  if (params.loteCodigo) {
    where.lote = {
      ...(where.lote as Prisma.LoteWhereInput),
      codigo: { contains: params.loteCodigo },
    };
  }
  if (params.desde || params.hasta) {
    where.fecha = {
      ...(params.desde ? { gte: new Date(params.desde) } : {}),
      ...(params.hasta ? { lte: new Date(`${params.hasta}T23:59:59`) } : {}),
    };
  }

  const [inspecciones, clientes] = await Promise.all([
    prisma.inspeccion.findMany({
      where,
      include: {
        lote: { include: { cliente: true } },
        inspector: true,
      },
      orderBy: { fecha: "desc" },
      take: 200,
    }),
    prisma.cliente.findMany({ orderBy: { nombre: "asc" } }),
  ]);

  return (
    <>
      <TopBar title="Inspecciones" />
      <main className="flex-1 space-y-6 px-4 py-6 md:px-8">
        <Card className="!p-4">
          <form className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="mb-1 block text-xs font-medium text-brand-800">
                Cliente
              </label>
              <select
                name="clienteId"
                defaultValue={params.clienteId ?? ""}
                className="w-full rounded-lg border border-brand-950/15 bg-white px-3 py-2 text-sm"
              >
                <option value="">Todos</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-brand-800">
                Código de lote
              </label>
              <input
                type="text"
                name="loteCodigo"
                placeholder="AF-2526-0001"
                defaultValue={params.loteCodigo ?? ""}
                className="w-full rounded-lg border border-brand-950/15 bg-white px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-brand-800">
                Desde
              </label>
              <input
                type="date"
                name="desde"
                defaultValue={params.desde ?? ""}
                className="w-full rounded-lg border border-brand-950/15 bg-white px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-brand-800">
                Hasta
              </label>
              <input
                type="date"
                name="hasta"
                defaultValue={params.hasta ?? ""}
                className="w-full rounded-lg border border-brand-950/15 bg-white px-3 py-2 text-sm"
              />
            </div>

            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-cream hover:bg-brand-800"
              >
                Filtrar
              </button>
              <Link
                href="/inspecciones"
                className="rounded-lg border border-brand-950/15 px-4 py-2 text-sm text-ink/70 hover:bg-brand-950/5"
              >
                Limpiar
              </Link>
            </div>
          </form>
        </Card>

        <Card className="!p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-brand-950/5 text-xs uppercase tracking-wide text-brand-800">
                <tr>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Lote</th>
                  <th className="px-4 py-3">Especie / Variedad</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Inspector</th>
                  <th className="px-4 py-3">°Brix</th>
                  <th className="px-4 py-3">% Rechazo</th>
                  <th className="px-4 py-3">Resultado</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-950/10">
                {inspecciones.map((insp) => (
                  <tr key={insp.id} className="hover:bg-brand-950/[0.03]">
                    <td className="whitespace-nowrap px-4 py-3">
                      {formatFecha(insp.fecha)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-brand-900">
                      {insp.lote.codigo}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {especieLabels[insp.lote.especie]} · {insp.lote.variedad}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {insp.lote.cliente.nombre}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {insp.inspector.nombre}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {insp.brixGrados ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {formatPorcentaje(insp.porcentajeRechazo)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Badge className={resultadoBadgeClasses[insp.resultado]}>
                        {resultadoLabels[insp.resultado]}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <Link
                        href={`/inspecciones/${insp.id}`}
                        className="text-brand-700 hover:underline"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
                {inspecciones.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-ink/50">
                      No hay inspecciones que calcen con el filtro.
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
