"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EspecieFruta, ResultadoInspeccion } from "@prisma/client";
import { evaluarResultadoCereza, firmezaUnidadPorEspecie } from "@/lib/normas";
import { esAdmin, getCurrentUser, type SesionUsuario } from "@/lib/auth";
import { inspeccionSchema, parsearDefectos, type FormState } from "@/lib/validation";
import { borrarFoto, esImagenPermitida, guardarFoto } from "@/lib/fotos";

function datosDesdeFormulario(formData: FormData) {
  return {
    loteId: formData.get("loteId"),
    inspectorId: formData.get("inspectorId"),
    fecha: formData.get("fecha"),
    resultado: formData.get("resultado"),
    calibre: formData.get("calibre"),
    color: formData.get("color"),
    colorPorcentajeDark: formData.get("colorPorcentajeDark"),
    colorPorcentajeLight: formData.get("colorPorcentajeLight"),
    firmeza: formData.get("firmeza"),
    brixGrados: formData.get("brixGrados"),
    acidez: formData.get("acidez"),
    pesoMuestraKg: formData.get("pesoMuestraKg"),
    muestraCajas: formData.get("muestraCajas"),
    muestraUnidades: formData.get("muestraUnidades"),
    hidrocoolerTempAguaC: formData.get("hidrocoolerTempAguaC"),
    hidrocoolerCloroLibrePpm: formData.get("hidrocoolerCloroLibrePpm"),
    hidrocoolerTiempoExposicionMin: formData.get("hidrocoolerTiempoExposicionMin"),
    hidrocoolerTempPulpaPostC: formData.get("hidrocoolerTempPulpaPostC"),
    porcentajeRechazo: formData.get("porcentajeRechazo"),
    observaciones: formData.get("observaciones"),
  };
}

function booleanoOpcional(formData: FormData, campo: string): boolean | undefined {
  const valor = formData.get(campo);
  if (valor === "true") return true;
  if (valor === "false") return false;
  return undefined;
}

/**
 * Un INSPECTOR solo puede editar/eliminar sus propias inspecciones; un
 * ADMINISTRADOR puede hacerlo con cualquiera. No existe hoy un concepto de
 * inspección "cerrada" en el modelo de datos (ver prisma/schema.prisma) —
 * si se agrega en el futuro, este es el lugar donde bloquear la edición.
 */
function puedeGestionar(usuario: SesionUsuario, inspectorId: string): boolean {
  return esAdmin(usuario) || usuario.id === inspectorId;
}

async function guardarFotosNuevas(inspeccionId: string, formData: FormData): Promise<void> {
  const fotos = formData
    .getAll("fotos")
    .filter((f): f is File => f instanceof File && f.size > 0 && esImagenPermitida(f));
  if (fotos.length === 0) return;

  for (const foto of fotos) {
    const url = await guardarFoto(inspeccionId, foto);
    await prisma.foto.create({
      data: { inspeccionId, url, descripcion: foto.name },
    });
  }
}

