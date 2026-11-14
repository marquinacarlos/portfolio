import { notFound } from "next/navigation";
import { lang } from "next/root-params";
import { hasLocale, type Locale } from "@/lib/i18n";
import type en from "./dictionaries/en.json";

// Solo para Server Components. Los Client Components reciben los textos que necesitan por props.

/** La forma del diccionario la define en.json; es.json tiene que cumplirla igual. */
export type Dictionary = typeof en;

const dictionaries = {
  en: () => import("./dictionaries/en.json").then((module) => module.default),
  // `satisfies`: si a es.json le falta una clave o sobra una, TypeScript lo marca.
  es: () => import("./dictionaries/es.json").then((module) => module.default satisfies Dictionary),
};

/** Idioma de la URL actual (/en/..., /es/...). `lang` es un "root param": el segmento app/[lang]. */
export async function getLocale(): Promise<Locale> {
  const locale = await lang();
  if (!hasLocale(locale)) notFound();
  return locale;
}

export async function getDictionary(): Promise<Dictionary> {
  return dictionaries[await getLocale()]();
}
