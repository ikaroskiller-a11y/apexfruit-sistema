import { notFound, redirect } from "next/navigation";
import TopBar from "@/components/TopBar";
import { Card } from "@/components/ui/Card";
import { prisma } from "@/lib/prisma";
import { esAdmin, getCurrentUser } from "@/lib/auth";
import ClienteForm from "../../ClienteForm";

export const dynamic = "force-dynamic";

export default async function EditarClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const usuario = await getCurrentUser();
  if (!usuario) redirect(`/login?next=/clientes/${id}/editar`);
  if (!esAdmin(usuario)) redirect(`/clientes/${id}`);

  const cliente = await prisma.cliente.findUnique({ where: { id } });
  if (!cliente) notFound();

  return (
    <>
      <TopBar title={`Editar cliente · ${cliente.nombre}`} />
      <main className="flex-1 px-4 py-6 md:px-8">
        <Card className="mx-auto max-w-2xl">
          <ClienteForm cliente={cliente} />
        </Card>
      </main>
    </>
  );
}
