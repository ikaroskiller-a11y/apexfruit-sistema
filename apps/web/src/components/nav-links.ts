export type NavLink = {
  href: string;
  label: string;
  // "Nueva inspección" es la acción que se usa constantemente parado en la
  // línea de packing — se marca para que Sidebar/MobileNav le den un
  // tratamiento visual distinto (ícono "+") y así no compita en igualdad
  // con enlaces de solo consulta (Dashboard, Lotes, Clientes).
  primaria?: boolean;
};

export const navLinks: NavLink[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/inspecciones", label: "Inspecciones" },
  { href: "/inspecciones/nueva", label: "Nueva inspección", primaria: true },
  { href: "/lotes", label: "Lotes" },
  { href: "/clientes", label: "Clientes" },
];
