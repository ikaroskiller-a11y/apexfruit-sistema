import { redirect } from "next/navigation";
import TopBar from "@/components/TopBar";
import { Card } from "@/components/ui/Card";
import { esAdmin, getCurrentUser } from "@/lib/auth";
import ProductorForm from "../ProductorForm";

export const dynamic = "force-dynamic";

export default async function NuevoProductorPage() {
  const usuario = await getCurrentUser();
  if (!usuario) redirect("/login?next=/productores/nuevo");
  if (!esAdmin(usuario)) redirect("/productores");

  return (
    <>
      <TopBar title="Nuevo productor" />
      <main className="flex-1 px-4 py-6 md:px-8">
        <Card className="mx-auto max-w-2xl">
          <ProductorForm />
        </Card>
      </main>
    </>
  );
}
