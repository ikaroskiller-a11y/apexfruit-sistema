import Link from "next/link";
import TopBar from "@/components/TopBar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EspecieTag } from "@/components/ui/EspecieTag";
import { Field, inputClass } from "@/components/ui/FormField";
import { Pagination } from "@/components/ui/Pagination";
import { prisma } from "@/lib/prisma";
import {
  resultadoStatusMap,
  resultadoLabels,
  etapaInspeccionLabels,
  etapaInspeccionOptions,
} from "@/lib/labels";
import { formatFecha, formatPorcentaje } from "@/lib/format";
import type { EtapaInspeccion, Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

const POR_PAGINA = 25;

type SearchParams = {
  clienteId?: string;
  loteCodigo?: string;
  etapa?: string;
  desde?: string;
  hasta?: string;
  page?: string;
};

export default async function InspeccionesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);

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
  if (params.etapa) {
    where.etapa = params.etapa as EtapaInspeccion;
  }
  if (params.desde || params.hasta) {
    where.fecha = {
      ...(params.desde ? { gte: new Date(params.desde) } : {}),
      ...(params.hasta ? { lte: new Date(`${params.hasta}T23:59:59`) } : {}),
    };
  }

  const [inspecciones, totalInspecciones, clientes] = await Promise.all([
    prisma.inspeccion.findMany({
      where,
      include: {
        lote: { include: { cliente: true } },
        inspector: true,
      },
      orderBy: { fecha: "desc" },
      skip: (page - 1) * POR_PAGINA,
      take: POR_PAGINA,
    }),
    prisma.inspeccion.count({ where }),
    prisma.cliente.findMany({ orderBy: { nombre: "asc" } }),
  ]);

  const totalPaginas = Math.max(1, Math.ceil(totalInspecciones / POR_PAGINA));

  function buildHref(p: number) {
    const sp = new URLSearchParams();
    if (params.clienteId) sp.set("clienteId", params.clienteId);
    if (params.loteCodigo) sp.set("loteCodigo", params.loteCodigo);
    if (params.etapa) sp.set("etapa", params.etapa);
    if (params.desde) sp.set("desde", params.desde);
    if (params.hasta) sp.set("hasta", params.hasta);
    sp.set("page", String(p));
    return `/inspecciones?${sp.toString()}`;
  }

  return (
    <>
      <TopBar title="Inspecciones" />
      <main className="flex-1 space-y-6 px-4 py-6 md:px-8">
        <Card className="!p-4">
          <form className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <Field label="Cliente">
              <select
                name="clienteId"
                defaultValue={params.clienteId ?? ""}
                className={inputClass}
              >
                <option value="">Todos</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Código de lote">
              <input
                type="text"
                name="loteCodigo"
                placeholder="AF-2526-0001"
                defaultValue={params.loteCodigo ?? ""}
                className={`${inputClass} font-mono`}
              />
            </Field>

            <Field label="Etapa">
              <select name="etapa" defaultValue={params.etapa ?? ""} className={inputClass}>
                <option value="">Todas</option>
                {etapaInspeccionOptions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Desde">
              <input
                type="date"
                name="desde"
                defaultValue={params.desde ?? ""}
                className={inputClass}
              />
            </Field>

            <Field label="Hasta">
              <input
                type="date"
                name="hasta"
                defaultValue={params.hasta ?? ""}
                className={inputClass}
              />
            </Field>

            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-cream hover:bg-brand-800"
              >
                Filtrar
              </button>
              <Link
                href="/inspecciones"
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-fg hover:bg-surface"
              >
                Limpiar
              </Link>
            </div>
          </form>
        </Card>

        {/* Desktop / tablet: tabla con encabezado sticky y overflow propio */}
        <Card className="hidden md:block !p-0">
          <div className="max-h-[70vh] overflow-auto rounded-xl">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="sticky top-0 z-10 bg-card-header text-xs uppercase tracking-wide text-fg-muted">
                <tr>
                  <th className="px-4 py-2.5">Fecha</th>
                  <th className="px-4 py-2.5">Lote</th>
                  <th className="px-4 py-2.5">Especie / Variedad</th>
                  <th className="px-4 py-2.5">Cliente</th>
                  <th className="px-4 py-2.5">Inspector</th>
                  <th className="px-4 py-2.5">Etapa</th>
                  <th className="px-4 py-2.5 text-right">°Brix</th>
                  <th className="px-4 py-2.5 text-right">% Rechazo</th>
                  <th className="px-4 py-2.5">Resultado</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {inspecciones.map((insp) => {
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
                      <td className="whitespace-nowrap px-4 py-2.5">
                        {formatFecha(insp.fecha)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 font-mono font-medium text-fg">
                        {insp.lote.codigo}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5">
                        <EspecieTag especie={insp.lote.especie} variedad={insp.lote.variedad} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5">
                        {insp.lote.cliente.nombre}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5">
                        {insp.inspector.nombre}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-fg-muted">
                        {etapaInspeccionLabels[insp.etapa]}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-right font-mono tabular-nums">
                        {insp.brixGrados ?? "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-right font-mono tabular-nums">
                        {formatPorcentaje(insp.porcentajeRechazo)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5">
                        <Badge status={resultadoStatusMap[insp.resultado]}>
                          {resultadoLabels[insp.resultado]}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-right">
                        <Link
                          href={`/inspecciones/${insp.id}`}
                          className="text-brand-700 hover:underline dark:text-brand-500"
                        >
                          Ver
                        </Link>
                      </td>
                    </tr>
                  );
                })}
                {inspecciones.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-10 text-center text-fg-muted">
                      No hay inspecciones que calcen con el filtro.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Mobile (<md): tarjetas apiladas en vez de tabla con scroll horizontal */}
        <div className="space-y-3 md:hidden">
          {inspecciones.map((insp) => {
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
                      <p className="font-mono text-sm font-semibold text-fg">
                        {insp.lote.codigo}
                      </p>
                      <p className="text-xs text-fg-muted">{formatFecha(insp.fecha)}</p>
                    </div>
                    <Badge status={resultadoStatusMap[insp.resultado]}>
                      {resultadoLabels[insp.resultado]}
                    </Badge>
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-y-1 text-sm">
                    <dt className="text-fg-muted">Especie / Variedad</dt>
                    <dd className="flex justify-end text-right text-fg">
                      <EspecieTag especie={insp.lote.especie} variedad={insp.lote.variedad} />
                    </dd>
                    <dt className="text-fg-muted">Cliente</dt>
                    <dd className="text-right text-fg">{insp.lote.cliente.nombre}</dd>
                    <dt className="text-fg-muted">Inspector</dt>
                    <dd className="text-right text-fg">{insp.inspector.nombre}</dd>
                    <dt className="text-fg-muted">Etapa</dt>
                    <dd className="text-right text-fg">{etapaInspeccionLabels[insp.etapa]}</dd>
                    <dt className="text-fg-muted">% Rechazo</dt>
                    <dd className="text-right font-mono tabular-nums text-fg">
                      {formatPorcentaje(insp.porcentajeRechazo)}
                    </dd>
                  </dl>
                </Card>
              </Link>
            );
          })}
          {inspecciones.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-fg-muted">
              No hay inspecciones que calcen con el filtro.
            </p>
          ) : null}
        </div>

        <Pagination
          page={page}
          totalPages={totalPaginas}
          totalItems={totalInspecciones}
          buildHref={buildHref}
        />
      </main>
    </>
  );
}
