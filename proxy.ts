import { NextResponse, type NextRequest } from "next/server";
import Negotiator from "negotiator";
import { match } from "@formatjs/intl-localematcher";
import { defaultLocale, hasLocale, LOCALE_COOKIE, locales } from "@/lib/i18n";

// Se ejecuta antes de renderizar. Si la URL no trae idioma (/ o /blog), redirige a /en o /es.
// Orden: 1) idioma guardado en la cookie, 2) idioma del navegador (Accept-Language), 3) inglés.
function getPreferredLocale(request: NextRequest) {
  const savedLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (savedLocale && hasLocale(savedLocale)) return savedLocale;

  const requestedLanguages = new Negotiator({
    headers: { "accept-language": request.headers.get("accept-language") ?? undefined },
  }).languages();

  try {
    // "es-MX" o "es-AR" encajan con "es".
    return match(requestedLanguages, [...locales], defaultLocale);
  } catch {
    return defaultLocale; // cabecera mal formada
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasLocalePrefix = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocalePrefix) return;

  request.nextUrl.pathname = `/${getPreferredLocale(request)}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // Salta lo interno de Next (_next) y cualquier archivo con extensión (favicon, imágenes,
  // /documents/*.pdf...): si no, también se les añadiría el idioma y darían 404.
  matcher: ["/((?!_next|.*\\..*).*)"],
};
