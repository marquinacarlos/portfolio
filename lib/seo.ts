import type { Metadata } from "next";
import { defaultLocale, locales, type Locale } from "./i18n";

/**
 * Canonical y versiones por idioma (hreflang) de UNA página. `path` es la ruta sin idioma:
 * "" para la home, "/projects/imeet" para un proyecto. Va en cada página y no en el layout:
 * en el layout lo heredarían las páginas hijas apuntando a la ruta equivocada.
 * `x-default` es la versión para quien no encaja con ningún idioma (inglés).
 */
export function alternatesFor(locale: Locale, path: string): Metadata["alternates"] {
  return {
    canonical: `/${locale}${path}`,
    languages: {
      ...Object.fromEntries(locales.map((code) => [code, `/${code}${path}`])),
      "x-default": `/${defaultLocale}${path}`,
    },
  };
}

/** Etiquetas Open Graph (vista previa al compartir). La imagen sale de opengraph-image.tsx. */
export function openGraphFor(
  locale: Locale,
  title: string,
  description: string,
  path = "",
): Metadata["openGraph"] {
  return {
    type: "website",
    url: `/${locale}${path}`,
    siteName: "Carlos Marquina",
    title,
    description,
    locale: locale === "es" ? "es_ES" : "en_US",
    alternateLocale: locale === "es" ? ["en_US"] : ["es_ES"],
  };
}
