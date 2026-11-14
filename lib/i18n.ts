// Idiomas de la web y utilidades de rutas. Sin dependencias del servidor: lo usan tanto
// los Server Components como los Client Components y el proxy.

export const locales = ["en", "es"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

/** Cookie donde se guarda el idioma elegido, para que `/` redirija a él la próxima vez. */
export const LOCALE_COOKIE = "NEXT_LOCALE";

export function hasLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

const localePrefix = new RegExp(`^/(${locales.join("|")})(?=/|$)`);

/** "/es/blog" → "/blog". "/en" → "/". Las rutas del pergamino (routes.ts) no llevan idioma. */
export function stripLocale(pathname: string) {
  return pathname.replace(localePrefix, "") || "/";
}

/** ("es", "/blog") → "/es/blog". ("es", "/") → "/es". */
export function localizePath(locale: Locale, path: string) {
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}
