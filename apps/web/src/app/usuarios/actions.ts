"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { esAdmin, getCurrentUser } from "@/lib/auth";
import { usuarioSchema, type FormState } from "@/lib/validation";
import { Prisma } from "@prisma/client";

function datosDesdeFormulario(formData: FormData) {
  return {
    nombre: formData.get("nombre"),
    email: formData.get("email"),
    password: formData.get("password"),
    rol: formData.get("rol"),
    activo: formData.get("activo"),
  };
}

/** Solo un ADMINISTRADOR puede gestionar usuarios (ver README). */
async function requiereAdmin(): Promise<
  { ok: true; usuario: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>> } | { ok: false; state: FormState }
> {
  const usuario = await getCurrentUser();
  if (!usuario) redirect("/login?next=/usuarios");
  if (!esAdmin(usuario)) {
    return {
      ok: false,
      state: { error: "Solo un administrador puede realizar esta acción." },
    };
  }
  return { ok: true, usuario };
}

export async function crearUsuario(_prevState: FormState, formData: FormData): Promise<FormState> {
  const permiso = await requiereAdmin();
  if (!permiso.ok) return permiso.state;

  const parsed = usuarioSchema.safeParse(datosDesdeFormulario(formData));
  if (!parsed.success) {
    return {
      error: "Revisa los campos marcados: hay datos inválidos o incompletos.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  if (!parsed.data.password) {
    return {
      error: "La contraseña es obligatoria al crear un usuario.",
      fieldErrors: { password: ["La contraseña es obligatoria al crear un usuario."] },
    };
  }

  let usuario;
  try {
    usuario = await prisma.usuario.create({
      data: {
        nombre: parsed.data.nombre,
        email: parsed.data.email,
        passwordHash: await bcrypt.hash(parsed.data.password, 10),
        rol: parsed.data.rol,
        activo: parsed.data.activo,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return {
        error: "Ya existe un usuario con ese correo.",
        fieldErrors: { email: ["Ese correo ya está registrado por otro usuario."] },
      };
    }
    return { error: "No se pudo crear el usuario. Intenta nuevamente." };
  }

  redirect(`/usuarios/${usuario.id}/editar`);
}

export async function actualizarUsuario(_prevState: FormState, formData: FormData): Promise<FormState> {
  const permiso = await requiereAdmin();
  if (!permiso.ok) return permiso.state;

  const id = formData.get("usuarioId");
  if (typeof id !== "string" || !id) {
    return { error: "Falta el identificador del usuario." };
  }

  const parsed = usuarioSchema.safeParse(datosDesdeFormulario(formData));
  if (!parsed.success) {
    return {
      error: "Revisa los campos marcados: hay datos inválidos o incompletos.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  // Un admin no puede desactivarse ni quitarse el rol a sí mismo — evita
  // quedarse sin poder volver a entrar a /usuarios para deshacerlo.
  if (id === permiso.usuario.id && (!parsed.data.activo || parsed.data.rol !== "ADMINISTRADOR")) {
    return {
      error: "No puedes desactivar tu propia cuenta ni quitarte el rol de administrador.",
    };
  }

  try {
    await prisma.usuario.update({
      where: { id },
      data: {
        nombre: parsed.data.nombre,
        email: parsed.data.email,
        rol: parsed.data.rol,
        activo: parsed.data.activo,
        ...(parsed.data.password
          ? { passwordHash: await bcrypt.hash(parsed.data.password, 10) }
          : {}),
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return {
        error: "Ya existe un usuario con ese correo.",
        fieldErrors: { email: ["Ese correo ya está registrado por otro usuario."] },
      };
    }
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return { error: "El usuario que intentas editar ya no existe." };
    }
    return { error: "No se pudo guardar el usuario. Intenta nuevamente." };
  }

  redirect("/usuarios");
}
