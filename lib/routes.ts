import type { Dictionary } from "@/i18n/dictionaries";
import { stripLocale } from "./i18n";

// Estas rutas NO llevan el idioma (/blog, no /es/blog). Quien las usa añade el prefijo con
// localizePath() de lib/i18n.ts. Las funciones de abajo aceptan rutas con o sin idioma.

// Ids de sección. Cada uno es el `id` de un <Section> y la clave de su texto en el diccionario
// (nav.sections.<id>). Son únicos en toda la web, aunque pertenezcan a rutas distintas.
export type SectionId = keyof Dictionary["nav"]["sections"];

export type NavRoute = {
  /** Clave del texto del enlace: nav.routes.<key> en el diccionario. */
  key: keyof Dictionary["nav"]["routes"];
  href: string;
  /**
   * Sub-menú de la ruta: las secciones de ESA ruta, en orden. El nav las muestra solo cuando
   * estás dentro de ella. Vacío = la ruta no tiene sub-menú. Para darle sub-menú a otra ruta
   * basta con ponerle `id` a sus <Section> y listarlos aquí (y su texto en los diccionarios).
   */
  sectionIds: readonly SectionId[];
};

// Primer nivel de navegación. Portfolio es la ruta principal: la home, con todas sus secciones
// en el mismo pergamino. Blog y Services están APARCADOS hasta tener contenido real (sus páginas
// viven en app/[lang]/_parked, ver el README de esa carpeta). Para recuperarlos, devolver la
// carpeta a app/[lang]/ y añadir aquí:
//   { key: "blog", href: "/blog", sectionIds: [] },
//   { key: "services", href: "/services", sectionIds: [] },
// El nav se adapta solo: con una única ruta no pinta la barra de rutas.
export const navRoutes: readonly NavRoute[] = [
  {
    key: "portfolio",
    href: "/",
    sectionIds: ["intro", "workflow", "projects", "stack", "path", "contact"],
  },
];

// Los casos de estudio (/projects/imeet) no son una ruta del nav: son una página "hija" de la
// sección Projects del portafolio. Mapa: prefijo de ruta → (ruta del nav, sección a la que pertenece).
const childPages = [{ prefix: "/projects/", routeHref: "/", sectionId: "projects" as const }];

/** Ruta de primer nivel a la que pertenece `pathname` (undefined si no es de ninguna, ej. un 404). */
export function getActiveRoute(pathname: string) {
  const path = stripLocale(pathname);
  const childPage = childPages.find((child) => path.startsWith(child.prefix));
  const routeHref = childPage ? childPage.routeHref : path;
  return navRoutes.find((route) => route.href === routeHref);
}

/** Si `pathname` es una página hija de una sección (un caso de estudio), esa sección. */
export function getParentSection(pathname: string) {
  const path = stripLocale(pathname);
  return childPages.find((child) => path.startsWith(child.prefix))?.sectionId;
}

/** Rutas anterior y siguiente del menú (Portafolio → Blog → Servicios). Para los enlaces del final de cada vista. */
export function getRouteNeighbors(href: string) {
  const index = navRoutes.findIndex((route) => route.href === href);
  return { previous: navRoutes[index - 1], next: navRoutes[index + 1] };
}

// Posición de cada vista en el pergamino, de izquierda a derecha. Solo sirve para saber
// hacia qué lado deslizar al hacer clic en el nav. Los proyectos van justo tras la home.
function getPosition(pathname: string) {
  const path = stripLocale(pathname);
  if (path === "/") return 0;
  if (path.startsWith("/projects/")) return 1;
  const otherRoutes = navRoutes.filter((route) => route.href !== "/");
  return 2 + otherRoutes.findIndex((route) => route.href === path);
}

/** Tipo de transición para ir de `from` a `to`: avanzar, retroceder o ninguna. */
export function getTransitionType(from: string, to: string) {
  const difference = getPosition(to) - getPosition(from);
  if (difference > 0) return "nav-forward";
  if (difference < 0) return "nav-back";
  return undefined;
}
