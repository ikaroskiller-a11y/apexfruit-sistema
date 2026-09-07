import { getCurrentUser } from "@/lib/auth";
import { salirSesion } from "@/app/login/actions";
import { rolLabels } from "@/lib/labels";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LogOut } from "lucide-react";

export default async function TopBar({ title }: { title: string }) {
  const user = await getCurrentUser();

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card px-4 py-4 md:px-8 print:hidden">
      <h1 className="text-2xl leading-[30px] font-semibold text-fg">{title}</h1>

      <div className="flex items-center gap-3">
        <ThemeToggle />

        {user ? (
          <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm text-fg">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-700 text-[10px] font-semibold text-cream">
              {user.nombre
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </span>
            <span className="hidden sm:inline">
              {user.nombre} · {rolLabels[user.rol]}
            </span>
            <form action={salirSesion}>
              <button
                type="submit"
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
                className="flex h-6 w-6 items-center justify-center rounded-full text-fg-muted hover:bg-card-alt hover:text-fg"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </form>
          </div>
        ) : null}
      </div>
    </header>
  );
}
