"use server";

import { redirect } from "next/navigation";
import { cerrarSesion, crearSesion, validarCredenciales } from "@/lib/auth";

/**
 * Solo permite redirigir dentro de la propia app (evita usar el parámetro
 * `next` como open redirect hacia otro dominio).
 */
function destinoSeguro(valor: FormDataEntryValue | null): string {
  if (typeof valor !== "string" || !valor.startsWith("/") || valor.startsWith("//")) {
    return "/dashboard";
  }
  return valor;
}

export async function iniciarSesion(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = destinoSeguro(formData.get("next"));

  if (!email || !password) {
    redirect(`/login?error=1&next=${encodeURIComponent(next)}`);
  }

  const usuario = await validarCredenciales(email, password);
  if (!usuario) {
    redirect(`/login?error=1&next=${encodeURIComponent(next)}`);
  }

  await crearSesion(usuario);
  redirect(next);
}

export async function salirSesion(): Promise<void> {
  await cerrarSesion();
  redirect("/login");
}
