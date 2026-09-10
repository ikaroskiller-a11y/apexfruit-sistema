import { notFound, redirect } from "next/navigation";
import TopBar from "@/components/TopBar";
import { Card } from "@/components/ui/Card";
import { prisma } from "@/lib/prisma";
import { esAdmin, getCurrentUser } from "@/lib/auth";
import ProductorForm from "../../ProductorForm";

export const dynamic = "force-dynamic";

export default async function EditarProductorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const usuario = await getCurrentUser();
  if (!usuario) redirect(`/login?next=/productores/${id}/editar`);
  if (!esAdmin(usuario)) redirect(`/productores/${id}`);

  const productor = await prisma.productor.findUnique({ where: { id } });
  if (!productor) notFound();

  return (
    <>
      <TopBar title={`Editar productor · ${productor.nombre}`} />
      <main className="flex-1 px-4 py-6 md:px-8">
        <Card className="mx-auto max-w-2xl">
          <ProductorForm productor={productor} />
        </Card>
      </main>
    </>
  );
}
