"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { esAdmin, getCurrentUser, type SesionUsuario } from "@/lib/auth";
import { clasificarMuestra } from "@/lib/normas";
import { muestraSchema, parsearDefectos, type FormState } from "@/lib/validation";
import { borrarFoto, esImagenPermitida, guardarFoto } from "@/lib/fotos";

function datosDesdeFormulario(formData: FormData) {
  return {
    embalaje: formData.get("embalaje"),
    etiqueta: formData.get("etiqueta"),
    calibre: formData.get("calibre"),
    nFrutos: formData.get("nFrutos"),
    pesoKg: formData.get("pesoKg"),
    nSalida: formData.get("nSalida"),
    embaladora: formData.get("embaladora"),
    sinPLU: formData.get("sinPLU"),
    conPLU: formData.get("conPLU"),
    sobreCalibrePct: formData.get("sobreCalibrePct"),
    bajoCalibrePct: formData.get("bajoCalibrePct"),
    notaApertura: formData.get("notaApertura"),
    notaEmbalaje: formData.get("notaEmbalaje"),
    hora: formData.get("hora"),
  };
}

/**
 * Mismo criterio que a nivel de Inspección (ver
 * apps/web/src/app/inspecciones/[id]/actions.ts#puedeGestionar): un
 * INSPECTOR solo gestiona muestras de sus propias inspecciones, un
 * ADMINISTRADOR gestiona cualquiera. No hay ownership por muestra —
 * se reusa el permiso de la inspección completa a propósito, para no
 * modelar "quién creó cada muestra" bajo presión de tiempo.
 */
function puedeGestionar(usuario: SesionUsuario, inspectorId: string): boolean {
  return esAdmin(usuario) || usuario.id === inspectorId;
}

async function guardarFotosMuestra(
  inspeccionId: string,
  muestraId: string,
  formData: FormData
): Promise<void> {
  const fotos = formData
    .getAll("fotos")
    .filter((f): f is File => f instanceof File && f.size > 0 && esImagenPermitida(f));
  if (fotos.length === 0) return;

  for (const foto of fotos) {
    const url = await guardarFoto(`inspecciones/${inspeccionId}/muestras/${muestraId}`, foto);
    // inspeccionId se guarda además de muestraId a propósito: así la foto
    // aparece también en el grid de fotos de la Inspección y del reporte
    // (que solo filtran por inspeccionId) sin tener que tocar esas vistas.
    await prisma.foto.create({
      data: { inspeccionId, muestraId, url, descripcion: foto.name },
    });
  }
}

