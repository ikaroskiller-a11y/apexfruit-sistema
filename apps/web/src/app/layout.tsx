import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { esAdmin, getCurrentUser } from "@/lib/auth";

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Apex Fruit · Control de calidad",
  description:
    "Sistema interno de inspección y control de calidad de fruta de exportación — Apex Fruit SPA",
};

// Clave de localStorage usada también por ThemeToggle.tsx
const THEME_STORAGE_KEY = "apexfruit-theme";

// Se ejecuta antes de la hidratación (strategy="beforeInteractive") para leer
// la preferencia guardada y aplicar la clase "dark" antes del primer paint,
// evitando el parpadeo claro→oscuro. Si no hay preferencia guardada, respeta
// prefers-color-scheme del sistema.
const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem("${THEME_STORAGE_KEY}");
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (stored === "dark" || (stored !== "light" && prefersDark)) {
      document.documentElement.classList.add("dark");
    }
  } catch (e) {}
})();
`;

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const usuario = await getCurrentUser();

  return (
    <html
      lang="es-CL"
      suppressHydrationWarning
      className={`${plexSans.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-surface text-fg" suppressHydrationWarning>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        <div className="flex min-h-screen flex-col md:flex-row">
          <Sidebar esAdmin={esAdmin(usuario)} />
          <div className="flex min-w-0 flex-1 flex-col">
            <MobileNav esAdmin={esAdmin(usuario)} />
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
