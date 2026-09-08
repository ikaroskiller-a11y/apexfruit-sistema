import Link from "next/link";
import { SearchX } from "lucide-react";
import { Card } from "@/components/ui/Card";

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <Card className="max-w-md text-center">
        <SearchX className="mx-auto mb-4 h-10 w-10 text-fg-muted" aria-hidden />
        <h1 className="mb-2 text-lg font-semibold text-fg">No se encontró la página</h1>
        <p className="mb-6 text-sm text-fg-muted">
          El recurso que buscas no existe o fue eliminado.
        </p>
        <Link
          href="/dashboard"
          className="inline-block rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-cream hover:bg-brand-800"
        >
          Ir al inicio
        </Link>
      </Card>
    </main>
  );
}
