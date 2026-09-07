import TopBar from "@/components/TopBar";
import { Card } from "@/components/ui/Card";
import { prisma } from "@/lib/prisma";
import NuevaInspeccionForm from "./NuevaInspeccionForm";

export const dynamic = "force-dynamic";

export default async function NuevaInspeccionPage() {
  const [lotes, inspectores] = await Promise.all([
    prisma.lote.findMany({
      include: { cliente: true },
      orderBy: { fechaIngreso: "desc" },
    }),
    prisma.usuario.findMany({
      where: { activo: true },
      orderBy: { nombre: "asc" },
    }),
  ]);

  return (
    <>
      <TopBar title="Nueva inspección" />
      <main className="flex-1 px-4 py-6 md:px-8">
        <Card className="mx-auto max-w-4xl">
          {lotes.length === 0 ? (
            <p className="text-sm text-fg-muted">
              Todavía no hay lotes registrados. Corre{" "}
              <code className="rounded bg-card-alt px-1 font-mono">npm run db:seed</code>{" "}
              o crea un lote directamente en la base de datos para poder
              registrar inspecciones.
            </p>
          ) : (
            <NuevaInspeccionForm lotes={lotes} inspectores={inspectores} />
          )}
        </Card>
      </main>
    </>
  );
}
