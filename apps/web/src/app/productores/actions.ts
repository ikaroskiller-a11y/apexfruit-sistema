"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { esAdmin, getCurrentUser } from "@/lib/auth";
import { productorSchema, type FormState } from "@/lib/validation";
import { Prisma } from "@prisma/client";

function datosDesdeFormulario(formData: FormData) {
  return {
    nombre: formData.get("nombre"),
    rut: formData.get("rut"),
    contacto: formData.get("contacto"),
    email: formData.get("email"),
    telefono: formData.get("telefono"),
    direccion: formData.get("direccion"),
    notas: formData.get("notas"),
  };
}

/** Solo un ADMINISTRADOR puede crear/editar/eliminar productores (ver README). */
async function requiereAdmin(): Promise<{ ok: true } | { ok: false; state: FormState }> {
  const usuario = await getCurrentUser();
  if (!usuario) redirect("/login?next=/productores");
  if (!esAdmin(usuario)) {
    return {
      ok: false,
      state: { error: "Solo un administrador puede realizar esta acción." },
    };
  }
  return { ok: true };
}

export async function crearProductor(_prevState: FormState, formData: FormData): Promise<FormState> {
  const permiso = await requiereAdmin();
  if (!permiso.ok) return permiso.state;

  const parsed = productorSchema.safeParse(datosDesdeFormulario(formData));
  if (!parsed.success) {
    return {
      error: "Revisa los campos marcados: hay datos inválidos o incompletos.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  let productor;
  try {
    productor = await prisma.productor.create({
      data: {
        nombre: parsed.data.nombre,
        rut: parsed.data.rut,
        contacto: parsed.data.contacto,
        email: parsed.data.email,
        telefono: parsed.data.telefono,
        direccion: parsed.data.direccion,
        notas: parsed.data.notas,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return {
        error: "Ya existe un productor con ese RUT.",
        fieldErrors: { rut: ["Ese RUT ya está registrado en otro productor."] },
      };
    }
    return { error: "No se pudo guardar el productor. Intenta nuevamente." };
  }

  redirect(`/productores/${productor.id}`);
}

export async function actualizarProductor(_prevState: FormState, formData: FormData): Promise<FormState> {
  const permiso = await requiereAdmin();
  if (!permiso.ok) return permiso.state;

  const id = formData.get("productorId");
  if (typeof id !== "string" || !id) {
    return { error: "Falta el identificador del productor." };
  }

  const parsed = productorSchema.safeParse(datosDesdeFormulario(formData));
  if (!parsed.success) {
    return {
      error: "Revisa los campos marcados: hay datos inválidos o incompletos.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    await prisma.productor.update({
      where: { id },
      data: {
        nombre: parsed.data.nombre,
        rut: parsed.data.rut,
        contacto: parsed.data.contacto,
        email: parsed.data.email,
        telefono: parsed.data.telefono,
        direccion: parsed.data.direccion,
        notas: parsed.data.notas,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return {
        error: "Ya existe un productor con ese RUT.",
        fieldErrors: { rut: ["Ese RUT ya está registrado en otro productor."] },
      };
    }
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return { error: "El productor que intentas editar ya no existe." };
    }
    return { error: "No se pudo guardar el productor. Intenta nuevamente." };
  }

  redirect(`/productores/${id}`);
}

export async function eliminarProductor(_prevState: FormState, formData: FormData): Promise<FormState> {
  const permiso = await requiereAdmin();
  if (!permiso.ok) return permiso.state;

  const id = formData.get("productorId");
  if (typeof id !== "string" || !id) {
    return { error: "Falta el identificador del productor." };
  }

  const lotesAsociados = await prisma.lote.count({ where: { productorId: id } });
  if (lotesAsociados > 0) {
    return {
      error: `No se puede eliminar: este productor tiene ${lotesAsociados} lote(s) asociado(s). Elimina o reasigna esos lotes primero.`,
    };
  }

  try {
    await prisma.productor.delete({ where: { id } });
  } catch {
    return { error: "No se pudo eliminar el productor. Intenta nuevamente." };
  }

  redirect("/productores");
}
