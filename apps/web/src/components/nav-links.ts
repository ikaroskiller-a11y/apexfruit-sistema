export type NavLink = {
  href: string;
  label: string;
};

export const navLinks: NavLink[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/inspecciones", label: "Inspecciones" },
  { href: "/inspecciones/nueva", label: "Nueva inspección" },
  { href: "/lotes", label: "Lotes" },
  { href: "/clientes", label: "Clientes" },
];
