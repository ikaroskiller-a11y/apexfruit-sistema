import Link from "next/link";
import { redirect } from "next/navigation";
import TopBar from "@/components/TopBar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { prisma } from "@/lib/prisma";
import { esAdmin, getCurrentUser } from "@/lib/auth";
import { rolLabels } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function UsuariosPage() {
  const usuarioActual = await getCurrentUser();
  if (!usuarioActual) redirect("/login?next=/usuarios");
  // Gestión de usuarios es admin-only incluso para solo ver la lista (correos
  // y roles de todo el equipo) — a diferencia de Clientes/Lotes, donde un
  // INSPECTOR sí puede ver el listado y solo se le bloquean las mutaciones.
  if (!esAdmin(usuarioActual)) redirect("/dashboard");

  const usuarios = await prisma.usuario.findMany({
    include: { _count: { select: { inspecciones: true } } },
    orderBy: { nombre: "asc" },
  });

  return (
    <>
      <TopBar
        title="Usuarios"
        actions={
          <Link
            href="/usuarios/nuevo"
            className="rounded-lg bg-brand-700 px-3 py-1.5 text-sm font-medium text-cream hover:bg-brand-800"
          >
            + Nuevo usuario
          </Link>
        }
      />
      <main className="flex-1 px-4 py-6 md:px-8">
        <Card className="!p-0">
          {/* Desktop / tablet */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="bg-card-header text-xs uppercase tracking-wide text-fg-muted">
                <tr>
                  <th className="px-4 py-2.5">Nombre</th>
                  <th className="px-4 py-2.5">Correo</th>
                  <th className="px-4 py-2.5">Rol</th>
                  <th className="px-4 py-2.5">Estado</th>
                  <th className="px-4 py-2.5 text-right">Inspecciones</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {usuarios.map((u) => (
                  <tr key={u.id} className="h-10 odd:bg-card even:bg-card-alt hover:bg-surface">
                    <td className="whitespace-nowrap px-4 py-2.5 font-medium text-fg">
                      {u.nombre}
                      {u.id === usuarioActual.id ? (
                        <span className="ml-1.5 text-xs text-fg-muted">(tú)</span>
                      ) : null}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-fg-muted">
                      {u.email}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5">{rolLabels[u.rol]}</td>
                    <td className="whitespace-nowrap px-4 py-2.5">
                      <Badge status={u.activo ? "success" : "danger"}>
                        {u.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-right font-mono tabular-nums">
                      {u._count.inspecciones}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-right">
                      <Link
                        href={`/usuarios/${u.id}/editar`}
                        className="text-brand-700 hover:underline dark:text-brand-500"
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="space-y-3 p-4 md:hidden">
            {usuarios.map((u) => (
              <Link key={u.id} href={`/usuarios/${u.id}/editar`}>
                <Card className="!p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold text-fg">
                      {u.nombre}
                      {u.id === usuarioActual.id ? (
                        <span className="ml-1.5 text-xs font-normal text-fg-muted">(tú)</span>
                      ) : null}
                    </p>
                    <Badge status={u.activo ? "success" : "danger"}>
                      {u.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                  <p className="mt-1 font-mono text-xs text-fg-muted">{u.email}</p>
                  <p className="mt-1 text-sm text-fg-muted">
                    {rolLabels[u.rol]} · {u._count.inspecciones} inspecciones
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </Card>
      </main>
    </>
  );
}
