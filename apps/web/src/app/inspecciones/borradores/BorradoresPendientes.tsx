"use client";

import { useEffect, useState, useTransition } from "react";
import { RefreshCw, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import {
  listarBorradores,
  eliminarBorrador,
  formDataDesdeBorrador,
  type BorradorInspeccion,
} from "@/lib/borradores";
import { ESTADO_INICIAL } from "@/lib/validation";
import { crearInspeccion } from "../nueva/actions";
import { actualizarInspeccion } from "../[id]/actions";

// Mismo criterio que InspeccionForm.tsx: un redirect() de Next dentro de una
// Server Action se implementa como una excepción con `digest` que empieza
// en "NEXT_REDIRECT" — hay que dejarla pasar para que la navegación al
// guardar con éxito siga funcionando.
function esErrorDeRedireccion(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

function formatearFecha(timestamp: number): string {
  return new Date(timestamp).toLocaleString("es-CL", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function BorradoresPendientes() {
  const [borradores, setBorradores] = useState<BorradorInspeccion[] | null>(null);
  const [erroresPorId, setErroresPorId] = useState<Record<string, string>>({});
  const [idEnCurso, setIdEnCurso] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    listarBorradores().then(setBorradores);
  }, []);

  function reintentar(borrador: BorradorInspeccion) {
    setIdEnCurso(borrador.id);
    setErroresPorId((prev) => {
      const next = { ...prev };
      delete next[borrador.id];
      return next;
    });

    startTransition(async () => {
      const formData = formDataDesdeBorrador(borrador);
      const action = borrador.actionKind === "editar" ? actualizarInspeccion : crearInspeccion;
      try {
        const resultado = await action(ESTADO_INICIAL, formData);
        // El camino feliz redirige (lanza) antes de llegar acá. Si vuelve un
        // FormState normal es porque algo falló en la validación del lado
        // servidor (ej. el lote fue eliminado mientras tanto) — se muestra
        // el error y el borrador se mantiene para no perder los datos.
        if (resultado?.error) {
          setErroresPorId((prev) => ({ ...prev, [borrador.id]: resultado.error! }));
        } else {
          await eliminarBorrador(borrador.id);
          setBorradores((prev) => prev?.filter((b) => b.id !== borrador.id) ?? null);
        }
      } catch (error) {
        if (esErrorDeRedireccion(error)) {
          await eliminarBorrador(borrador.id);
          throw error;
        }
        setErroresPorId((prev) => ({
          ...prev,
          [borrador.id]:
            "Todavía no se pudo enviar (¿sigue sin conexión?). El borrador se mantiene guardado.",
        }));
      } finally {
        setIdEnCurso(null);
      }
    });
  }

  async function eliminar(id: string) {
    await eliminarBorrador(id);
    setBorradores((prev) => prev?.filter((b) => b.id !== id) ?? null);
  }

  if (borradores === null) {
    return <p className="text-sm text-fg-muted">Cargando borradores…</p>;
  }

  if (borradores.length === 0) {
    return (
      <Card>
        <p className="text-sm text-fg-muted">
          No hay borradores pendientes. Las inspecciones que no se puedan
          enviar por falta de conexión van a aparecer acá.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {borradores.map((borrador) => {
        // Un <input type="file"> sin nada seleccionado igual aparece en el
        // FormData del navegador como un File vacío (name="", size=0) — se
        // descarta acá igual que en las server actions (ver guardarFotos en
        // src/app/inspecciones/nueva/actions.ts).
        const cantidadFotos = borrador.entries.filter(
          ([clave, valor]) => clave === "fotos" && valor instanceof File && valor.size > 0
        ).length;
        const enCurso = idEnCurso === borrador.id;

        return (
          <Card key={borrador.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-fg">{borrador.resumen}</p>
                <p className="mt-0.5 text-xs text-fg-muted">
                  Guardado el {formatearFecha(borrador.creadoEn)}
                  {cantidadFotos > 0
                    ? ` · ${cantidadFotos} foto${cantidadFotos === 1 ? "" : "s"}`
                    : ""}
                  {" · "}
                  {borrador.actionKind === "editar" ? "Edición" : "Inspección nueva"}
                </p>
                {erroresPorId[borrador.id] ? (
                  <p className="mt-2 text-sm text-state-danger">{erroresPorId[borrador.id]}</p>
                ) : null}
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => reintentar(borrador)}
                  disabled={enCurso}
                  className="flex items-center gap-1.5 rounded-lg bg-brand-700 px-3 py-2 text-sm font-medium text-cream hover:bg-brand-800 disabled:opacity-60"
                >
                  <RefreshCw className={`h-4 w-4 ${enCurso ? "animate-spin" : ""}`} aria-hidden />
                  {enCurso ? "Enviando…" : "Reintentar envío"}
                </button>
                <button
                  type="button"
                  onClick={() => eliminar(borrador.id)}
                  disabled={enCurso}
                  title="Descartar este borrador"
                  aria-label="Descartar este borrador"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-fg-muted hover:bg-state-danger-bg hover:text-state-danger disabled:opacity-60"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
