"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { esAdmin, getCurrentUser } from "@/lib/auth";
import { loteSchema, type FormState } from "@/lib/validation";
import { Prisma } from "@prisma/client";

function datosDesdeFormulario(formData: FormData) {
  return {
    codigo: formData.get("codigo"),
    clienteId: formData.get("clienteId"),
    especie: formData.get("especie"),
    variedad: formData.get("variedad"),
    productorId: formData.get("productorId"),
    ubicacionPacking: formData.get("ubicacionPacking"),
    temporada: formData.get("temporada"),
    fechaCosecha: formData.get("fechaCosecha"),
    cajasTotales: formData.get("cajasTotales"),
    kgTotales: formData.get("kgTotales"),
    calibrePredominante: formData.get("calibrePredominante"),
    mercadoDestino: formData.get("mercadoDestino"),
    notas: formData.get("notas"),
  };
}

/** Solo un ADMINISTRADOR puede crear/editar/eliminar lotes (ver README). */
async function requiereAdmin(): Promise<{ ok: true } | { ok: false; state: FormState }> {
  const usuario = await getCurrentUser();
  if (!usuario) redirect("/login?next=/lotes");
  if (!esAdmin(usuario)) {
    return {
      ok: false,
      state: { error: "Solo un administrador puede realizar esta acción." },
    };
  }
  return { ok: true };
}

export async function crearLote(_prevState: FormState, formData: FormData): Promise<FormState> {
  const permiso = await requiereAdmin();
  if (!permiso.ok) return permiso.state;

  const parsed = loteSchema.safeParse(datosDesdeFormulario(formData));
  if (!parsed.success) {
    return {
      error: "Revisa los campos marcados: hay datos inválidos o incompletos.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const [cliente, productor] = await Promise.all([
    prisma.cliente.findUnique({ where: { id: parsed.data.clienteId } }),
    prisma.productor.findUnique({ where: { id: parsed.data.productorId } }),
  ]);
  if (!cliente) {
    return {
      error: "El cliente seleccionado no existe.",
      fieldErrors: { clienteId: ["Selecciona un cliente válido."] },
    };
  }
  if (!productor) {
    return {
      error: "El productor seleccionado no existe.",
      fieldErrors: { productorId: ["Selecciona un productor válido."] },
    };
  }

  let lote;
  try {
    lote = await prisma.lote.create({
      data: {
        codigo: parsed.data.codigo,
        clienteId: parsed.data.clienteId,
        especie: parsed.data.especie,
        variedad: parsed.data.variedad,
        productorId: parsed.data.productorId,
        ubicacionPacking: parsed.data.ubicacionPacking,
        temporada: parsed.data.temporada,
        fechaCosecha: parsed.data.fechaCosecha ? new Date(parsed.data.fechaCosecha) : undefined,
        cajasTotales: parsed.data.cajasTotales,
        kgTotales: parsed.data.kgTotales,
        calibrePredominante: parsed.data.calibrePredominante,
        mercadoDestino: parsed.data.mercadoDestino,
        notas: parsed.data.notas,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return {
        error: "Ya existe un lote con ese código.",
        fieldErrors: { codigo: ["Ese código ya está en uso."] },
      };
    }
    return { error: "No se pudo guardar el lote. Intenta nuevamente." };
  }

  redirect(`/lotes/${lote.id}`);
}

export async function actualizarLote(_prevState: FormState, formData: FormData): Promise<FormState> {
  const permiso = await requiereAdmin();
  if (!permiso.ok) return permiso.state;

  const id = formData.get("loteId");
  if (typeof id !== "string" || !id) {
    return { error: "Falta el identificador del lote." };
  }

  const parsed = loteSchema.safeParse(datosDesdeFormulario(formData));
  if (!parsed.success) {
    return {
      error: "Revisa los campos marcados: hay datos inválidos o incompletos.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const [cliente, productor] = await Promise.all([
    prisma.cliente.findUnique({ where: { id: parsed.data.clienteId } }),
    prisma.productor.findUnique({ where: { id: parsed.data.productorId } }),
  ]);
  if (!cliente) {
    return {
      error: "El cliente seleccionado no existe.",
      fieldErrors: { clienteId: ["Selecciona un cliente válido."] },
    };
  }
  if (!productor) {
    return {
      error: "El productor seleccionado no existe.",
      fieldErrors: { productorId: ["Selecciona un productor válido."] },
    };
  }

  try {
    await prisma.lote.update({
      where: { id },
      data: {
        codigo: parsed.data.codigo,
        clienteId: parsed.data.clienteId,
        especie: parsed.data.especie,
        variedad: parsed.data.variedad,
        productorId: parsed.data.productorId,
        ubicacionPacking: parsed.data.ubicacionPacking,
        temporada: parsed.data.temporada,
        fechaCosecha: parsed.data.fechaCosecha ? new Date(parsed.data.fechaCosecha) : null,
        cajasTotales: parsed.data.cajasTotales ?? null,
        kgTotales: parsed.data.kgTotales ?? null,
        calibrePredominante: parsed.data.calibrePredominante ?? null,
        mercadoDestino: parsed.data.mercadoDestino ?? null,
        notas: parsed.data.notas ?? null,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return {
        error: "Ya existe un lote con ese código.",
        fieldErrors: { codigo: ["Ese código ya está en uso."] },
      };
    }
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return { error: "El lote que intentas editar ya no existe." };
    }
    return { error: "No se pudo guardar el lote. Intenta nuevamente." };
  }

  redirect(`/lotes/${id}`);
}

export async function eliminarLote(_prevState: FormState, formData: FormData): Promise<FormState> {
  const permiso = await requiereAdmin();
  if (!permiso.ok) return permiso.state;

  const id = formData.get("loteId");
  if (typeof id !== "string" || !id) {
    return { error: "Falta el identificador del lote." };
  }

  // Eliminar un lote borra en cascada sus inspecciones (ver onDelete: Cascade
  // en el schema) — la confirmación en la UI ya avisa la cantidad, pero se
  // vuelve a advertir acá por si el action se invoca sin pasar por la UI.
  try {
    await prisma.lote.delete({ where: { id } });
  } catch {
    return { error: "No se pudo eliminar el lote. Intenta nuevamente." };
  }

  redirect("/lotes");
}
