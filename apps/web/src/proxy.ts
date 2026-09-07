/**
 * Proxy (ex-`middleware.ts` — renombrado en Next.js 16, ver
 * node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md).
 *
 * Protege todas las rutas de la app excepto /login y los assets estáticos:
 * sin cookie de sesión válida, redirige a /login (con `next` para volver a
 * donde el usuario intentaba entrar). Si ya hay sesión y visita /login, lo
 * manda directo al dashboard.
 *
 * Solo importa de `@/lib/session` (no Prisma, no `next/headers`) a
 * propósito: Proxy corre antes del árbol de renderizado y no debería hacer
 * fetch de datos lento (ver "Proxy is not intended for slow data fetching"
 * en la doc de arriba). La verificación acá es una validación optimista de
 * la firma/expiración del JWT; cada Server Action/Route Handler sensible
 * igual debe validar sesión y rol por su cuenta (Data Security guide).
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verificarTokenSesion } from "@/lib/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const sesion = await verificarTokenSesion(token);

  if (pathname === "/login") {
    if (sesion) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (!sesion) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Todo excepto assets estáticos de Next, la API de Route Handlers, y
    // los archivos sueltos en /public (favicon, íconos, fotos subidas).
    "/((?!_next/static|_next/image|api|favicon\\.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)",
  ],
};
