export type Theme = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "theme";

/**
 * Script que se ejecuta en <head>, ANTES de pintar, para poner la clase `dark` en <html>.
 * Sin esto la página se vería un instante en claro y luego saltaría a oscuro (flash).
 * Misma lógica que applyTheme() en ThemeToggle: "system" sigue la preferencia del dispositivo.
 */
export const themeInitScript = `(function () {
  try {
    var stored = localStorage.getItem("${THEME_STORAGE_KEY}");
    var isDark = stored === "dark" || (stored !== "light" && matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", isDark);
  } catch (error) {}
})();`;
