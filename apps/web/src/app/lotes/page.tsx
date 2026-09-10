import Link from "next/link";
import TopBar from "@/components/TopBar";
import { Card } from "@/components/ui/Card";
import { EspecieTag } from "@/components/ui/EspecieTag";
import { Pagination } from "@/components/ui/Pagination";
import { prisma } from "@/lib/prisma";
import { esAdmin, getCurrentUser } from "@/lib/auth";
import { formatFecha, formatNumero, formatPorcentaje } from "@/lib/format";

export const dynamic = "force-dynamic";

const POR_PAGINA = 25;

export default async function LotesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [lotes, totalLotes, usuario] = await Promise.all([
    prisma.lote.findMany({
      include: {
        cliente: true,
        productorRef: true,
        inspecciones: { select: { porcentajeRechazo: true } },
      },
      orderBy: { fechaIngreso: "desc" },
      skip: (page - 1) * POR_PAGINA,
      take: POR_PAGINA,
    }),
    prisma.lote.count(),
    getCurrentUser(),
  ]);

  const totalPaginas = Math.max(1, Math.ceil(totalLotes / POR_PAGINA));

  const filas = lotes.map((lote) => {
    const valores = lote.inspecciones
      .map((i) => i.porcentajeRechazo)
      .filter((v): v is number => v !== null && v !== undefined);
    const promedio =
      valores.length > 0 ? valores.reduce((a, b) => a + b, 0) / valores.length : null;
    return { lote, promedio };
  });

  return (
    <>
      <TopBar
        title="Lotes"
        actions={
          esAdmin(usuario) ? (
            <Link
              href="/lotes/nuevo"
              className="rounded-lg bg-brand-700 px-3 py-1.5 text-sm font-medium text-cream hover:bg-brand-800"
            >
              + Nuevo lote
            </Link>
          ) : null
        }
      />
      <main className="flex-1 space-y-4 px-4 py-6 md:px-8">
        {/* Desktop / tablet: tabla con encabezado sticky y overflow propio */}
        <Card className="hidden md:block !p-0">
          <div className="max-h-[70vh] overflow-auto rounded-xl">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="sticky top-0 z-10 bg-card-header text-xs uppercase tracking-wide text-fg-muted">
                <tr>
                  <th className="px-4 py-2.5">Código</th>
                  <th className="px-4 py-2.5">Especie / Variedad</th>
                  <th className="px-4 py-2.5">Cliente</th>
                  <th className="px-4 py-2.5">Productor</th>
                  <th className="px-4 py-2.5">Temporada</th>
                  <th className="px-4 py-2.5 text-right">Cajas</th>
                  <th className="px-4 py-2.5">Ingreso</th>
                  <th className="px-4 py-2.5 text-right">% Rechazo prom.</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filas.map(({ lote, promedio }) => (
                  <tr key={lote.id} className="h-10 odd:bg-card even:bg-card-alt hover:bg-surface">
                    <td className="whitespace-nowrap px-4 py-2.5 font-mono font-medium text-fg">
                      {lote.codigo}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5">
                      <EspecieTag especie={lote.especie} variedad={lote.variedad} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5">
                      {lote.cliente.nombre}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5">
                      {lote.productorRef.nombre}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5">
                      {lote.temporada}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-right font-mono tabular-nums">
                      {formatNumero(lote.cajasTotales, 0)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5">
                      {formatFecha(lote.fechaIngreso)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-right font-mono tabular-nums">
                      {formatPorcentaje(promedio)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-right">
                      <Link
                        href={`/lotes/${lote.id}`}
                        className="text-brand-700 hover:underline dark:text-brand-500"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
                {filas.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-fg-muted">
                      No hay lotes registrados todavía.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Mobile (<md): tarjetas apiladas en vez de tabla con scroll horizontal */}
        <div className="space-y-3 md:hidden">
          {filas.map(({ lote, promedio }) => (
            <Link key={lote.id} href={`/lotes/${lote.id}`}>
              <Card className="!p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-mono text-sm font-semibold text-fg">{lote.codigo}</p>
                  <p className="font-mono text-sm tabular-nums text-fg-muted">
                    {formatPorcentaje(promedio)}
                  </p>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-y-1 text-sm">
                  <dt className="text-fg-muted">Especie / Variedad</dt>
                  <dd className="flex justify-end text-right text-fg">
                    <EspecieTag especie={lote.especie} variedad={lote.variedad} />
                  </dd>
                  <dt className="text-fg-muted">Cliente</dt>
                  <dd className="text-right text-fg">{lote.cliente.nombre}</dd>
                  <dt className="text-fg-muted">Temporada</dt>
                  <dd className="text-right text-fg">{lote.temporada}</dd>
                  <dt className="text-fg-muted">Cajas</dt>
                  <dd className="text-right font-mono tabular-nums text-fg">
                    {formatNumero(lote.cajasTotales, 0)}
                  </dd>
                  <dt className="text-fg-muted">Ingreso</dt>
                  <dd className="text-right text-fg">{formatFecha(lote.fechaIngreso)}</dd>
                </dl>
              </Card>
            </Link>
          ))}
          {filas.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-fg-muted">
              No hay lotes registrados todavía.
            </p>
          ) : null}
        </div>

        <Pagination
          page={page}
          totalPages={totalPaginas}
          totalItems={totalLotes}
          buildHref={(p) => `/lotes?page=${p}`}
        />
      </main>
    </>
  );
}
