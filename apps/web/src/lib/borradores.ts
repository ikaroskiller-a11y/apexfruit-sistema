// Borradores locales de inspección (IndexedDB) — se usan cuando el envío
// del formulario falla por falta de señal en el packing/terreno. Solo se
// llama desde componentes cliente; nada acá corre en el servidor.
//
// Se guarda el FormData completo tal cual, entrada por entrada (incluidas
// las fotos como File, que IndexedDB soporta guardar directamente) para no
// tener que conocer la forma exacta del formulario acá — cualquier campo
// nuevo que se agregue a InspeccionForm queda cubierto sin tocar este
// archivo.

const DB_NOMBRE = "apexfruit-offline";
const DB_VERSION = 1;
const ALMACEN = "borradores-inspeccion";

export type BorradorInspeccion = {
  id: string;
  creadoEn: number;
  /** A qué server action hay que reenviar el borrador al reintentar. */
  actionKind: "crear" | "editar";
  /** Texto para mostrar en la lista de borradores (lote, especie, etapa). */
  resumen: string;
  entries: [string, string | File][];
};

function abrirDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NOMBRE, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(ALMACEN)) {
        db.createObjectStore(ALMACEN, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function guardarBorrador(
  formData: FormData,
  opts: { actionKind: "crear" | "editar"; resumen: string }
): Promise<string> {
  const id = crypto.randomUUID();
  const entries: [string, string | File][] = [];
  formData.forEach((valor, clave) => {
    entries.push([clave, valor instanceof File ? valor : String(valor)]);
  });

  const borrador: BorradorInspeccion = {
    id,
    creadoEn: Date.now(),
    actionKind: opts.actionKind,
    resumen: opts.resumen,
    entries,
  };

  const db = await abrirDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(ALMACEN, "readwrite");
    tx.objectStore(ALMACEN).put(borrador);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
  return id;
}

export async function listarBorradores(): Promise<BorradorInspeccion[]> {
  const db = await abrirDb();
  const borradores = await new Promise<BorradorInspeccion[]>((resolve, reject) => {
    const tx = db.transaction(ALMACEN, "readonly");
    const req = tx.objectStore(ALMACEN).getAll();
    req.onsuccess = () => resolve(req.result as BorradorInspeccion[]);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return borradores.sort((a, b) => b.creadoEn - a.creadoEn);
}

export async function eliminarBorrador(id: string): Promise<void> {
  const db = await abrirDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(ALMACEN, "readwrite");
    tx.objectStore(ALMACEN).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export function formDataDesdeBorrador(borrador: BorradorInspeccion): FormData {
  const fd = new FormData();
  for (const [clave, valor] of borrador.entries) {
    fd.append(clave, valor);
  }
  return fd;
}
