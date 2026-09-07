/**
 * Firma y verificación de la cookie de sesión (JWT liviano con `jose`).
 *
 * Este módulo NO importa `next/headers` ni Prisma a propósito: lo usa tanto
 * `src/lib/auth.ts` (Server Components / Server Actions) como `src/proxy.ts`
 * (Proxy, ex-middleware), y Proxy no debería depender de fetch de datos ni
 * de APIs que solo existen dentro del árbol de renderizado de React. Ver
 * node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md
 * ("Proxy is not intended for slow data fetching").
 */
import { SignJWT, jwtVerify } from "jose";
import type { RolUsuario } from "@prisma/client";

export type SesionUsuario = {
  id: string;
  nombre: string;
  email: string;
  rol: RolUsuario;
};

export const SESSION_COOKIE_NAME = "af_session";
export const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 días

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.trim() === "") {
    throw new Error(
      "Falta la variable de entorno AUTH_SECRET. Define una clave larga " +
        "y aleatoria en .env (ver .env.example) — se usa para firmar la " +
        "cookie de sesión."
    );
  }
  return new TextEncoder().encode(secret);
}

/** Firma un JWT de sesión a partir de los datos (ya validados) del usuario. */
export async function firmarSesion(usuario: SesionUsuario): Promise<string> {
  return new SignJWT({
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecretKey());
}

/**
 * Verifica un token de sesión y devuelve el usuario si es válido, o `null`
 * si no hay token, está corrompido, expiró o la firma no coincide.
 */
export async function verificarTokenSesion(
  token: string | undefined | null
): Promise<SesionUsuario | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    const { id, nombre, email, rol } = payload;
    if (
      typeof id === "string" &&
      typeof nombre === "string" &&
      typeof email === "string" &&
      (rol === "ADMINISTRADOR" || rol === "INSPECTOR")
    ) {
      return { id, nombre, email, rol };
    }
    return null;
  } catch {
    // Firma inválida, token expirado o AUTH_SECRET mal configurado: se
    // trata igual que "sin sesión" en vez de reventar la request.
    return null;
  }
}
