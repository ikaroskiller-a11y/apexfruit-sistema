import { notFound, redirect } from "next/navigation";
import TopBar from "@/components/TopBar";
import { Card } from "@/components/ui/Card";
import { prisma } from "@/lib/prisma";
import { esAdmin, getCurrentUser } from "@/lib/auth";
import LoteForm from "../../LoteForm";

export const dynamic = "force-dynamic";

export default async function EditarLotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const usuario = await getCurrentUser();
  if (!usuario) redirect(`/login?next=/lotes/${id}/editar`);
  if (!esAdmin(usuario)) redirect(`/lotes/${id}`);

  const [lote, clientes, productores] = await Promise.all([
    prisma.lote.findUnique({ where: { id } }),
    prisma.cliente.findMany({ orderBy: { nombre: "asc" } }),
    prisma.productor.findMany({ orderBy: { nombre: "asc" } }),
  ]);
  if (!lote) notFound();

  return (
    <>
      <TopBar title={`Editar lote · ${lote.codigo}`} />
      <main className="flex-1 px-4 py-6 md:px-8">
        <Card className="mx-auto max-w-3xl">
          <LoteForm clientes={clientes} productores={productores} lote={lote} />
        </Card>
      </main>
    </>
  );
}
