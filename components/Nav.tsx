"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type MouseEvent,
} from "react";
import LanguageToggle from "@/components/LanguageToggle";
import Breadcrumbs from "@/components/Breadcrumbs";
import ThemeToggle from "@/components/ThemeToggle";
import type { Dictionary } from "@/i18n/dictionaries";
import { getActiveSection, subscribeActiveSection } from "@/lib/activeSection";
import { localizePath, stripLocale, type Locale } from "@/lib/i18n";
import { scrollToSection } from "@/lib/scrollToSection";
import {
  getActiveRoute,
  getParentSection,
  getTransitionType,
  navRoutes,
  type NavRoute,
  type SectionId,
} from "@/lib/routes";

const LINE_HEIGHT = 16; // px por "línea" cuando la rueda mide en líneas (Firefox)

// Estilo minimalista de "estás aquí" para las rutas (barra y panel): el enlace activo
// (`aria-current`) va en negrita y subrayado en color primario. Es solo texto, así que marcar
// uno no mueve a los demás.
const routeActiveClassName =
  "aria-[current]:font-semibold aria-[current]:underline aria-[current]:decoration-primary aria-[current]:decoration-2 aria-[current]:underline-offset-4 aria-[current]:[text-decoration-skip-ink:none]";
// (skip-ink: none → la línea no se parte alrededor de letras con rabo como la "g" de Blog)
// Enlaces del sub-menú: `shrink-0 whitespace-nowrap` porque es UNA línea y no se parten.
// La activa se marca con un punto debajo del texto (sin fondo), no con color de relleno.
const sectionLinkClassName =
  "flex shrink-0 flex-col items-center gap-0.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-muted-foreground transition-colors hover:text-foreground aria-[current]:font-semibold aria-[current]:text-foreground after:size-1 after:rounded-full after:bg-transparent aria-[current]:after:bg-primary";
// El punto es un elemento más de la columna (texto + hueco + punto), no está superpuesto: el
// conjunto mide lo mismo con y sin marca, y `items-center` de la barra lo centra en vertical.
// Rutas en la barra superior (escritorio): misma altura que los selectores de idioma y tema.
const routeBarLinkClassName = `grid h-7 place-items-center whitespace-nowrap rounded-full px-3 text-muted-foreground transition-colors hover:text-foreground aria-[current]:text-foreground ${routeActiveClassName}`;
// Rutas dentro del panel del botón de menú (móvil): grandes, para que sean fáciles de pulsar.
const routeMenuLinkClassName = `block flex-1 rounded-xl px-4 py-3 text-xl transition-colors hover:bg-accent hover:text-accent-foreground ${routeActiveClassName}`;
// Secciones dentro de una ruta desplegada del panel: la activa lleva un punto delante. El hueco
// del punto existe siempre (transparente), así que marcar una no mueve el texto de las demás.
const sectionMenuLinkClassName =
  "flex items-center gap-3 rounded-xl px-4 py-2.5 text-base text-muted-foreground transition-colors before:size-1.5 before:shrink-0 before:rounded-full before:bg-transparent hover:bg-accent hover:text-accent-foreground aria-[current]:font-medium aria-[current]:text-foreground aria-[current]:before:bg-primary";

type NavProps = {
  labels: Dictionary["nav"];
  controls: Dictionary["controls"];
};

