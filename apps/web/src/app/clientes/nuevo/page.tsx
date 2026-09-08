import { redirect } from "next/navigation";
import TopBar from "@/components/TopBar";
import { Card } from "@/components/ui/Card";
import { esAdmin, getCurrentUser } from "@/lib/auth";
import ClienteForm from "../ClienteForm";

export const dynamic = "force-dynamic";

export default async function NuevoClientePage() {
  const usuario = await getCurrentUser();
  if (!usuario) redirect("/login?next=/clientes/nuevo");
  if (!esAdmin(usuario)) redirect("/clientes");

  return (
    <>
      <TopBar title="Nuevo cliente" />
      <main className="flex-1 px-4 py-6 md:px-8">
        <Card className="mx-auto max-w-2xl">
          <ClienteForm />
        </Card>
      </main>
    </>
  );
}
