import type { MetadataRoute } from "next";

// Colores de marca reales (docs/design/guia-diseno.md) — mismos tokens que
// --color-brand-950/-leaf usados en src/app/globals.css.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Apex Fruit · Control de calidad",
    short_name: "Apex Fruit",
    description:
      "Sistema interno de inspección y control de calidad de fruta de exportación — Apex Fruit SPA",
    start_url: "/dashboard",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#f6f1e5",
    theme_color: "#164735",
    lang: "es-CL",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
