import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { rolLabels } from "@/lib/labels";

export default async function TopBar({ title }: { title: string }) {
  const user = await getCurrentUser();

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-950/10 bg-paper px-4 py-4 md:px-8">
      <h1 className="text-xl font-semibold text-brand-950">{title}</h1>

      <Link
        href="/login"
        className="flex items-center gap-2 rounded-full border border-brand-950/10 bg-white px-3 py-1.5 text-sm text-ink hover:border-brand-500/40"
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
    </header>
  );
}
