import TopBar from "@/components/TopBar";
import { Card } from "@/components/ui/Card";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import InspeccionForm from "../InspeccionForm";
import { crearInspeccion } from "./actions";

export const dynamic = "force-dynamic";

export default async function NuevaInspeccionPage() {
  const [lotes, inspectores, usuarioActual] = await Promise.all([
    prisma.lote.findMany({
      include: { cliente: true },
      orderBy: { fechaIngreso: "desc" },
    }),
    prisma.usuario.findMany({
      where: { activo: true },
      orderBy: { nombre: "asc" },
    }),
    getCurrentUser(),
  ]);

  return (
    <>
      <TopBar title="Nueva inspección" />
      <main className="flex-1 px-4 py-6 md:px-8">
        {lotes.length === 0 ? (
          <Card className="mx-auto max-w-4xl">
            <p className="text-sm text-fg-muted">
              Todavía no hay lotes registrados. Corre{" "}
              <code className="rounded bg-card-alt px-1 font-mono">npm run db:seed</code>{" "}
              o crea un lote directamente en la base de datos para poder
              registrar inspecciones.
            </p>
          </Card>
        ) : (
          // El formulario arma sus propias tarjetas por sección — acá solo
          // se limita el ancho de lectura, sin envolverlo en una Card extra
          // que duplicaría el borde.
          <div className="mx-auto max-w-4xl">
            <InspeccionForm
              lotes={lotes}
              inspectores={inspectores}
              usuarioActual={usuarioActual}
              action={crearInspeccion}
            />
          </div>
        )}
      </main>
    </>
  );
}
