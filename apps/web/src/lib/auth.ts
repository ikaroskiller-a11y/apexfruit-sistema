/**
 * Autenticación real: sesión propia con cookie HTTP-only firmada (JWT vía
 * `jose`) + contraseñas hasheadas con `bcryptjs` sobre `Usuario.passwordHash`.
 *
 * No usamos NextAuth/Auth.js: para un solo formulario de email+contraseña
 * agrega más superficie (adapters, providers, tablas propias) de la que
 * resuelve, y este proyecto ya tiene su propio modelo `Usuario` en Prisma.
 *
 * La verificación del JWT en sí vive en `src/lib/session.ts` (sin
 * dependencias de `next/headers` ni Prisma) para poder reusarla también
 * desde `src/proxy.ts`. Este archivo agrega el lado que sí necesita esas
 * dependencias: leer/escribir la cookie y consultar la base de datos.
 */
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  SESSION_COOKIE_NAME,
  SESSION_DURATION_SECONDS,
  firmarSesion,
  verificarTokenSesion,
  type SesionUsuario,
} from "@/lib/session";

export type { SesionUsuario };

/**
 * Usuario de la sesión actual, o `null` si no hay cookie, el token expiró,
 * la firma no es válida, o el usuario ya no existe/está inactivo.
 *
 * Los callers que asumían un usuario siempre presente (versión anterior,
 * stub) deben manejar el caso `null` explícitamente.
 */
export async function getCurrentUser(): Promise<SesionUsuario | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;
  return verificarTokenSesion(token);
}

/** `true` si hay sesión y el usuario es ADMINISTRADOR. */
export function esAdmin(usuario: SesionUsuario | null): boolean {
  return usuario?.rol === "ADMINISTRADOR";
}

/**
 * Valida email + contraseña contra `Usuario.passwordHash`. Devuelve los
 * datos de sesión si son correctos y la cuenta está activa, o `null` en
 * cualquier otro caso (usuario inexistente, inactivo, sin password
 * configurado, o contraseña incorrecta) — sin distinguir el motivo, para no
 * filtrar qué correos existen.
 */
export async function validarCredenciales(
  email: string,
  password: string
): Promise<SesionUsuario | null> {
  const usuario = await prisma.usuario.findUnique({
    where: { email: email.trim().toLowerCase() },
  });
  if (!usuario || !usuario.activo || !usuario.passwordHash) return null;

  const passwordValido = await bcrypt.compare(password, usuario.passwordHash);
  if (!passwordValido) return null;

  return {
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol,
  };
}

/**
 * Emite la cookie de sesión (HTTP-only, firmada). Solo se puede llamar
 * desde un Server Action o Route Handler (ver docs de `cookies()`).
 */
export async function crearSesion(usuario: SesionUsuario): Promise<void> {
  const token = await firmarSesion(usuario);
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

/** Borra la cookie de sesión (logout). */
export async function cerrarSesion(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE_NAME);
}
