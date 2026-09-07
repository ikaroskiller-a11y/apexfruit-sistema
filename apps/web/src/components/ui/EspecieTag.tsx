import { especieColorVar } from "@/lib/colors";
import { especieLabels } from "@/lib/labels";
import type { EspecieFruta } from "@prisma/client";

/**
 * Identidad de variedad consistente entre pantallas (guía de diseño §1.3):
 * el mismo color siempre representa la misma especie, en el dashboard y en
 * el detalle de lote. El punto de color nunca va solo — siempre acompaña
 * texto, así que no depende de percepción de color para entenderse.
 */
export function EspecieTag({
  especie,
  variedad,
}: {
  especie: EspecieFruta;
  variedad?: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: especieColorVar[especie] }}
        aria-hidden
      />
      <span>
        {especieLabels[especie]}
        {variedad ? ` · ${variedad}` : ""}
      </span>
    </span>
  );
}
