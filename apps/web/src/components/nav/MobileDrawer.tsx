"use client";

import { useEffect, useState, Suspense } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { filtrarLinksVisibles, navLinks } from "../nav-links";
import { NavTree } from "./NavTree";

export function MobileDrawer({ esAdmin = false }: { esAdmin?: boolean }) {
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);

  // Autocierre de red de seguridad: si por algún motivo se navegó sin pasar
  // por el onClick de un link (ej. back/forward del navegador), el drawer no
  // debe quedar abierto tapando la pantalla.
  useEffect(() => {
    setAbierto(false);
  }, [pathname]);

  const links = filtrarLinksVisibles(navLinks, esAdmin);

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        aria-label="Abrir menú"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-cream/80 hover:bg-brand-800 hover:text-cream"
      >
        <Menu className="h-5 w-5" aria-hidden />
      </button>

      {abierto ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setAbierto(false)}
            className="absolute inset-0 bg-black/50"
          />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col overflow-y-auto border-r border-brand-800/10 bg-brand-950 text-cream shadow-xl">
            <div className="flex items-center justify-between px-4 py-4">
              <span className="text-sm font-semibold tracking-tight">Menú</span>
              <button
                type="button"
                onClick={() => setAbierto(false)}
                aria-label="Cerrar menú"
                className="flex h-8 w-8 items-center justify-center rounded-full text-cream/70 hover:bg-brand-800 hover:text-cream"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <Suspense fallback={null}>
              <NavTree links={links} variant="mobile" onNavigate={() => setAbierto(false)} />
            </Suspense>
          </div>
        </div>
      ) : null}
    </>
  );
}