export async function crearMuestra(_prevState: FormState, formData: FormData): Promise<FormState> {
  const usuarioActual = await getCurrentUser();
  if (!usuarioActual) redirect("/login?next=/inspecciones");

  const inspeccionId = formData.get("inspeccionId");
  if (typeof inspeccionId !== "string" || !inspeccionId) {
    return { error: "Falta el identificador de la inspección." };
  }

  const inspeccion = await prisma.inspeccion.findUnique({
    where: { id: inspeccionId },
    select: { inspectorId: true },
  });
  if (!inspeccion) {
    return { error: "La inspección ya no existe." };
  }
  if (!puedeGestionar(usuarioActual, inspeccion.inspectorId)) {
    return { error: "No tienes permiso para agregar muestras a esta inspección." };
  }

  const parsed = muestraSchema.safeParse(datosDesdeFormulario(formData));
  if (!parsed.success) {
    return {
      error: "Revisa los campos marcados: hay datos inválidos o incompletos.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const defectosResultado = parsearDefectos(formData, { prefix: "muestraDefecto", max: 6 });
  if ("error" in defectosResultado) return defectosResultado.error;
  const { defectos } = defectosResultado;

  const clasificacion = clasificarMuestra(
    defectos.map((d) => ({ tipo: d.tipo, porcentaje: d.porcentaje }))
  );

  let muestraId: string;
  try {
    const creada = await prisma.$transaction(async (tx) => {
      // numero correlativo dentro de la inspección — calculado server-side,
      // el inspector nunca lo escribe (ver decisión en el plan de la feature).
      const ultima = await tx.muestra.findFirst({
        where: { inspeccionId },
        orderBy: { numero: "desc" },
        select: { numero: true },
      });
      const numero = (ultima?.numero ?? 0) + 1;

      const nueva = await tx.muestra.create({
        data: {
          inspeccionId,
          numero,
          embalaje: parsed.data.embalaje,
          etiqueta: parsed.data.etiqueta,
          calibre: parsed.data.calibre,
          nFrutos: parsed.data.nFrutos,
          pesoKg: parsed.data.pesoKg,
          nSalida: parsed.data.nSalida,
          embaladora: parsed.data.embaladora,
          sinPLU: parsed.data.sinPLU,
          conPLU: parsed.data.conPLU,
          sobreCalibrePct: parsed.data.sobreCalibrePct,
          bajoCalibrePct: parsed.data.bajoCalibrePct,
          notaApertura: parsed.data.notaApertura,
          notaEmbalaje: parsed.data.notaEmbalaje,
          hora: parsed.data.hora,
          calidad: clasificacion.calidad,
          condicion: clasificacion.condicion,
          causaCalidad: clasificacion.causaCalidad,
          causaCondicion: clasificacion.causaCondicion,
        },
      });

      if (defectos.length > 0) {
        await tx.defecto.createMany({
          data: defectos.map((d) => ({
            inspeccionId,
            muestraId: nueva.id,
            tipo: d.tipo,
            porcentaje: d.porcentaje,
            cantidad: d.cantidad,
            esCritico: d.tipo === "PUDRICION_HUMEDA",
          })),
        });
      }

      return nueva;
    });
    muestraId = creada.id;
  } catch {
    return { error: "No se pudo guardar la muestra. Intenta nuevamente." };
  }

  await guardarFotosMuestra(inspeccionId, muestraId, formData);

  redirect(`/inspecciones/${inspeccionId}/muestras`);
}

export async function actualizarMuestra(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const usuarioActual = await getCurrentUser();
  if (!usuarioActual) redirect("/login?next=/inspecciones");

  const muestraId = formData.get("muestraId");
  const inspeccionId = formData.get("inspeccionId");
  if (typeof muestraId !== "string" || !muestraId || typeof inspeccionId !== "string" || !inspeccionId) {
    return { error: "Falta el identificador de la muestra." };
  }

  const inspeccion = await prisma.inspeccion.findUnique({
    where: { id: inspeccionId },
    select: { inspectorId: true },
  });
  if (!inspeccion) {
    return { error: "La inspección ya no existe." };
  }
  if (!puedeGestionar(usuarioActual, inspeccion.inspectorId)) {
    return { error: "No tienes permiso para editar esta muestra." };
  }

  const parsed = muestraSchema.safeParse(datosDesdeFormulario(formData));
  if (!parsed.success) {
    return {
      error: "Revisa los campos marcados: hay datos inválidos o incompletos.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const defectosResultado = parsearDefectos(formData, { prefix: "muestraDefecto", max: 6 });
  if ("error" in defectosResultado) return defectosResultado.error;
  const { defectos } = defectosResultado;

  const clasificacion = clasificarMuestra(
    defectos.map((d) => ({ tipo: d.tipo, porcentaje: d.porcentaje }))
  );

  try {
    await prisma.$transaction([
      prisma.muestra.update({
        where: { id: muestraId },
        data: {
          embalaje: parsed.data.embalaje,
          etiqueta: parsed.data.etiqueta ?? null,
          calibre: parsed.data.calibre ?? null,
          nFrutos: parsed.data.nFrutos ?? null,
          pesoKg: parsed.data.pesoKg ?? null,
          nSalida: parsed.data.nSalida ?? null,
          embaladora: parsed.data.embaladora ?? null,
          sinPLU: parsed.data.sinPLU ?? null,
          conPLU: parsed.data.conPLU ?? null,
          sobreCalibrePct: parsed.data.sobreCalibrePct ?? null,
          bajoCalibrePct: parsed.data.bajoCalibrePct ?? null,
          notaApertura: parsed.data.notaApertura ?? null,
          notaEmbalaje: parsed.data.notaEmbalaje ?? null,
          hora: parsed.data.hora ?? null,
          calidad: clasificacion.calidad,
          condicion: clasificacion.condicion,
          causaCalidad: clasificacion.causaCalidad,
          causaCondicion: clasificacion.causaCondicion,
        },
      }),
      prisma.defecto.deleteMany({ where: { muestraId } }),
      ...(defectos.length > 0
        ? [
            prisma.defecto.createMany({
              data: defectos.map((d) => ({
                inspeccionId,
                muestraId,
                tipo: d.tipo,
                porcentaje: d.porcentaje,
                cantidad: d.cantidad,
                esCritico: d.tipo === "PUDRICION_HUMEDA",
              })),
            }),
          ]
        : []),
    ]);
  } catch {
    return { error: "No se pudo guardar la muestra. Intenta nuevamente." };
  }

  // Fotos a eliminar (checkboxes "eliminarFoto") + fotos nuevas.
  const fotosAEliminar = formData
    .getAll("eliminarFoto")
    .filter((v): v is string => typeof v === "string" && v.length > 0);
  if (fotosAEliminar.length > 0) {
    const fotos = await prisma.foto.findMany({
      where: { id: { in: fotosAEliminar }, muestraId },
    });
    await prisma.foto.deleteMany({ where: { id: { in: fotosAEliminar }, muestraId } });
    await Promise.all(fotos.map((f) => borrarFoto(f.url)));
  }
  await guardarFotosMuestra(inspeccionId, muestraId, formData);

  redirect(`/inspecciones/${inspeccionId}/muestras`);
}

export async function eliminarMuestra(_prevState: FormState, formData: FormData): Promise<FormState> {
  const usuarioActual = await getCurrentUser();
  if (!usuarioActual) redirect("/login?next=/inspecciones");

  const muestraId = formData.get("muestraId");
  const inspeccionId = formData.get("inspeccionId");
  if (typeof muestraId !== "string" || !muestraId || typeof inspeccionId !== "string" || !inspeccionId) {
    return { error: "Falta el identificador de la muestra." };
  }

  const inspeccion = await prisma.inspeccion.findUnique({
    where: { id: inspeccionId },
    select: { inspectorId: true },
  });
  if (!inspeccion) {
    return { error: "La inspección ya no existe." };
  }
  if (!puedeGestionar(usuarioActual, inspeccion.inspectorId)) {
    return { error: "No tienes permiso para eliminar esta muestra." };
  }

  const existente = await prisma.muestra.findUnique({
    where: { id: muestraId },
    select: { fotos: true },
  });
  if (!existente) {
    return { error: "La muestra que intentas eliminar ya no existe." };
  }

  try {
    // onDelete: Cascade en el schema borra los defectos y fotos propios de
    // la muestra — el folio eliminado no se reutiliza (numero sigue subiendo).
    await prisma.muestra.delete({ where: { id: muestraId } });
  } catch {
    return { error: "No se pudo eliminar la muestra. Intenta nuevamente." };
  }

  await Promise.all(existente.fotos.map((f) => borrarFoto(f.url)));

  redirect(`/inspecciones/${inspeccionId}/muestras`);
}
