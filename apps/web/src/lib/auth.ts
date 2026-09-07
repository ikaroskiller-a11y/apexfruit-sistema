/**
 * STUB de autenticación.
 *
 * Todavía no hay login real. Esto existe solo para que el resto de la app
 * (layout, formularios que registran "inspector", páginas protegidas) tenga
 * un lugar único de dónde sacar "el usuario actual" y no haya que reescribir
 * componentes cuando se agregue autenticación de verdad.
 *
 * Próximos pasos sugeridos (ver README):
 *  - Reemplazar `getCurrentUser` por una integración real (NextAuth/Auth.js,
 *    Clerk, o sesión propia con cookies + tabla Usuario.passwordHash).
 *  - Agregar `middleware.ts` para proteger rutas (/dashboard, /inspecciones,
 *    /lotes, /clientes) redirigiendo a /login si no hay sesión.
 *  - Usar el campo `rol` de Usuario (ADMINISTRADOR / INSPECTOR) para
 *    mostrar/ocultar acciones (ej: solo un admin puede editar clientes).
 */

export type SesionUsuario = {
  id: string;
  nombre: string;
  email: string;
  rol: "ADMINISTRADOR" | "INSPECTOR";
};

// Usuario "de mentira" mientras no exista login real. Cuando se conecte
// autenticación de verdad, esta función debería leer la sesión (cookie,
// JWT, etc.) y devolver `null` si no hay nadie autenticado.
export async function getCurrentUser(): Promise<SesionUsuario> {
  return {
    id: "demo-admin",
    nombre: "Usuario Demo",
    email: "demo@apexfruit.cl",
    rol: "ADMINISTRADOR",
  };
}

export const AUTH_PENDIENTE = true;
