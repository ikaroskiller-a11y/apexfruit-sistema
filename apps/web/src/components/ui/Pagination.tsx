import Link from "next/link";

/**
 * Paginación simple anterior/siguiente para listados que pueden crecer
 * (inspecciones, lotes). `buildHref` arma la URL de cada página conservando
 * los filtros activos (ver uso en /inspecciones y /lotes).
 */
export function Pagination({
  page,
  totalPages,
  totalItems,
  buildHref,
}: {
  page: number;
  totalPages: number;
  totalItems: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const anterior = Math.max(1, page - 1);
  const siguiente = Math.min(totalPages, page + 1);

  return (
    <nav
      className="flex flex-wrap items-center justify-between gap-3 px-1 py-1 text-sm text-fg-muted"
      aria-label="Paginación"
    >
      <span>
        Página {page} de {totalPages} · {totalItems} registro(s) en total
      </span>
      <div className="flex items-center gap-2">
        <Link
          href={buildHref(anterior)}
          aria-disabled={page <= 1}
          tabIndex={page <= 1 ? -1 : undefined}
          className={`rounded-lg border border-border px-3 py-1.5 font-medium ${
            page <= 1 ? "pointer-events-none opacity-40" : "text-fg hover:bg-surface"
          }`}
        >
          ← Anterior
        </Link>
        <Link
          href={buildHref(siguiente)}
          aria-disabled={page >= totalPages}
          tabIndex={page >= totalPages ? -1 : undefined}
          className={`rounded-lg border border-border px-3 py-1.5 font-medium ${
            page >= totalPages ? "pointer-events-none opacity-40" : "text-fg hover:bg-surface"
          }`}
        >
          Siguiente →
        </Link>
      </div>
    </nav>
  );
}
