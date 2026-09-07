import Link from "next/link";
import TopBar from "@/components/TopBar";
import { Card } from "@/components/ui/Card";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  const clientes = await prisma.cliente.findMany({
    include: { _count: { select: { lotes: true } } },
    orderBy: { nombre: "asc" },
  });

  return (
    <>
      <TopBar title="Clientes" />
      <main className="flex-1 px-4 py-6 md:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clientes.map((cliente) => (
            <Link key={cliente.id} href={`/clientes/${cliente.id}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <p className="font-semibold text-brand-950">{cliente.nombre}</p>
                {cliente.rut ? (
                  <p className="text-xs text-ink/50">{cliente.rut}</p>
                ) : null}
                <div className="mt-3 flex items-center gap-4 text-sm text-ink/70">
                  <span>{cliente._count.lotes} lotes</span>
                </div>
                {cliente.contacto ? (
                  <p className="mt-2 text-sm text-ink/60">
                    Contacto: {cliente.contacto}
                  </p>
                ) : null}
              </Card>
            </Link>
          ))}
          {clientes.length === 0 ? (
            <p className="text-sm text-ink/50">No hay clientes registrados todavía.</p>
          ) : null}
        </div>
      </main>
    </>
  );
}
