import Link from "next/link";
import TopBar from "@/components/TopBar";
import { Card } from "@/components/ui/Card";
import { prisma } from "@/lib/prisma";
import { esAdmin, getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ProductoresPage() {
  const [productores, usuario] = await Promise.all([
    prisma.productor.findMany({
      include: { _count: { select: { lotes: true } } },
      orderBy: { nombre: "asc" },
    }),
    getCurrentUser(),
  ]);

  return (
    <>
      <TopBar
        title="Productores"
        actions={
          esAdmin(usuario) ? (
            <Link
              href="/productores/nuevo"
              className="rounded-lg bg-brand-700 px-3 py-1.5 text-sm font-medium text-cream hover:bg-brand-800"
            >
              + Nuevo productor
            </Link>
          ) : null
        }
      />
      <main className="flex-1 px-4 py-6 md:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {productores.map((productor) => (
            <Link key={productor.id} href={`/productores/${productor.id}`}>
              <Card className="h-full transition-shadow hover:shadow-md dark:hover:shadow-none dark:hover:border-brand-500/40">
                <p className="font-semibold text-fg">{productor.nombre}</p>
                {productor.rut ? (
                  <p className="font-mono text-xs text-fg-muted">{productor.rut}</p>
                ) : null}
                <div className="mt-3 flex items-center gap-4 text-sm text-fg">
                  <span className="font-mono tabular-nums">{productor._count.lotes}</span>
                  <span className="text-fg-muted">lotes</span>
                </div>
                {productor.contacto ? (
                  <p className="mt-2 text-sm text-fg-muted">
                    Contacto: {productor.contacto}
                  </p>
                ) : null}
              </Card>
            </Link>
          ))}
          {productores.length === 0 ? (
            <p className="text-sm text-fg-muted">No hay productores registrados todavía.</p>
          ) : null}
        </div>
      </main>
    </>
  );
}
