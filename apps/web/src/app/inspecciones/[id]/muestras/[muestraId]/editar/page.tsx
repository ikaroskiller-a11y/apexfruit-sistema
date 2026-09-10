import { notFound } from "next/navigation";
import TopBar from "@/components/TopBar";
import { prisma } from "@/lib/prisma";
import MuestraForm from "../../MuestraForm";
import { actualizarMuestra } from "../../actions";

export default async function EditarMuestraPage({
  params,
}: {
  params: Promise<{ id: string; muestraId: string }>;
}) {
  const { id, muestraId } = await params;

  const [inspeccion, muestra, embalajesExistentes] = await Promise.all([
    prisma.inspeccion.findUnique({
      where: { id },
      include: { lote: true },
    }),
    prisma.muestra.findUnique({
      where: { id: muestraId },
      include: { defectos: true, fotos: true },
    }),
    prisma.muestra.findMany({
      where: { inspeccionId: id },
      distinct: ["embalaje"],
      select: { embalaje: true },
      orderBy: { embalaje: "asc" },
    }),
  ]);

  if (!inspeccion || !muestra || muestra.inspeccionId !== id) notFound();

  return (
    <>
      <TopBar title={`Editar muestra · ${inspeccion.lote.codigo}-M${String(muestra.numero).padStart(2, "0")}`} />
      <main className="flex-1 space-y-6 px-4 py-6 md:px-8">
        <MuestraForm
          inspeccionId={id}
          loteCodigo={inspeccion.lote.codigo}
          especie={inspeccion.lote.especie}
          embalajesExistentes={embalajesExistentes.map((e) => e.embalaje)}
          action={actualizarMuestra}
          muestra={muestra}
        />
      </main>
    </>
  );
}
