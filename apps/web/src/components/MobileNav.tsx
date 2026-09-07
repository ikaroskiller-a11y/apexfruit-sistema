"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { navLinks } from "./nav-links";

export default function MobileNav() {
  const pathname = usePathname();

  // Ver comentario equivalente en Sidebar.tsx.
  if (pathname === "/login") return null;

  return (
    <div className="border-b border-brand-800/10 bg-brand-950 text-cream md:hidden print:hidden">
      <div className="flex items-center gap-2 px-4 py-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cream p-1">
          <Image
            src="/logo-apexfruit-icon.png"
            alt="Apex Fruit"
            width={28}
            height={28}
            className="h-full w-full object-contain"
          />
        </span>
        <span className="font-semibold">Apex Fruit</span>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-3">
        {navLinks.map((link) => {
          const active =
            pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
                active
                  ? "bg-brand-leaf text-brand-950"
                  : "bg-brand-800/60 text-cream/90"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
