import { notFound, redirect } from "next/navigation";
import TopBar from "@/components/TopBar";
import { Card } from "@/components/ui/Card";
import { prisma } from "@/lib/prisma";
import { esAdmin, getCurrentUser } from "@/lib/auth";
import UsuarioForm from "../../UsuarioForm";

export const dynamic = "force-dynamic";

export default async function EditarUsuarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const usuarioActual = await getCurrentUser();
  if (!usuarioActual) redirect(`/login?next=/usuarios/${id}/editar`);
  if (!esAdmin(usuarioActual)) redirect("/dashboard");

  const usuario = await prisma.usuario.findUnique({ where: { id } });
  if (!usuario) notFound();

  return (
    <>
      <TopBar title={`Editar usuario · ${usuario.nombre}`} />
      <main className="flex-1 px-4 py-6 md:px-8">
        <Card className="mx-auto max-w-2xl">
          <UsuarioForm usuario={usuario} esUnoMismo={usuario.id === usuarioActual.id} />
        </Card>
      </main>
    </>
  );
}
