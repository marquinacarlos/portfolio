// Cambiar de idioma recarga la página entera (el layout raíz cambia de /en a /es), y el scroll
// volvería al principio. Para no perder el sitio donde estabas, se guarda la posición justo
// antes de cambiar y la vista nueva la recupera al montarse. Solo para Client Components.

const STORAGE_KEY = "portfolio:restore-scroll";

/** Guarda la posición del scroll visible, asociada a la ruta SIN idioma (ej. "/blog"). */
export function saveScroll(pathWithoutLocale: string) {
  try {
    // Con cacheComponents pueden quedar vistas ocultas en el DOM (display: none): se ignoran.
    const scroller = Array.from(document.querySelectorAll("main")).find(
      (element) => getComputedStyle(element).display !== "none",
    );
    if (!scroller) return;
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ path: pathWithoutLocale, left: scroller.scrollLeft }),
    );
  } catch {
    // sin sessionStorage (modo privado, etc.): simplemente empieza desde el principio
  }
}

/** Devuelve la posición guardada si es de esta misma ruta, y la borra (se usa una sola vez). */
export function takeSavedScroll(pathWithoutLocale: string) {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(STORAGE_KEY);
    const saved = JSON.parse(raw) as { path: string; left: number };
    return saved.path === pathWithoutLocale ? saved.left : null;
  } catch {
    return null;
  }
}
