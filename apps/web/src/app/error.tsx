"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/Card";

/**
 * Error boundary raíz (ver node_modules/next/dist/docs/01-app/01-getting-started/10-error-handling.md,
 * "Nested error boundaries"): captura cualquier excepción no manejada que
 * ocurra al renderizar una ruta y muestra un mensaje en español con opción
 * de reintentar, en vez de una pantalla en blanco o un stack trace crudo.
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <Card className="max-w-md text-center">
        <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-state-danger" aria-hidden />
        <h1 className="mb-2 text-lg font-semibold text-fg">Ocurrió un error inesperado</h1>
        <p className="mb-6 text-sm text-fg-muted">
          Algo falló al cargar esta página. Puedes intentar de nuevo; si el
          problema persiste, avisa al equipo técnico.
        </p>
        <div className="flex justify-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-fg hover:bg-surface"
          >
            Ir al inicio
          </Link>
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-cream hover:bg-brand-800"
          >
            Reintentar
          </button>
        </div>
      </Card>
    </main>
  );
}
