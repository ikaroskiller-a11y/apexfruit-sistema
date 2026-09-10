import type { LucideIcon } from "lucide-react";
import {
  Apple,
  BarChart3,
  BookOpen,
  Boxes,
  Building2,
  Cherry,
  CircleDot,
  ClipboardList,
  Database,
  Home,
  Leaf,
  Plus,
  Send,
  SlidersHorizontal,
  Sprout,
  Tractor,
  Users,
} from "lucide-react";

export type NavLink = {
  // Ítems contenedores (con children) pueden no tener página propia.
  href?: string;
  label: string;
  icon: LucideIcon;
  // "Nueva inspección" es la acción que se usa constantemente parado en la
  // línea de packing — se marca para que NavTree le dé un tratamiento visual
  // distinto (ícono "+") y así no compita en igualdad con enlaces de solo
  // consulta.
  primaria?: boolean;
  // "Usuarios" es admin-only incluso para ver el listado (ver
  // src/app/usuarios/page.tsx) — NavTree lo oculta a un INSPECTOR en vez de
  // mostrar un link que solo lleva a un redirect.
  soloAdmin?: boolean;
  // Visible pero no navegable ("Próximamente") — para ítems del menú de
  // referencia que todavía no tienen página real detrás.
  disabled?: boolean;
  children?: NavLink[];
};

export const navLinks: NavLink[] = [
  { href: "/dashboard", label: "Estadísticas", icon: BarChart3 },
  {
    label: "Inspecciones",
    icon: ClipboardList,
    children: [
      { href: "/inspecciones", label: "Todas", icon: ClipboardList },
      { href: "/inspecciones/nueva", label: "Nueva inspección", icon: Plus, primaria: true },
    ],
  },
  { href: "/lotes", label: "Lotes", icon: Boxes },
  { href: "/productores", label: "Productores", icon: Tractor },
  { href: "/clientes", label: "Exportadoras", icon: Building2 },
  { href: "/usuarios", label: "Usuarios", icon: Users, soloAdmin: true },
  { label: "Database", icon: Database, disabled: true },
];

/**
 * Filtra el árbol de navegación por permiso (recursivo, soporta hijos
 * soloAdmin aunque hoy ninguno lo sea) — único lugar donde vive esta regla,
 * antes duplicada entre Sidebar.tsx y MobileNav.tsx.
 */
export function filtrarLinksVisibles(links: NavLink[], esAdmin: boolean): NavLink[] {
  return links
    .filter((link) => !link.soloAdmin || esAdmin)
    .map((link) =>
      link.children
        ? { ...link, children: filtrarLinksVisibles(link.children, esAdmin) }
        : link
    );
}

/**
 * Un link "activo" compara pathname y, si el href trae query string (ej.
 * `/inspecciones?especie=KIWI`), también exige que cada par clave/valor del
 * href esté presente en el search actual — así un hijo con filtro no queda
 * marcado activo solo por compartir el pathname con otro hijo.
 */
export function esLinkActivo(pathname: string, search: URLSearchParams, href: string): boolean {
  const [path, query] = href.split("?");
  const pathCoincide =
    path === "/dashboard" ? pathname === "/dashboard" : pathname === path || pathname.startsWith(`${path}/`);
  if (!pathCoincide) return false;
  if (!query) return true;

  const params = new URLSearchParams(query);
  for (const [k, v] of params) {
    if (search.get(k) !== v) return false;
  }
  return true;
}

/** true si el link mismo o alguno de sus hijos (recursivo) está activo. */
export function ramaActiva(link: NavLink, pathname: string, search: URLSearchParams): boolean {
  if (link.href && esLinkActivo(pathname, search, link.href)) return true;
  return link.children?.some((c) => ramaActiva(c, pathname, search)) ?? false;
}
