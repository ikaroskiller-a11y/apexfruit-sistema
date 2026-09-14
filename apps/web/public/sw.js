// Service worker mínimo para instalabilidad de la PWA y caché del "shell"
// de la app. No implementa una estrategia offline completa: los datos
// (dashboard, listados) siguen requiriendo red. Lo que sí resuelve es que
// el formulario de "Nueva inspección" pueda abrirse aunque no haya señal,
// si ya se visitó antes con conexión — el guardado sin red se resuelve por
// separado en src/lib/borradores.ts (IndexedDB), no acá.

const CACHE_VERSION = "apexfruit-shell-v1";

const APP_SHELL = ["/", "/dashboard", "/inspecciones/nueva", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch(() => {
        // Alguna ruta del shell puede fallar (ej. requiere sesión activa);
        // no debe impedir que el resto del service worker se instale.
      })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

// Network-first con respaldo en caché: prioriza datos frescos (el sistema
// se usa con conexión casi siempre) y solo cae a lo cacheado cuando la red
// falla, guardando de paso cada respuesta exitosa para la próxima vez sin
// señal.
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        const copia = response.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(request, copia));
        return response;
      })
      .catch(async () => {
        const enCache = await caches.match(request);
        if (enCache) return enCache;
        if (request.mode === "navigate") {
          const shell = await caches.match("/dashboard");
          if (shell) return shell;
        }
        return Response.error();
      })
  );
});
