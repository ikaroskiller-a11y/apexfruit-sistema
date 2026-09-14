"use client";

import { useEffect } from "react";

/**
 * Registra el service worker (public/sw.js) apenas carga la app. Sin esto,
 * Chrome/Android no considera instalable la PWA y no queda nada cacheado
 * para abrir el shell sin conexión.
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Sin service worker no hay instalación PWA ni shell cacheado, pero
        // el resto de la app sigue funcionando normalmente con conexión.
      });
    }
  }, []);

  return null;
}
