"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { esLinkActivo, ramaActiva, type NavLink } from "../nav-links";

/**
 * Único lugar donde vive el markup de un ítem de navegación — tanto
 * Sidebar.tsx (desktop) como MobileDrawer.tsx (mobile) renderizan el mismo
 * árbol acá, evitando duplicar JSX de links entre ambos.
 */
export function NavTree({
  links,
  variant,
  onNavigate,
}: {
  links: NavLink[];
  variant: "desktop" | "mobile";
  /** Se llama al navegar a un link — usado por MobileDrawer para cerrarse. */
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const search = useSearchParams();

  const [expandido, setExpandido] = useState<Set<string>>(() => {
    const inicial = new Set<string>();
    for (const link of links) {
      if (link.children && ramaActiva(link, pathname, search)) inicial.add(link.label);
    }
    return inicial;
  });

  function alternarExpandido(label: string) {
    setExpandido((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  return (
    <nav className={variant === "desktop" ? "flex-1 space-y-1 px-3" : "space-y-1 px-3 py-3"}>
      {links.map((link) => (
        <NavItem
          key={link.label}
          link={link}
          pathname={pathname}
          search={search}
          expandido={expandido}
          onToggle={alternarExpandido}
          onNavigate={onNavigate}
        />
      ))}
    </nav>
  );
}

function NavItem({
  link,
  pathname,
  search,
  expandido,
  onToggle,
  onNavigate,
  nivel = 0,
}: {
  link: NavLink;
  pathname: string;
  search: URLSearchParams;
  expandido: Set<string>;
  onToggle: (label: string) => void;
  onNavigate?: () => void;
  nivel?: number;
}) {
  const Icon = link.icon;
  const indent = nivel > 0 ? "ml-3 pl-3 border-l border-cream/10" : "";

  if (link.disabled) {
    return (
      <span
        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium tracking-tight text-cream/35 ${indent}`}
      >
        <Icon className="h-4 w-4 shrink-0" aria-hidden />
        {link.label}
        <span className="ml-auto rounded-full bg-cream/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
          Próximamente
        </span>
      </span>
    );
  }

  if (link.children && link.children.length > 0) {
    const abierto = expandido.has(link.label);
    const activo = ramaActiva(link, pathname, search);
    return (
      <div>
        <button
          type="button"
          onClick={() => onToggle(link.label)}
          aria-expanded={abierto}
          className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium tracking-tight transition-colors ${indent} ${
            activo && !abierto
              ? "bg-brand-800/60 text-cream"
              : "text-cream/80 hover:bg-brand-800 hover:text-cream"
          }`}
        >
          <Icon className="h-4 w-4 shrink-0" aria-hidden />
          <span className="flex-1 text-left">{link.label}</span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 transition-transform ${abierto ? "rotate-180" : ""}`}
            aria-hidden
          />
        </button>
        {abierto ? (
          <div className="mt-1 space-y-1">
            {link.children.map((hijo) => (
              <NavItem
                key={hijo.label}
                link={hijo}
                pathname={pathname}
                search={search}
                expandido={expandido}
                onToggle={onToggle}
                onNavigate={onNavigate}
                nivel={nivel + 1}
              />
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  const href = link.href ?? "#";
  const activo = esLinkActivo(pathname, search, href);
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium tracking-tight transition-colors ${indent} ${
        activo
          ? "bg-brand-leaf text-brand-950"
          : link.primaria
            ? "bg-brand-gold/90 text-brand-950 hover:bg-brand-gold"
            : "text-cream/80 hover:bg-brand-800 hover:text-cream"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      {link.label}
    </Link>
  );
}
