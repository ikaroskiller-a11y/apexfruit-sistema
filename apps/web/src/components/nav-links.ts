export type NavLink = {
  href: string;
  label: string;
  // "Nueva inspección" es la acción que se usa constantemente parado en la
  // línea de packing — se marca para que Sidebar/MobileNav le den un
  // tratamiento visual distinto (ícono "+") y así no compita en igualdad
  // con enlaces de solo consulta (Dashboard, Lotes, Clientes).
  primaria?: boolean;
  // "Usuarios" es admin-only incluso para ver el listado (ver
  // src/app/usuarios/page.tsx) — Sidebar/MobileNav lo ocultan a un INSPECTOR
  // en vez de mostrar un link que solo lleva a un redirect.
  soloAdmin?: boolean;
};

export const navLinks: NavLink[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/inspecciones", label: "Inspecciones" },
  { href: "/inspecciones/nueva", label: "Nueva inspección", primaria: true },
  { href: "/lotes", label: "Lotes" },
  { href: "/clientes", label: "Clientes" },
  { href: "/usuarios", label: "Usuarios", soloAdmin: true },
];
