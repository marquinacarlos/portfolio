"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { THEME_STORAGE_KEY, type Theme } from "@/lib/theme";
import type { Dictionary } from "@/i18n/dictionaries";

const THEME_CHANGE_EVENT = "theme-change";

function readTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : "system";
  } catch {
    return "system";
  }
}

// Misma lógica que themeInitScript (lib/theme.ts): "system" sigue la preferencia del dispositivo.
function applyTheme(theme: Theme) {
  const isDark =
    theme === "dark" || (theme === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", isDark);
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange); // otra pestaña cambió el tema
  window.addEventListener(THEME_CHANGE_EVENT, onChange); // esta pestaña cambió el tema
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(THEME_CHANGE_EVENT, onChange);
  };
}

const icons: Record<Theme, ReactNode> = {
  light: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </>
  ),
  system: (
    <>
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </>
  ),
  dark: <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />,
};

const themes: Theme[] = ["light", "system", "dark"];

/** Tres opciones: claro, oscuro y "sistema" (sigue la configuración del dispositivo). */
export default function ThemeToggle({ labels }: { labels: Dictionary["controls"]["theme"] }) {
  // El servidor no sabe qué eligió la persona: renderiza "system" y, al hidratar, React
  // cambia al valor real guardado (sin avisos de hidratación).
  const theme = useSyncExternalStore(subscribe, readTheme, () => "system" as Theme);

  useEffect(() => {
    applyTheme(theme);
    if (theme !== "system") return;
    // En modo sistema, si el dispositivo cambia de claro a oscuro, la web lo sigue en vivo.
    const systemPreference = matchMedia("(prefers-color-scheme: dark)");
    const handleSystemChange = () => applyTheme("system");
    systemPreference.addEventListener("change", handleSystemChange);
    return () => systemPreference.removeEventListener("change", handleSystemChange);
  }, [theme]);

  const select = (next: Theme) => {
    try {
      if (next === "system") localStorage.removeItem(THEME_STORAGE_KEY);
      else localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // sin localStorage: el cambio no se recuerda, pero sigue funcionando en esta visita
    }
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  };

  return (
    <div
      role="group"
      aria-label={labels.label}
      className="flex rounded-full border border-border p-0.5"
    >
      {themes.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={theme === option}
          aria-label={labels[option]}
          title={labels[option]}
          onClick={() => select(option)}
          className={`grid size-7 place-items-center rounded-full transition-colors ${
            theme === option
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-4"
            aria-hidden="true"
          >
            {icons[option]}
          </svg>
        </button>
      ))}
    </div>
  );
}
