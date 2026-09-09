import { redirect } from "next/navigation";
import TopBar from "@/components/TopBar";
import { Card } from "@/components/ui/Card";
import { esAdmin, getCurrentUser } from "@/lib/auth";
import UsuarioForm from "../UsuarioForm";

export const dynamic = "force-dynamic";

export default async function NuevoUsuarioPage() {
  const usuario = await getCurrentUser();
  if (!usuario) redirect("/login?next=/usuarios/nuevo");
  if (!esAdmin(usuario)) redirect("/dashboard");

  return (
    <>
      <TopBar title="Nuevo usuario" />
      <main className="flex-1 px-4 py-6 md:px-8">
        <Card className="mx-auto max-w-2xl">
          <UsuarioForm />
        </Card>
      </main>
    </>
  );
}
