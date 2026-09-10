"use client";

import { useActionState } from "react";
import Link from "next/link";
import { crearProductor, actualizarProductor } from "./actions";
import { Field, campoClase, FormErrorBanner } from "@/components/ui/FormField";
import { ESTADO_INICIAL } from "@/lib/validation";

type ProductorExistente = {
  id: string;
  nombre: string;
  rut: string | null;
  contacto: string | null;
  email: string | null;
  telefono: string | null;
  direccion: string | null;
  notas: string | null;
};

export default function ProductorForm({ productor }: { productor?: ProductorExistente }) {
  const accion = productor ? actualizarProductor : crearProductor;
  const [state, formAction, pending] = useActionState(accion, ESTADO_INICIAL);
  const errores = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-5">
      {productor ? <input type="hidden" name="productorId" value={productor.id} /> : null}

      <FormErrorBanner message={state.error} />

      <Field label="Nombre / Razón social" required error={errores.nombre}>
        <input
          type="text"
          name="nombre"
          required
          placeholder="Fundo, huerto o agrícola"
          defaultValue={productor?.nombre}
          className={campoClase(errores.nombre)}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="RUT" error={errores.rut}>
          <input
            type="text"
            name="rut"
            placeholder="76.123.456-7"
            defaultValue={productor?.rut ?? ""}
            className={`${campoClase(errores.rut)} font-mono`}
          />
        </Field>
        <Field label="Contacto" error={errores.contacto}>
          <input
            type="text"
            name="contacto"
            placeholder="Nombre de la persona de contacto"
            defaultValue={productor?.contacto ?? ""}
            className={campoClase(errores.contacto)}
          />
        </Field>
        <Field label="Correo electrónico" error={errores.email}>
          <input
            type="email"
            name="email"
            defaultValue={productor?.email ?? ""}
            className={campoClase(errores.email)}
          />
        </Field>
        <Field label="Teléfono" error={errores.telefono}>
          <input
            type="text"
            name="telefono"
            defaultValue={productor?.telefono ?? ""}
            className={`${campoClase(errores.telefono)} font-mono`}
          />
        </Field>
      </div>

      <Field label="Dirección" error={errores.direccion}>
        <input
          type="text"
          name="direccion"
          defaultValue={productor?.direccion ?? ""}
          className={campoClase(errores.direccion)}
        />
      </Field>

      <Field label="Notas" error={errores.notas}>
        <textarea
          name="notas"
          rows={3}
          defaultValue={productor?.notas ?? ""}
          className={campoClase(errores.notas)}
        />
      </Field>

      <div className="flex justify-end gap-3 border-t border-border pt-4">
        <Link
          href={productor ? `/productores/${productor.id}` : "/productores"}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-fg hover:bg-surface"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand-700 px-5 py-2.5 text-sm font-semibold text-cream hover:bg-brand-800 disabled:opacity-60"
        >
          {pending ? "Guardando…" : productor ? "Guardar cambios" : "Crear productor"}
        </button>
      </div>
    </form>
  );
}