export async function actualizarInspeccion(_prevState: FormState, formData: FormData): Promise<FormState> {
  const usuarioActual = await getCurrentUser();
  if (!usuarioActual) redirect("/login?next=/inspecciones");

  const id = formData.get("inspeccionId");
  if (typeof id !== "string" || !id) {
    return { error: "Falta el identificador de la inspección." };
  }

  const existente = await prisma.inspeccion.findUnique({
    where: { id },
    select: { inspectorId: true },
  });
  if (!existente) {
    return { error: "La inspección que intentas editar ya no existe." };
  }
  if (!puedeGestionar(usuarioActual, existente.inspectorId)) {
    return { error: "No tienes permiso para editar esta inspección: solo el inspector que la creó o un administrador pueden hacerlo." };
  }

  const datos = datosDesdeFormulario(formData);
  // Un INSPECTOR no puede reasignar su inspección a otra persona.
  if (!esAdmin(usuarioActual)) {
    datos.inspectorId = existente.inspectorId;
  }

  const parsed = inspeccionSchema.safeParse(datos);
  if (!parsed.success) {
    return {
      error: "Revisa los campos marcados: hay datos inválidos o incompletos.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const defectosResultado = parsearDefectos(formData);
  if ("error" in defectosResultado) return defectosResultado.error;
  const { defectos } = defectosResultado;

  const lote = await prisma.lote.findUnique({
    where: { id: parsed.data.loteId },
    select: { especie: true },
  });
  if (!lote) {
    return {
      error: "El lote seleccionado no existe.",
      fieldErrors: { loteId: ["Selecciona un lote válido."] },
    };
  }

  const inspector = await prisma.usuario.findUnique({
    where: { id: parsed.data.inspectorId },
    select: { id: true, activo: true },
  });
  if (!inspector || !inspector.activo) {
    return {
      error: "El inspector seleccionado no existe o está inactivo.",
      fieldErrors: { inspectorId: ["Selecciona un inspector válido."] },
    };
  }

  const resultado =
    lote.especie === EspecieFruta.CEREZA
      ? (evaluarResultadoCereza(defectos.map((d) => ({ tipo: d.tipo, porcentaje: d.porcentaje }))) as ResultadoInspeccion)
      : (parsed.data.resultado ?? ResultadoInspeccion.CATEGORIA_1);

  try {
    await prisma.$transaction([
      prisma.inspeccion.update({
        where: { id },
        data: {
          loteId: parsed.data.loteId,
          inspectorId: parsed.data.inspectorId,
          fecha: parsed.data.fecha ? new Date(parsed.data.fecha) : undefined,
          calibre: parsed.data.calibre ?? null,
          color: parsed.data.color ?? null,
          colorPorcentajeDark: parsed.data.colorPorcentajeDark ?? null,
          colorPorcentajeLight: parsed.data.colorPorcentajeLight ?? null,
          firmeza: parsed.data.firmeza ?? null,
          firmezaUnidad: firmezaUnidadPorEspecie(lote.especie),
          brixGrados: parsed.data.brixGrados ?? null,
          acidez: parsed.data.acidez ?? null,
          pesoMuestraKg: parsed.data.pesoMuestraKg ?? null,
          muestraCajas: parsed.data.muestraCajas ?? null,
          muestraUnidades: parsed.data.muestraUnidades ?? null,
          hidrocoolerTempAguaC: parsed.data.hidrocoolerTempAguaC ?? null,
          hidrocoolerCloroLibrePpm: parsed.data.hidrocoolerCloroLibrePpm ?? null,
          hidrocoolerTiempoExposicionMin: parsed.data.hidrocoolerTiempoExposicionMin ?? null,
          hidrocoolerTempPulpaPostC: parsed.data.hidrocoolerTempPulpaPostC ?? null,
          hidrocoolerEsperaMasDeUnaHora: booleanoOpcional(formData, "hidrocoolerEsperaMasDeUnaHora") ?? null,
          porcentajeRechazo: parsed.data.porcentajeRechazo ?? null,
          resultado,
          observaciones: parsed.data.observaciones ?? null,
        },
      }),
      prisma.defecto.deleteMany({ where: { inspeccionId: id } }),
      ...(defectos.length > 0
        ? [
            prisma.defecto.createMany({
              data: defectos.map((d) => ({
                inspeccionId: id,
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
    return { error: "No se pudo guardar la inspección. Intenta nuevamente." };
  }

  // Fotos a eliminar (checkboxes "eliminarFoto_<id>") + fotos nuevas.
  const fotosAEliminar = formData
    .getAll("eliminarFoto")
    .filter((v): v is string => typeof v === "string" && v.length > 0);
  if (fotosAEliminar.length > 0) {
    const fotos = await prisma.foto.findMany({
      where: { id: { in: fotosAEliminar }, inspeccionId: id },
    });
    await prisma.foto.deleteMany({ where: { id: { in: fotosAEliminar }, inspeccionId: id } });
    await Promise.all(fotos.map((f) => borrarFoto(f.url)));
  }
  await guardarFotosNuevas(id, formData);

  redirect(`/inspecciones/${id}`);
}

export async function eliminarInspeccion(_prevState: FormState, formData: FormData): Promise<FormState> {
  const usuarioActual = await getCurrentUser();
  if (!usuarioActual) redirect("/login?next=/inspecciones");

  const id = formData.get("inspeccionId");
  if (typeof id !== "string" || !id) {
    return { error: "Falta el identificador de la inspección." };
  }

  const existente = await prisma.inspeccion.findUnique({
    where: { id },
    select: { inspectorId: true, fotos: true },
  });
  if (!existente) {
    return { error: "La inspección que intentas eliminar ya no existe." };
  }
  if (!puedeGestionar(usuarioActual, existente.inspectorId)) {
    return { error: "No tienes permiso para eliminar esta inspección: solo el inspector que la creó o un administrador pueden hacerlo." };
  }

  try {
    // onDelete: Cascade en el schema borra defectos y fotos asociadas.
    await prisma.inspeccion.delete({ where: { id } });
  } catch {
    return { error: "No se pudo eliminar la inspección. Intenta nuevamente." };
  }

  await Promise.all(existente.fotos.map((f) => borrarFoto(f.url)));

  redirect("/inspecciones");
}
