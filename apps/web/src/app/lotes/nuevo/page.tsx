import Link from "next/link";
import { redirect } from "next/navigation";
import TopBar from "@/components/TopBar";
import { Card } from "@/components/ui/Card";
import { prisma } from "@/lib/prisma";
import { esAdmin, getCurrentUser } from "@/lib/auth";
import LoteForm from "../LoteForm";

export const dynamic = "force-dynamic";

export default async function NuevoLotePage() {
  const usuario = await getCurrentUser();
  if (!usuario) redirect("/login?next=/lotes/nuevo");
  if (!esAdmin(usuario)) redirect("/lotes");

  const clientes = await prisma.cliente.findMany({ orderBy: { nombre: "asc" } });

  return (
    <>
      <TopBar title="Nuevo lote" />
      <main className="flex-1 px-4 py-6 md:px-8">
        <Card className="mx-auto max-w-3xl">
          {clientes.length === 0 ? (
            <p className="text-sm text-fg-muted">
              Todavía no hay clientes registrados. Crea un cliente primero desde{" "}
              <Link href="/clientes/nuevo" className="text-brand-700 hover:underline dark:text-brand-500">
                Clientes
              </Link>
              .
            </p>
          ) : (
            <LoteForm clientes={clientes} />
          )}
        </Card>
      </main>
    </>
  );
}
