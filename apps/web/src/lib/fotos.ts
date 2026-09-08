import path from "node:path";

// Solo se aceptan imágenes: tanto la extensión del nombre como el MIME que
// reporta el navegador deben estar en esta lista. Ninguno de los dos es
// completamente confiable por separado (el nombre lo elige quien sube el
// archivo, el MIME lo puede falsificar un cliente no-navegador), pero juntos
// evitan que alguien suba un .html/.svg con script o un ejecutable disfrazado.
const EXTENSIONES_IMAGEN_PERMITIDAS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

export function esImagenPermitida(foto: File): boolean {
  const ext = path.extname(foto.name).toLowerCase();
  return EXTENSIONES_IMAGEN_PERMITIDAS.has(ext) && foto.type.startsWith("image/");
}

/**
 * Guarda una foto de inspección y devuelve la URL pública para `Foto.url`.
 * Usa Vercel Blob cuando hay `BLOB_READ_WRITE_TOKEN` configurado (Vercel no
 * tiene disco persistente, así que en producción esto es obligatorio); si no
 * hay token, cae a `public/uploads/` en el filesystem local — sirve para
 * correr en un servidor propio con disco persistente, pero no en Vercel.
 */
export async function guardarFoto(inspeccionId: string, foto: File): Promise<string> {
  const ext = path.extname(foto.name) || ".jpg";
  const { randomUUID } = await import("node:crypto");
  const filename = `${randomUUID()}${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`inspecciones/${inspeccionId}/${filename}`, foto, {
      access: "public",
    });
    return blob.url;
  }

  const { mkdir, writeFile } = await import("node:fs/promises");
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });
  const bytes = Buffer.from(await foto.arrayBuffer());
  await writeFile(path.join(uploadsDir, filename), bytes);
  return `/uploads/${filename}`;
}

/** Best-effort: si falla el borrado del archivo, no se interrumpe la operación. */
export async function borrarFoto(url: string): Promise<void> {
  try {
    if (url.startsWith("/uploads/")) {
      const { unlink } = await import("node:fs/promises");
      await unlink(path.join(process.cwd(), "public", url));
    } else {
      const { del } = await import("@vercel/blob");
      await del(url);
    }
  } catch {
    // Archivo ya no existe o no se pudo borrar — no es crítico.
  }
}
