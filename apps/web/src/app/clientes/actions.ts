"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { esAdmin, getCurrentUser } from "@/lib/auth";
import { clienteSchema, type FormState } from "@/lib/validation";
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

/** Solo un ADMINISTRADOR puede crear/editar/eliminar clientes (ver README). */
async function requiereAdmin(): Promise<{ ok: true } | { ok: false; state: FormState }> {
  const usuario = await getCurrentUser();
  if (!usuario) redirect("/login?next=/clientes");
  if (!esAdmin(usuario)) {
    return {
      ok: false,
      state: { error: "Solo un administrador puede realizar esta acción." },
    };
  }
  return { ok: true };
}

export async function crearCliente(_prevState: FormState, formData: FormData): Promise<FormState> {
  const permiso = await requiereAdmin();
  if (!permiso.ok) return permiso.state;

  const parsed = clienteSchema.safeParse(datosDesdeFormulario(formData));
  if (!parsed.success) {
    return {
      error: "Revisa los campos marcados: hay datos inválidos o incompletos.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  let cliente;
  try {
    cliente = await prisma.cliente.create({
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
        error: "Ya existe un cliente con ese RUT.",
        fieldErrors: { rut: ["Ese RUT ya está registrado en otro cliente."] },
      };
    }
    return { error: "No se pudo guardar el cliente. Intenta nuevamente." };
  }

  redirect(`/clientes/${cliente.id}`);
}

export async function actualizarCliente(_prevState: FormState, formData: FormData): Promise<FormState> {
  const permiso = await requiereAdmin();
  if (!permiso.ok) return permiso.state;

  const id = formData.get("clienteId");
  if (typeof id !== "string" || !id) {
    return { error: "Falta el identificador del cliente." };
  }

  const parsed = clienteSchema.safeParse(datosDesdeFormulario(formData));
  if (!parsed.success) {
    return {
      error: "Revisa los campos marcados: hay datos inválidos o incompletos.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    await prisma.cliente.update({
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
        error: "Ya existe un cliente con ese RUT.",
        fieldErrors: { rut: ["Ese RUT ya está registrado en otro cliente."] },
      };
    }
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return { error: "El cliente que intentas editar ya no existe." };
    }
    return { error: "No se pudo guardar el cliente. Intenta nuevamente." };
  }

  redirect(`/clientes/${id}`);
}

export async function eliminarCliente(_prevState: FormState, formData: FormData): Promise<FormState> {
  const permiso = await requiereAdmin();
  if (!permiso.ok) return permiso.state;

  const id = formData.get("clienteId");
  if (typeof id !== "string" || !id) {
    return { error: "Falta el identificador del cliente." };
  }

  const lotesAsociados = await prisma.lote.count({ where: { clienteId: id } });
  if (lotesAsociados > 0) {
    return {
      error: `No se puede eliminar: este cliente tiene ${lotesAsociados} lote(s) asociado(s). Elimina o reasigna esos lotes primero.`,
    };
  }

  try {
    await prisma.cliente.delete({ where: { id } });
  } catch {
    return { error: "No se pudo eliminar el cliente. Intenta nuevamente." };
  }

  redirect("/clientes");
}
