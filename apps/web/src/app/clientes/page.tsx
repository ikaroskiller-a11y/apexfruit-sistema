import Link from "next/link";
import TopBar from "@/components/TopBar";
import { Card } from "@/components/ui/Card";
import { prisma } from "@/lib/prisma";
import { esAdmin, getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  const [clientes, usuario] = await Promise.all([
    prisma.cliente.findMany({
      include: { _count: { select: { lotes: true } } },
      orderBy: { nombre: "asc" },
    }),
    getCurrentUser(),
  ]);

  return (
    <>
      <TopBar
        title="Clientes"
        actions={
          esAdmin(usuario) ? (
            <Link
              href="/clientes/nuevo"
              className="rounded-lg bg-brand-700 px-3 py-1.5 text-sm font-medium text-cream hover:bg-brand-800"
            >
              + Nuevo cliente
            </Link>
          ) : null
        }
      />
      <main className="flex-1 px-4 py-6 md:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clientes.map((cliente) => (
            <Link key={cliente.id} href={`/clientes/${cliente.id}`}>
              <Card className="h-full transition-shadow hover:shadow-md dark:hover:shadow-none dark:hover:border-brand-500/40">
                <p className="font-semibold text-fg">{cliente.nombre}</p>
                {cliente.rut ? (
                  <p className="font-mono text-xs text-fg-muted">{cliente.rut}</p>
                ) : null}
                <div className="mt-3 flex items-center gap-4 text-sm text-fg">
                  <span className="font-mono tabular-nums">{cliente._count.lotes}</span>
                  <span className="text-fg-muted">lotes</span>
                </div>
                {cliente.contacto ? (
                  <p className="mt-2 text-sm text-fg-muted">
                    Contacto: {cliente.contacto}
                  </p>
                ) : null}
              </Card>
            </Link>
          ))}
          {clientes.length === 0 ? (
            <p className="text-sm text-fg-muted">No hay clientes registrados todavía.</p>
          ) : null}
        </div>
      </main>
    </>
  );
}
