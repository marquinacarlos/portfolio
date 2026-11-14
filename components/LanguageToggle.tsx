"use client";

import { useParams, usePathname } from "next/navigation";
import { LOCALE_COOKIE, localizePath, locales, stripLocale, type Locale } from "@/lib/i18n";
import { saveScroll } from "@/lib/scrollMemory";

/**
 * Cambia entre /en/... y /es/... manteniendo la misma vista. Son enlaces normales (<a>), no
 * <Link>: el layout raíz cambia con el idioma, así que Next recarga la página entera de
 * todos modos. Antes de salir se guarda el idioma elegido y la posición del scroll.
 */
export default function LanguageToggle({ label }: { label: string }) {
  const { lang } = useParams<{ lang: Locale }>();
  const pathWithoutLocale = stripLocale(usePathname());

  const remember = (locale: Locale) => {
    // La cookie hace que, la próxima vez, "/" redirija directamente a este idioma.
    document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
    saveScroll(pathWithoutLocale);
  };

  return (
    <div
      role="group"
      aria-label={label}
      className="flex rounded-full border border-border p-0.5 text-xs font-semibold uppercase"
    >
      {locales.map((locale) =>
        locale === lang ? (
          <span
            key={locale}
            aria-current="true"
            className="grid h-7 place-items-center rounded-full bg-primary px-2.5 text-primary-foreground"
          >
            {locale}
          </span>
        ) : (
          <a
            key={locale}
            href={localizePath(locale, pathWithoutLocale)}
            hrefLang={locale}
            lang={locale}
            onClick={() => remember(locale)}
            className="grid h-7 place-items-center rounded-full px-2.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            {locale}
          </a>
        ),
      )}
    </div>
  );
}
