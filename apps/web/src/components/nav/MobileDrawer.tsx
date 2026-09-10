"use client";

import { useState, Suspense } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { filtrarLinksVisibles, navLinks } from "../nav-links";
import { NavTree } from "./NavTree";

/**
 * `key={pathname}` en el wrapper de abajo fuerza a remontar este componente
 * en cada navegación, lo que resetea `abierto` a `false` solo — autocierre
 * de red de seguridad sin useEffect/ref (evitados a propósito: las reglas
 * de hooks de este repo rechazan tanto un setState síncrono dentro de un
 * efecto como leer/escribir un ref durante el render).
 */
function MobileDrawerInner({ esAdmin }: { esAdmin: boolean }) {
  const [abierto, setAbierto] = useState(false);
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

export function MobileDrawer({ esAdmin = false }: { esAdmin?: boolean }) {
  const pathname = usePathname();
  return <MobileDrawerInner key={pathname} esAdmin={esAdmin} />;
}