// La navegación tiene dos niveles, igual que la estructura de la web (ver lib/routes.ts):
// - RUTAS (Portafolio, Blog, Servicios): el menú. Escritorio: barra de arriba, junto al idioma y
//   el tema. Móvil: dentro del panel que abre el botón de menú.
// - SECCIONES de la ruta actual: el sub-menú, en la barra de abajo. Solo muestra las suyas (las de
//   otra ruta nunca se mezclan) y desaparece si la ruta no tiene.
//
// Client Component porque necesita saber en qué vista estamos (usePathname):
// - para decidir si un enlace de sección hace scroll (ya estamos en la ruta) o navega;
// - para decidir hacia qué lado se desliza la transición.
// Los textos llegan por props desde el layout (que sí conoce el diccionario).
export default function Nav({ labels, controls }: NavProps) {
  const { lang } = useParams<{ lang: Locale }>();
  const pathname = usePathname();
  const path = stripLocale(pathname);

  const activeRoute = getActiveRoute(pathname);
  const sectionIds = activeRoute?.sectionIds ?? [];
  const hasSubmenu = sectionIds.length > 0;
  // ¿Estamos en la página principal de la ruta (/) o en una hija suya (/projects/imeet)?
  const isOnRouteIndex = activeRoute !== undefined && path === activeRoute.href;

  // Qué sección del sub-menú está activa:
  // - En la página principal de la ruta, la que el scroller dice que se está viendo (scroll spy).
  //   El servidor no sabe dónde está el scroll: devuelve null y mientras tanto se marca la primera.
  // - En una página hija (caso de estudio), la sección a la que pertenece ("Projects").
  const spiedSection = useSyncExternalStore(subscribeActiveSection, getActiveSection, () => null);
  const activeSectionId: SectionId | null = !hasSubmenu
    ? null
    : isOnRouteIndex
      ? (sectionIds.find((id) => id === spiedSection) ?? sectionIds[0])
      : (getParentSection(pathname) ?? null);
  const activeLinkKey = activeSectionId ? `section:${activeSectionId}` : null;

  // --- Botón de menú (móvil) ---

  // Guardamos la ruta en la que se abrió, no un simple true/false: así el panel se cierra solo
  // en cuanto cambia la ruta, sin efectos ni estados duplicados.
  const [menuOpenedAt, setMenuOpenedAt] = useState<string | null>(null);
  const isMenuOpen = menuOpenedAt === pathname;
  const menuId = useId();
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Acordeón del panel: qué rutas están desplegadas. Por defecto solo la actual; lo que el
  // usuario abre o cierra se guarda aquí (clave de la ruta → desplegada o no) y se borra al
  // abrir el panel de nuevo.
  const [expandedOverrides, setExpandedOverrides] = useState<Record<string, boolean>>({});
  const isRouteExpanded = (route: NavRoute) => expandedOverrides[route.key] ?? activeRoute?.key === route.key;
  const toggleRouteExpanded = (route: NavRoute) =>
    setExpandedOverrides((previous) => ({ ...previous, [route.key]: !isRouteExpanded(route) }));

  // Con el panel abierto, Escape lo cierra. El panel ocupa toda la pantalla, así que no hace
  // falta cerrar al pulsar "fuera": no hay fuera.
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMenuOpenedAt(null);
      menuButtonRef.current?.focus(); // devolver el foco al botón, como espera un lector de pantalla
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

  // --- El sub-menú es una tira horizontal con scroll propio ---
  // En móvil el espacio es poco: la tira se desplaza y la sección activa se mantiene centrada.
  // En escritorio caben todas las secciones: no hay nada que desplazar y se ven todas a la vez.

  const scrollerRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef(new Map<string, HTMLAnchorElement>());

  const registerLink = (key: string) => (element: HTMLAnchorElement | null) => {
    if (element) linkRefs.current.set(key, element);
    else linkRefs.current.delete(key);
  };

  // La tira NO centra la sección activa: se queda donde el usuario la dejó. Solo se asegura de
  // que la activa no quede fuera de la vista (por ejemplo, tras pulsar una sección del panel o
  // al hacer scroll por el pergamino): si ya se ve, no se mueve nada; si no, se desplaza lo justo.
  useEffect(() => {
    const scroller = scrollerRef.current;
    const activeLink = activeLinkKey ? linkRefs.current.get(activeLinkKey) : undefined;
    if (!scroller || !activeLink) return;
    const linkStart = activeLink.offsetLeft;
    const linkEnd = linkStart + activeLink.offsetWidth;
    const viewStart = scroller.scrollLeft;
    const viewEnd = viewStart + scroller.clientWidth;
    if (linkStart >= viewStart && linkEnd <= viewEnd) return;
    const prefersReducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    scroller.scrollTo({
      left: linkStart < viewStart ? linkStart : linkEnd - scroller.clientWidth,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }, [activeLinkKey]);

  // Con la rueda del mouse (que gira en vertical) sobre el sub-menú, la tira se desplaza en
  // horizontal (solo si hay algo que desplazar). En táctil, el scroll horizontal nativo ya
  // funciona. passive: false para poder usar preventDefault(). La tira siempre existe en el
  // DOM (solo se oculta), así que este listener no se pierde al cambiar de ruta.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const handleWheel = (event: WheelEvent) => {
      if (scroller.scrollWidth <= scroller.clientWidth) return; // todo cabe: nada que desplazar
      if (Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return; // trackpad horizontal: nativo
      event.preventDefault();
      scroller.scrollLeft +=
        event.deltaMode === WheelEvent.DOM_DELTA_LINE ? event.deltaY * LINE_HEIGHT : event.deltaY;
    };
    scroller.addEventListener("wheel", handleWheel, { passive: false });
    return () => scroller.removeEventListener("wheel", handleWheel);
  }, []);

  // --- Clics ---

  const handleSectionClick = (event: MouseEvent, sectionId: string) => {
    if (!isOnRouteIndex) return; // en una página hija, el Link navega a /es#id (lo resuelve el scroller)
    event.preventDefault();
    scrollToSection(sectionId);
  };

  // Pulsar la ruta en la que ya estás no navega a ningún sitio: lleva al principio de ella.
  const handleRouteClick = (event: MouseEvent, route: NavRoute) => {
    setMenuOpenedAt(null); // si el clic vino del panel del botón de menú, se cierra
    if (path !== route.href || route.sectionIds.length === 0) return;
    event.preventDefault();
    scrollToSection(route.sectionIds[0]);
  };

  // Clic en una sección dentro del panel: el panel se cierra siempre. Si la sección es de la
  // ruta en la que ya estás, se hace scroll; si no, el Link navega (y su transición se encarga).
  const handleMenuSectionClick = (event: MouseEvent, route: NavRoute, sectionId: string) => {
    setMenuOpenedAt(null);
    if (activeRoute?.key !== route.key || !isOnRouteIndex) return;
    event.preventDefault();
    scrollToSection(sectionId);
  };

  const transitionTypesTo = (target: string) => {
    const type = getTransitionType(pathname, target);
    return type ? [type] : undefined;
  };

  // Botón de contacto, siempre a mano en la barra de arriba. Lleva a la sección Contacto: si ya
  // estás en el portafolio hace scroll; si estás en otra vista (un caso de estudio), navega.
  const hasMultipleRoutes = navRoutes.length > 1;
  const contactLink = (visibilityClassName: string) => (
    <Link
      href={`${localizePath(lang, "/")}#contact`}
      scroll={false}
      transitionTypes={transitionTypesTo("/")}
      onClick={(event) => {
        if (path !== "/") return; // desde otra vista, el Link navega
        event.preventDefault();
        scrollToSection("contact");
      }}
      className={`pointer-events-auto grid h-8 place-items-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 ${visibilityClassName}`}
    >
      {labels.contact}
    </Link>
  );

  const routeLink = (route: NavRoute, linkClassName: string) => (
    <Link
      href={localizePath(lang, route.href)}
      transitionTypes={transitionTypesTo(route.href)}
      onClick={(event) => handleRouteClick(event, route)}
      aria-current={
        activeRoute?.key === route.key ? (path === route.href ? "page" : "true") : undefined
      }
      className={linkClassName}
    >
      {labels.routes[route.key]}
    </Link>
  );

  return (
    // Dos barras fijas en pantalla. Su tamaño sale de las mismas variables que la zona segura
    // de <Section> (--controls-height, --nav-height). Cada una lleva view-transition-name para
    // quedarse quieta y por encima mientras las vistas se deslizan. Las barras ocupan todo el
    // ancho pero no capturan el puntero (`pointer-events-none`): solo sus botones lo hacen, así
    // la rueda y los toques sobre el hueco llegan a la página.
    <>
      {/* Migas de pan de la vista, bajo los controles de arriba (ver Breadcrumbs). */}
      <Breadcrumbs label={labels.breadcrumbs} />

      {/* Arriba. Escritorio: las rutas a la izquierda (si hay varias); a la derecha, contacto,
          idioma y tema. Móvil: idioma y tema a la derecha (las rutas están en el botón de menú). */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-10 flex h-(--controls-height) items-center gap-2 px-(--section-gutter) [view-transition-name:site-controls]">
        {/* Móvil, a la izquierda: con varias rutas, el nombre de la vista actual (misma píldora y
            altura h-8 que la barra de rutas de escritorio); con una sola ruta, el botón de
            contacto (el nombre no aportaría nada). */}
        {hasMultipleRoutes && activeRoute ? (
          <span className="grid h-8 place-items-center rounded-full border border-border px-4 text-sm font-semibold sm:hidden">
            {labels.routes[activeRoute.key]}
          </span>
        ) : (
          contactLink("sm:hidden")
        )}
        {/* Escritorio: la barra de rutas solo existe si hay más de una. */}
        {hasMultipleRoutes && (
          <nav
            aria-label={labels.label}
            className="pointer-events-auto hidden rounded-full border border-border p-0.5 text-sm font-medium sm:flex"
          >
            {navRoutes.map((route) => (
              <span key={route.key} className="contents">
                {routeLink(route, routeBarLinkClassName)}
              </span>
            ))}
          </nav>
        )}
        <div className="pointer-events-auto ml-auto flex items-center gap-2">
          {contactLink("max-sm:hidden")}
          <LanguageToggle label={controls.language} />
          <ThemeToggle labels={controls.theme} />
        </div>
      </div>

      {/* Abajo. Escritorio: el sub-menú centrado, con todas las secciones a la vista.
          Móvil: el sub-menú a la izquierda (ocupa lo que sobra), un hueco, y a la derecha el
          botón de menú. */}
      <div className="pointer-events-none fixed inset-x-(--section-gutter) bottom-3 z-10 flex items-center gap-2 sm:justify-center [view-transition-name:site-nav]">
        {/* Sub-menú: las secciones de la ruta actual. En móvil, los dos <span> de los extremos
            miden la mitad del ancho (así incluso la primera y la última pueden quedar en el
            centro) y una máscara difumina los bordes para que se note que hay más. Siempre está
            en el DOM; si la ruta no tiene secciones, solo se oculta (`hidden`). */}
        <nav
          aria-label={labels.sectionsLabel}
          hidden={!hasSubmenu}
          className={`pointer-events-auto ${isMenuOpen ? "max-sm:invisible" : ""} h-9 min-w-0 flex-1 overflow-hidden rounded-3xl border border-border bg-background/80 text-sm font-medium backdrop-blur sm:max-w-full sm:flex-none`}
        >
          <div
            ref={scrollerRef}
            className="relative flex h-full items-center overflow-x-auto overscroll-x-contain px-1 scrollbar-none"
          >
            {activeRoute &&
              sectionIds.map((sectionId) => (
                <Link
                  key={sectionId}
                  ref={registerLink(`section:${sectionId}`)}
                  href={`${localizePath(lang, activeRoute.href)}#${sectionId}`}
                  scroll={false}
                  transitionTypes={transitionTypesTo(activeRoute.href)}
                  onClick={(event) => handleSectionClick(event, sectionId)}
                  aria-current={activeSectionId === sectionId ? "location" : undefined}
                  className={sectionLinkClassName}
                >
                  {labels.sections[sectionId]}
                </Link>
              ))}
          </div>
        </nav>

        {/* Botón de menú (solo móvil): abre un panel con las rutas, encima del botón. `ml-auto`
            lo mantiene a la derecha aunque el sub-menú esté oculto. */}
        <div className="pointer-events-auto ml-auto shrink-0 sm:hidden">
          <button
            ref={menuButtonRef}
            type="button"
            aria-expanded={isMenuOpen}
            aria-controls={menuId}
            aria-label={isMenuOpen ? labels.closeMenu : labels.openMenu}
            onClick={() => {
              if (!isMenuOpen) setExpandedOverrides({});
              setMenuOpenedAt(isMenuOpen ? null : pathname);
            }}
            className="grid size-9 place-items-center rounded-full border border-border bg-background/80 backdrop-blur transition-colors hover:bg-accent hover:text-accent-foreground aria-expanded:bg-accent"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="size-5"
              aria-hidden="true"
            >
              {isMenuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Panel del menú (móvil): cubre toda la pantalla. z-5 lo deja POR DEBAJO de las dos barras
          (z-10): el botón de abajo sigue ahí para cerrarlo y el idioma y el tema siguen a mano.
          Cada ruta con secciones es un acordeón: el chevron despliega sus secciones. */}
      {isMenuOpen && (
        <nav
          id={menuId}
          aria-label={labels.label}
          className="fixed inset-0 z-5 overflow-y-auto overscroll-contain bg-background px-(--section-gutter) pt-(--controls-height) pb-(--nav-height) sm:hidden"
        >
          <ul className="flex flex-col gap-1 py-4 font-medium">
            {navRoutes.map((route) => {
              const hasSections = route.sectionIds.length > 0;
              const isExpanded = hasSections && isRouteExpanded(route);
              const sectionsId = `${menuId}-${route.key}`;
              return (
                <li key={route.key}>
                  <div className="flex items-center gap-1">
                    {routeLink(route, routeMenuLinkClassName)}
                    {hasSections && (
                      <button
                        type="button"
                        aria-expanded={isExpanded}
                        aria-controls={sectionsId}
                        aria-label={`${labels.routes[route.key]}: ${labels.toggleSections}`}
                        onClick={() => toggleRouteExpanded(route)}
                        className="grid size-12 shrink-0 place-items-center rounded-xl transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className={`size-5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                          aria-hidden="true"
                        >
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </button>
                    )}
                  </div>
                  {hasSections && (
                    // grid-rows 0fr → 1fr anima la altura sin medirla. `inert` saca del foco y de
                    // los lectores de pantalla las secciones mientras están plegadas.
                    <div
                      id={sectionsId}
                      inert={!isExpanded}
                      className={`grid transition-[grid-template-rows] duration-200 ${isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                    >
                      <ul className="flex min-h-0 flex-col gap-0.5 overflow-hidden pl-4">
                        {route.sectionIds.map((sectionId) => (
                          <li key={sectionId}>
                            <Link
                              href={`${localizePath(lang, route.href)}#${sectionId}`}
                              scroll={false}
                              transitionTypes={transitionTypesTo(route.href)}
                              onClick={(event) => handleMenuSectionClick(event, route, sectionId)}
                              aria-current={
                                activeRoute?.key === route.key && activeSectionId === sectionId
                                  ? "location"
                                  : undefined
                              }
                              className={sectionMenuLinkClassName}
                            >
                              {labels.sections[sectionId]}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </>
  );
}
