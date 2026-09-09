"use client";

import { useActionState } from "react";
import Link from "next/link";
import { crearUsuario, actualizarUsuario } from "./actions";
import { Field, campoClase, FormErrorBanner } from "@/components/ui/FormField";
import { ESTADO_INICIAL } from "@/lib/validation";
import { rolLabels } from "@/lib/labels";
import type { RolUsuario } from "@prisma/client";

type UsuarioExistente = {
  id: string;
  nombre: string;
  email: string;
  rol: RolUsuario;
  activo: boolean;
};

export default function UsuarioForm({
  usuario,
  esUnoMismo = false,
}: {
  usuario?: UsuarioExistente;
  /** El admin autenticado está editando su propia cuenta — ver actions.ts. */
  esUnoMismo?: boolean;
}) {
  const accion = usuario ? actualizarUsuario : crearUsuario;
  const [state, formAction, pending] = useActionState(accion, ESTADO_INICIAL);
  const errores = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-5">
      {usuario ? <input type="hidden" name="usuarioId" value={usuario.id} /> : null}

      <FormErrorBanner message={state.error} />

      <Field label="Nombre" required error={errores.nombre}>
        <input
          type="text"
          name="nombre"
          required
          defaultValue={usuario?.nombre}
          className={campoClase(errores.nombre)}
        />
      </Field>

      <Field label="Correo electrónico" required error={errores.email}>
        <input
          type="email"
          name="email"
          required
          autoComplete="off"
          defaultValue={usuario?.email}
          className={campoClase(errores.email)}
        />
      </Field>

      <Field
        label="Contraseña"
        required={!usuario}
        error={errores.password}
      >
        <input
          type="password"
          name="password"
          required={!usuario}
          autoComplete="new-password"
          placeholder={usuario ? "Dejar en blanco para no cambiarla" : "Mínimo 4 caracteres"}
          className={campoClase(errores.password)}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Rol" required error={errores.rol}>
          <select
            name="rol"
            required
            defaultValue={usuario?.rol ?? "INSPECTOR"}
            disabled={esUnoMismo}
            className={campoClase(errores.rol)}
          >
            {Object.entries(rolLabels).map(([valor, etiqueta]) => (
              <option key={valor} value={valor}>
                {etiqueta}
              </option>
            ))}
          </select>
          {esUnoMismo ? (
            <input type="hidden" name="rol" value={usuario?.rol} />
          ) : null}
        </Field>

        <label className="flex items-end gap-2 pb-2.5">
          <input
            type="checkbox"
            name="activo"
            defaultChecked={usuario?.activo ?? true}
            disabled={esUnoMismo}
            className="h-4 w-4 rounded border-border accent-brand-700"
          />
          <span className="text-sm text-fg">
            Cuenta activa (puede iniciar sesión)
          </span>
          {esUnoMismo ? <input type="hidden" name="activo" value="on" /> : null}
        </label>
      </div>

      {esUnoMismo ? (
        <p className="text-xs text-fg-muted">
          No puedes desactivar tu propia cuenta ni quitarte el rol de
          administrador.
        </p>
      ) : null}

      <div className="flex justify-end gap-3 border-t border-border pt-4">
        <Link
          href="/usuarios"
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-fg hover:bg-surface"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand-700 px-5 py-2.5 text-sm font-semibold text-cream hover:bg-brand-800 disabled:opacity-60"
        >
          {pending ? "Guardando…" : usuario ? "Guardar cambios" : "Crear usuario"}
        </button>
      </div>
    </form>
  );
}
