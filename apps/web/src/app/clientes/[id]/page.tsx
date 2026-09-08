import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import TopBar from "@/components/TopBar";
import { Card, CardTitle } from "@/components/ui/Card";
import { EspecieTag } from "@/components/ui/EspecieTag";
import { BotonEliminar } from "@/components/ui/BotonEliminar";
import { prisma } from "@/lib/prisma";
import { esAdmin, getCurrentUser } from "@/lib/auth";
import { formatFecha, formatPorcentaje } from "@/lib/format";
import { eliminarCliente } from "../actions";

export default async function ClienteDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [cliente, usuario] = await Promise.all([
    prisma.cliente.findUnique({
      where: { id },
      include: {
        lotes: {
          include: { inspecciones: { select: { porcentajeRechazo: true } } },
          orderBy: { fechaIngreso: "desc" },
        },
      },
    }),
    getCurrentUser(),
  ]);

  if (!cliente) notFound();
  const puedeEditar = esAdmin(usuario);

  const filas = cliente.lotes.map((lote) => {
    const valores = lote.inspecciones
      .map((i) => i.porcentajeRechazo)
      .filter((v): v is number => v !== null && v !== undefined);
    const promedio =
      valores.length > 0 ? valores.reduce((a, b) => a + b, 0) / valores.length : null;
    return { lote, promedio };
  });

  return (
    <>
      <TopBar title={cliente.nombre} />
      <main className="flex-1 space-y-6 px-4 py-6 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/clientes" className="text-sm text-brand-700 hover:underline dark:text-brand-500">
            ← Volver a clientes
          </Link>
          {puedeEditar ? (
            <div className="flex items-center gap-2">
              <Link
                href={`/clientes/${cliente.id}/editar`}
                className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-fg hover:bg-surface"
              >
                Editar
              </Link>
              <BotonEliminar
                action={eliminarCliente}
                hiddenFields={{ clienteId: cliente.id }}
                confirmMessage={`¿Eliminar el cliente "${cliente.nombre}"? Esta acción no se puede deshacer.`}
              />
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardTitle>Datos de contacto</CardTitle>
            <dl className="space-y-2 text-sm">
              <Row label="RUT" value={cliente.rut ?? "—"} mono />
              <Row label="Contacto" value={cliente.contacto ?? "—"} />
              <Row label="Email" value={cliente.email ?? "—"} />
              <Row label="Teléfono" value={cliente.telefono ?? "—"} mono />
              <Row label="Dirección" value={cliente.direccion ?? "—"} />
            </dl>
          </Card>

          <Card className="lg:col-span-2 !p-0">
            <div className="border-b border-border px-5 py-4">
              <CardTitle>Lotes ({cliente.lotes.length})</CardTitle>
            </div>

            {/* Desktop / tablet */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead className="bg-card-header text-xs uppercase tracking-wide text-fg-muted">
                  <tr>
                    <th className="px-4 py-2.5">Código</th>
                    <th className="px-4 py-2.5">Especie / Variedad</th>
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
                      <td colSpan={5} className="px-4 py-8 text-center text-fg-muted">
                        Este cliente todavía no tiene lotes.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="space-y-3 p-4 md:hidden">
              {filas.map(({ lote, promedio }) => (
                <Link key={lote.id} href={`/lotes/${lote.id}`}>
                  <Card className="!p-4">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-mono text-sm font-semibold text-fg">{lote.codigo}</p>
                      <p className="font-mono text-sm tabular-nums text-fg-muted">
                        {formatPorcentaje(promedio)}
                      </p>
                    </div>
                    <p className="mt-1 text-sm text-fg-muted">
                      <EspecieTag especie={lote.especie} variedad={lote.variedad} />
                    </p>
                    <p className="mt-1 text-xs text-fg-muted">{formatFecha(lote.fechaIngreso)}</p>
                  </Card>
                </Link>
              ))}
              {filas.length === 0 ? (
                <p className="py-6 text-center text-sm text-fg-muted">
                  Este cliente todavía no tiene lotes.
                </p>
              ) : null}
            </div>
          </Card>
        </div>

        {cliente.notas ? (
          <Card>
            <CardTitle>Notas</CardTitle>
            <p className="text-sm text-fg">{cliente.notas}</p>
          </Card>
        ) : null}
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
      <dd className={`text-right font-medium text-fg ${mono ? "font-mono" : ""}`}>{value}</dd>
    </div>
  );
}
