import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { rolLabels } from "@/lib/labels";
import { ThemeToggle } from "@/components/ThemeToggle";

export default async function TopBar({ title }: { title: string }) {
  const user = await getCurrentUser();

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card px-4 py-4 md:px-8 print:hidden">
      <h1 className="text-2xl leading-[30px] font-semibold text-fg">{title}</h1>

      <div className="flex items-center gap-3">
        <ThemeToggle />

        <Link
          href="/login"
          className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm text-fg hover:border-brand-500/40"
          title="Autenticación real pendiente — ver /login"
        >
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
        </Link>
      </div>
    </header>
  );
}
