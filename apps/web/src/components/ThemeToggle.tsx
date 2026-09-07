"use client";

import { Moon, Sun } from "lucide-react";

const THEME_STORAGE_KEY = "apexfruit-theme";

/**
 * El ícono visible (sol/luna) se decide con CSS puro (`dark:hidden` /
 * `dark:block`, ver @custom-variant en globals.css) leyendo la clase "dark"
 * real del <html> en el momento del paint — no hace falta estado de React
 * ni un efecto que la lea al montar, así que no hay parpadeo ni riesgo de
 * desajuste de hidratación.
 */
export function ThemeToggle() {
  function toggle() {
    const root = document.documentElement;
    const next = !root.classList.contains("dark");
    root.classList.toggle("dark", next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next ? "dark" : "light");
    } catch {
      // localStorage puede fallar en modo privado; el toggle sigue
      // funcionando para la sesión actual, solo no persiste.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Cambiar entre modo claro y modo oscuro"
      title="Cambiar modo claro / oscuro"
      className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-fg-muted transition-colors hover:border-brand-500/50 hover:text-fg"
    >
      <Sun className="h-4 w-4 dark:hidden" aria-hidden="true" />
      <Moon className="hidden h-4 w-4 dark:block" aria-hidden="true" />
    </button>
  );
}
