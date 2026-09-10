import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import TopBar from "@/components/TopBar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";
import { BotonEliminar } from "@/components/ui/BotonEliminar";
import { prisma } from "@/lib/prisma";
import { esAdmin, getCurrentUser } from "@/lib/auth";
import {
  calidadMuestraLabels,
  calidadMuestraStatusMap,
  condicionMuestraLabels,
  condicionMuestraStatusMap,
} from "@/lib/labels";
import MuestraCalidadDonutChart from "@/components/charts/MuestraCalidadDonutChart";
import { eliminarMuestra } from "./actions";
import type { CalidadMuestra } from "@prisma/client";

export default async function MuestrasPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ embalaje?: string }>;
}) {
  const { id } = await params;
  const { embalaje: embalajeActivo } = await searchParams;

  const [inspeccion, usuarioActual] = await Promise.all([
    prisma.inspeccion.findUnique({
      where: { id },
      include: {
        lote: true,
        muestras: {
          include: { fotos: true },
          orderBy: { numero: "asc" },
        },
      },
    }),
    getCurrentUser(),
  ]);

  if (!inspeccion) notFound();
  const puedeGestionar =
    !!usuarioActual && (esAdmin(usuarioActual) || usuarioActual.id === inspeccion.inspectorId);

  const todasLasMuestras = inspeccion.muestras;
  const embalajes = Array.from(new Set(todasLasMuestras.map((m) => m.embalaje))).sort();
  const muestras = embalajeActivo
    ? todasLasMuestras.filter((m) => m.embalaje === embalajeActivo)
    : todasLasMuestras;

  const conteosCalidad: Record<CalidadMuestra, number> = { A: 0, B: 0, C: 0 };
  const conteosCondicion: Record<1 | 2 | 3, number> = { 1: 0, 2: 0, 3: 0 };
  for (const m of muestras) {
    conteosCalidad[m.calidad]++;
    conteosCondicion[m.condicion as 1 | 2 | 3]++;
  }
  const calidadDominante =
    muestras.length === 0
      ? null
      : (Object.entries(conteosCalidad).sort((a, b) => b[1] - a[1])[0][0] as CalidadMuestra);
  const condicionDominante =
    muestras.length === 0
      ? null
      : (Number(
          Object.entries(conteosCondicion).sort((a, b) => b[1] - a[1])[0][0]
        ) as 1 | 2 | 3);

  const todasLasFotos = muestras.flatMap((m) => m.fotos);

  return (
    <>
      <TopBar
        title={`Muestras · ${inspeccion.lote.codigo}`}
        actions={
          <Link
            href={`/inspecciones/${id}/muestras/nueva`}
            className="rounded-lg bg-brand-700 px-3 py-1.5 text-sm font-medium text-cream shadow-sm transition-colors hover:bg-brand-800"
          >
            + Crear muestra
          </Link>
        }
      />
      <main className="flex-1 space-y-6 px-4 py-6 md:px-8">
        <Link
          href={`/inspecciones/${id}`}
          className="text-sm text-brand-700 hover:underline dark:text-brand-500"
        >
          ← Volver a la inspección
        </Link>

        <div
          role="note"
          className="rounded-lg border border-state-warning/30 bg-state-warning-bg px-3 py-2.5 text-sm text-state-warning"
        >
          Cálculo de calidad y condición provisional — umbrales aún sin validar con el dueño (ver
          src/lib/normas.ts#clasificarMuestra).
        </div>

        {embalajes.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/inspecciones/${id}/muestras`}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                !embalajeActivo
                  ? "border-brand-700 bg-brand-700 text-cream"
                  : "border-border text-fg hover:bg-surface"
              }`}
            >
              Todas ({todasLasMuestras.length})
            </Link>
            {embalajes.map((e) => (
              <Link
                key={e}
                href={`/inspecciones/${id}/muestras?embalaje=${encodeURIComponent(e)}`}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium font-mono ${
                  embalajeActivo === e
                    ? "border-brand-700 bg-brand-700 text-cream"
                    : "border-border text-fg hover:bg-surface"
                }`}
              >
                {e} ({todasLasMuestras.filter((m) => m.embalaje === e).length})
              </Link>
            ))}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <StatCard
            label="Calidad dominante"
            value={calidadDominante ? calidadMuestraLabels[calidadDominante] : "—"}
            hint={muestras.length > 0 ? `${muestras.length} muestra${muestras.length === 1 ? "" : "s"}` : undefined}
          />
          <StatCard
            label="Condición dominante"
            value={condicionDominante ? condicionMuestraLabels[condicionDominante] : "—"}
          />
          <Card>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.04em] text-fg-muted">
              Distribución de calidad
            </p>
            <MuestraCalidadDonutChart conteos={conteosCalidad} />
          </Card>
        </div>

        {/* Desktop / tablet */}
        <Card className="hidden md:block !p-0">
          <div className="max-h-[70vh] overflow-auto rounded-xl">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="sticky top-0 z-10 bg-card-header text-xs uppercase tracking-wide text-fg-muted">
                <tr>
                  <th className="px-4 py-2.5">Folio</th>
                  <th className="px-4 py-2.5">Embalaje</th>
                  <th className="px-4 py-2.5">Calibre</th>
                  <th className="px-4 py-2.5 text-right">N° Frutos</th>
                  <th className="px-4 py-2.5">Calidad</th>
                  <th className="px-4 py-2.5">Condición</th>
                  <th className="px-4 py-2.5">Causa</th>
                  <th className="px-4 py-2.5">Fotos</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {muestras.map((m) => {
                  const peorCaso = m.calidad === "C" || m.condicion === 3;
                  return (
                    <tr
                      key={m.id}
                      className={`odd:bg-card even:bg-card-alt hover:bg-surface ${
                        peorCaso ? "border-l-[3px] border-l-state-danger bg-state-danger-bg/40" : ""
                      }`}
                    >
                      <td className="whitespace-nowrap px-4 py-2.5 font-mono font-medium text-fg">
                        {inspeccion.lote.codigo}-M{String(m.numero).padStart(2, "0")}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 font-mono">{m.embalaje}</td>
                      <td className="whitespace-nowrap px-4 py-2.5 font-mono">{m.calibre ?? "—"}</td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-right font-mono tabular-nums">
                        {m.nFrutos ?? "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5">
                        <Badge status={calidadMuestraStatusMap[m.calidad]}>
                          {calidadMuestraLabels[m.calidad]}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5">
                        <Badge status={condicionMuestraStatusMap[m.condicion as 1 | 2 | 3]}>
                          {condicionMuestraLabels[m.condicion as 1 | 2 | 3]}
                        </Badge>
                      </td>
                      <td className="max-w-xs px-4 py-2.5 text-xs text-fg-muted">
                        {[m.causaCalidad, m.causaCondicion].filter(Boolean).join(" ") || "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5">
                        {m.fotos.length > 0 ? (
                          <div className="flex -space-x-2">
                            {m.fotos.slice(0, 3).map((f) => (
                              <div
                                key={f.id}
                                className="relative h-8 w-8 overflow-hidden rounded-full border-2 border-card"
                              >
                                <Image src={f.url} alt="" fill sizes="32px" className="object-cover" />
                              </div>
                            ))}
                            {m.fotos.length > 3 ? (
                              <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-card-alt text-[10px] font-medium text-fg-muted">
                                +{m.fotos.length - 3}
                              </span>
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-fg-muted">—</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-right">
                        {puedeGestionar ? (
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/inspecciones/${id}/muestras/${m.id}/editar`}
                              className="text-brand-700 hover:underline dark:text-brand-500"
                            >
                              Editar
                            </Link>
                            <BotonEliminar
                              action={eliminarMuestra}
                              hiddenFields={{ muestraId: m.id, inspeccionId: id }}
                              confirmMessage={`¿Eliminar la muestra ${inspeccion.lote.codigo}-M${String(m.numero).padStart(2, "0")}?`}
                              label="Eliminar"
                            />
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
                {muestras.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-fg-muted">
                      Todavía no hay muestras registradas.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Mobile */}
        <div className="space-y-3 md:hidden">
          {muestras.map((m) => {
            const peorCaso = m.calidad === "C" || m.condicion === 3;
            return (
              <Card
                key={m.id}
                className={`!p-4 ${peorCaso ? "border-l-[3px] border-l-state-danger bg-state-danger-bg/40" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-mono text-sm font-semibold text-fg">
                    {inspeccion.lote.codigo}-M{String(m.numero).padStart(2, "0")}
                  </p>
                  <div className="flex gap-1.5">
                    <Badge status={calidadMuestraStatusMap[m.calidad]}>{m.calidad}</Badge>
                    <Badge status={condicionMuestraStatusMap[m.condicion as 1 | 2 | 3]}>
                      {m.condicion}
                    </Badge>
                  </div>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-y-1 text-sm">
                  <dt className="text-fg-muted">Embalaje</dt>
                  <dd className="text-right font-mono text-fg">{m.embalaje}</dd>
                  <dt className="text-fg-muted">Calibre</dt>
                  <dd className="text-right font-mono text-fg">{m.calibre ?? "—"}</dd>
                  <dt className="text-fg-muted">N° Frutos</dt>
                  <dd className="text-right font-mono tabular-nums text-fg">{m.nFrutos ?? "—"}</dd>
                </dl>
                {puedeGestionar ? (
                  <div className="mt-3 flex items-center gap-3 border-t border-border pt-3">
                    <Link
                      href={`/inspecciones/${id}/muestras/${m.id}/editar`}
                      className="text-sm text-brand-700 hover:underline dark:text-brand-500"
                    >
                      Editar
                    </Link>
                    <BotonEliminar
                      action={eliminarMuestra}
                      hiddenFields={{ muestraId: m.id, inspeccionId: id }}
                      confirmMessage={`¿Eliminar la muestra ${inspeccion.lote.codigo}-M${String(m.numero).padStart(2, "0")}?`}
                      label="Eliminar"
                    />
                  </div>
                ) : null}
              </Card>
            );
          })}
          {muestras.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-fg-muted">
              Todavía no hay muestras registradas.
            </p>
          ) : null}
        </div>

        {todasLasFotos.length > 0 ? (
          <Card>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.04em] text-fg-muted">
              Imágenes en reporte
            </p>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
              {todasLasFotos.map((foto) => (
                <div
                  key={foto.id}
                  className="relative aspect-square overflow-hidden rounded-lg border border-border bg-card-alt"
                >
                  <Image
                    src={foto.url}
                    alt={foto.descripcion ?? "Foto de muestra"}
                    fill
                    sizes="200px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </Card>
        ) : null}
      </main>
    </>
  );
}
