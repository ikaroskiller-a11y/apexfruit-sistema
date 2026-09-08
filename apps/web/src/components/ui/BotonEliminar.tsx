"use client";

import { useActionState, useRef } from "react";
import { FormErrorBanner } from "./FormField";
import type { FormState } from "@/lib/validation";

/**
 * Botón de eliminar con confirmación nativa (`window.confirm`) + envío del
 * Server Action correspondiente. Si el action devuelve un error (ej: "no se
 * puede eliminar, tiene N inspecciones asociadas"), se muestra debajo del
 * botón — nunca falla en silencio.
 */
export function BotonEliminar({
  action,
  hiddenFields,
  confirmMessage,
  label = "Eliminar",
}: {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  hiddenFields: Record<string, string>;
  confirmMessage: string;
  label?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="inline-block">
      <form ref={formRef} action={formAction}>
        {Object.entries(hiddenFields).map(([k, v]) => (
          <input key={k} type="hidden" name={k} value={v} />
        ))}
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (window.confirm(confirmMessage)) {
              formRef.current?.requestSubmit();
            }
          }}
          className="inline-flex items-center rounded-lg border border-state-danger/40 px-3 py-1.5 text-sm font-medium text-state-danger hover:bg-state-danger-bg disabled:opacity-60"
        >
          {pending ? "Eliminando…" : label}
        </button>
      </form>
      {state.error ? (
        <div className="mt-2 max-w-sm">
          <FormErrorBanner message={state.error} />
        </div>
      ) : null}
    </div>
  );
}
