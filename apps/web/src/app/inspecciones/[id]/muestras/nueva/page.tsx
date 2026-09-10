import { notFound } from "next/navigation";
import TopBar from "@/components/TopBar";
import { prisma } from "@/lib/prisma";
import MuestraForm from "../MuestraForm";
import { crearMuestra } from "../actions";

export default async function NuevaMuestraPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [inspeccion, embalajesExistentes] = await Promise.all([
    prisma.inspeccion.findUnique({
      where: { id },
      include: { lote: true },
    }),
    prisma.muestra.findMany({
      where: { inspeccionId: id },
      distinct: ["embalaje"],
      select: { embalaje: true },
      orderBy: { embalaje: "asc" },
    }),
  ]);

  if (!inspeccion) notFound();

  return (
    <>
      <TopBar title={`Nueva muestra · ${inspeccion.lote.codigo}`} />
      <main className="flex-1 space-y-6 px-4 py-6 md:px-8">
        <MuestraForm
          inspeccionId={id}
          loteCodigo={inspeccion.lote.codigo}
          especie={inspeccion.lote.especie}
          embalajesExistentes={embalajesExistentes.map((e) => e.embalaje)}
          action={crearMuestra}
        />
      </main>
    </>
  );
}
