import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";

// Clases compartidas de formulario (guía de diseño §4, "Formularios"):
// label 12px mayúscula, foco con anillo verde + borde verde-700 sólido.
export const inputClass =
  "w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-fg placeholder:text-fg-muted focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-focus-ring/40";

// Variante con borde de error (guía de diseño §4: "Error de campo: borde
// #b3261e, texto de ayuda debajo en el mismo color con ícono").
export const inputErrorClass =
  "w-full rounded-lg border border-state-danger bg-card px-3 py-2 text-sm text-fg placeholder:text-fg-muted focus:border-state-danger focus:outline-none focus:ring-2 focus:ring-state-danger/30";

/** Elige `inputClass` o `inputErrorClass` según si el campo tiene error. */
export function campoClase(error?: string | string[]): string {
  return error && error.length > 0 ? inputErrorClass : inputClass;
}

export const labelClass =
  "mb-1 block text-xs font-semibold uppercase tracking-[0.04em] text-fg-muted";

export function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string | string[];
  children: ReactNode;
}) {
  const mensajes = Array.isArray(error) ? error : error ? [error] : [];
  return (
    <label className="block">
      <span className={labelClass}>
        {label}
        {required ? <span className="text-state-danger"> *</span> : null}
      </span>
      {children}
      {mensajes.map((m, i) => (
        <span
          key={i}
          className="mt-1 flex items-start gap-1 text-xs text-state-danger"
        >
          <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
          {m}
        </span>
      ))}
    </label>
  );
}

/**
 * Banner de error general de un formulario (ej: `state.error` de
 * `useActionState`) — para el mensaje que no corresponde a un campo
 * específico. Nunca falla en silencio: siempre visible, en español, con
 * ícono (guía de diseño §4).
 */
export function FormErrorBanner({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-lg border border-state-danger/30 bg-state-danger-bg px-3 py-2.5 text-sm text-state-danger"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <span>{message}</span>
    </div>
  );
}
