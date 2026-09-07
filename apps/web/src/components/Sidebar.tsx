"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { navLinks } from "./nav-links";

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Sidebar() {
  const pathname = usePathname();

  // La página de login tiene su propio layout de pantalla completa (ver
  // src/app/login/page.tsx) — el layout raíz no distingue rutas públicas de
  // protegidas, así que el sidebar se oculta a sí mismo acá.
  if (pathname === "/login") return null;

  return (
    <aside className="hidden md:flex md:w-60 md:shrink-0 md:flex-col md:border-r md:border-brand-800/10 md:bg-brand-950 md:text-cream print:hidden">
      <div className="px-5 py-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream p-1">
            <Image
              src="/logo-apexfruit-icon.png"
              alt="Apex Fruit"
              width={32}
              height={32}
              className="h-full w-full object-contain"
            />
          </span>
          <span className="text-lg font-semibold tracking-tight text-cream">
            Apex Fruit
          </span>
        </Link>
        <p className="mt-1 text-xs text-cream/60">
          Control de calidad de fruta
        </p>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navLinks.map((link) => {
          const active = isActive(pathname, link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-lg px-3 py-2 text-sm font-medium tracking-tight transition-colors ${
                active
                  ? "bg-brand-leaf text-brand-950"
                  : "text-cream/80 hover:bg-brand-800 hover:text-cream"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-cream/10 px-5 py-4 text-xs text-cream/50">
        Apex Fruit SPA · Curicó / Teno
        <br />
        Región del Maule, Chile
      </div>
    </aside>
  );
}
