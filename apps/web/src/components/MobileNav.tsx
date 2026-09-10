"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { MobileDrawer } from "./nav/MobileDrawer";

export default function MobileNav({ esAdmin = false }: { esAdmin?: boolean }) {
  const pathname = usePathname();

  // Ver comentario equivalente en Sidebar.tsx.
  if (pathname === "/login") return null;

  return (
    <div className="flex items-center gap-2 border-b border-brand-800/10 bg-brand-950 px-4 py-3 text-cream md:hidden print:hidden">
      <MobileDrawer esAdmin={esAdmin} />
      <Link href="/dashboard" className="flex items-center gap-2">
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
      </Link>
    </div>
  );
}
