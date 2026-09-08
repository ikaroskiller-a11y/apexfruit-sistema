import { notFound, redirect } from "next/navigation";
import TopBar from "@/components/TopBar";
import { Card } from "@/components/ui/Card";
import { prisma } from "@/lib/prisma";
import { esAdmin, getCurrentUser } from "@/lib/auth";
import InspeccionForm from "../../InspeccionForm";
import { actualizarInspeccion } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditarInspeccionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const usuarioActual = await getCurrentUser();
  if (!usuarioActual) redirect(`/login?next=/inspecciones/${id}/editar`);

  const inspeccion = await prisma.inspeccion.findUnique({
    where: { id },
    include: { defectos: true, fotos: true, lote: true },
  });
  if (!inspeccion) notFound();

  const puedeEditar = esAdmin(usuarioActual) || usuarioActual.id === inspeccion.inspectorId;
  if (!puedeEditar) redirect(`/inspecciones/${id}`);

  const [lotes, inspectores] = await Promise.all([
    prisma.lote.findMany({ include: { cliente: true }, orderBy: { fechaIngreso: "desc" } }),
    prisma.usuario.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } }),
  ]);

  return (
    <>
      <TopBar title={`Editar inspección · ${inspeccion.lote.codigo}`} />
      <main className="flex-1 px-4 py-6 md:px-8">
        <Card className="mx-auto max-w-4xl">
          <InspeccionForm
            lotes={lotes}
            inspectores={inspectores}
            usuarioActual={usuarioActual}
            action={actualizarInspeccion}
            inspeccion={inspeccion}
          />
        </Card>
      </main>
    </>
  );
}
