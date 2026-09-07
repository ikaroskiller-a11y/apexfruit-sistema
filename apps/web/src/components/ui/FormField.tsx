import type { ReactNode } from "react";

// Clases compartidas de formulario (guía de diseño §4, "Formularios"):
// label 12px mayúscula, foco con anillo verde + borde verde-700 sólido.
export const inputClass =
  "w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-fg placeholder:text-fg-muted focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-focus-ring/40";

export const labelClass =
  "mb-1 block text-xs font-semibold uppercase tracking-[0.04em] text-fg-muted";

export function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className={labelClass}>
        {label}
        {required ? <span className="text-state-danger"> *</span> : null}
      </span>
      {children}
    </label>
  );
}
