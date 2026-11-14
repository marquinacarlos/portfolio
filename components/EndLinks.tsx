import Link from "next/link";
import type { ReactNode } from "react";
import type { Dictionary } from "@/i18n/dictionaries";
import { localizePath, type Locale } from "@/lib/i18n";
import { getRouteNeighbors } from "@/lib/routes";

export type EndLinkItem = {
  /** Ruta ya con idioma (usa localizePath en quien lo llama). */
  href: string;
  direction: "previous" | "next";
  /** Línea pequeña de contexto: "Siguiente", "Proyecto anterior"... */
  caption: string;
  /** El NOMBRE del destino (Blog, Flowventory...): es lo que protagoniza el enlace. */
  title: string;
};

// Flechas animadas (los @keyframes están en globals.css):
// - con ratón: se desplazan al pasar por encima del enlace (`group-hover`);
// - en táctil (`pointer-coarse`) no hay hover, así que hacen un vaivén lento en bucle;
// - con "reducir movimiento" no se mueven.
const arrowClassName =
  "inline-block transition-transform duration-300 motion-reduce:animate-none motion-reduce:transition-none";
const arrowForwardClassName =
  "group-hover:translate-x-1.5 group-focus-visible:translate-x-1.5 pointer-coarse:animate-[nudge-forward_2.4s_ease-in-out_infinite]";
const arrowBackClassName =
  "group-hover:-translate-x-1.5 group-focus-visible:-translate-x-1.5 pointer-coarse:animate-[nudge-back_2.4s_ease-in-out_infinite]";

// La MISMA flecha que la pista de scroll de la intro (components/ScrollHint.tsx); la de "anterior"
// es esa misma volteada (-scale-x-100). Mide un poco menos que el texto (em) y va alineada con él.
function Arrow({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`${arrowClassName} size-[0.85em] align-[-0.08em] ${className}`}
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

/** Enlaces a la ruta anterior y siguiente del menú, con el nombre de cada una como título. */
export function routeEndLinks(locale: Locale, routeHref: string, nav: Dictionary["nav"]): EndLinkItem[] {
  const { previous, next } = getRouteNeighbors(routeHref);
  const links: EndLinkItem[] = [];
  if (previous) {
    links.push({
      href: localizePath(locale, previous.href),
      direction: "previous",
      caption: nav.previous,
      title: nav.routes[previous.key],
    });
  }
  if (next) {
    links.push({
      href: localizePath(locale, next.href),
      direction: "next",
      caption: nav.next,
      title: nav.routes[next.key],
    });
  }
  return links;
}

/**
 * Enlaces del final de una vista: a dónde seguir. Cada uno dice el nombre del destino (no un
 * genérico "siguiente"), con una flecha hacia donde se va. `children` va debajo (la salida:
 * "volver a todos los proyectos", por ejemplo).
 *
 * Solo pinta el contenido: quien lo usa lo mete en su <Section>. (No es una sección propia
 * porque una <Section> con id define el sub-menú, y una sin id haría que el nav marcara mal
 * la sección activa al llegar aquí.)
 */
export default function EndLinks({ links, children }: { links: EndLinkItem[]; children?: ReactNode }) {
  return (
    <nav className="flex flex-col gap-8">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          transitionTypes={[link.direction === "next" ? "nav-forward" : "nav-back"]}
          className="group block max-w-md"
        >
          <span className="text-sm text-muted-foreground">{link.caption}</span>
          <span className="block text-3xl font-bold transition-colors group-hover:text-primary group-focus-visible:text-primary">
            {/* Las flechas se mueven (hover / vaivén en táctil) para invitar a pulsar. Son
                decorativas: el destino ya lo dice el nombre. */}
            {link.direction === "previous" && (
              <Arrow className={`${arrowBackClassName} mr-3 -scale-x-100`} />
            )}
            {/* Subrayado que crece de izquierda a derecha al pasar el ratón o enfocar. */}
            <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_2px] bg-bottom-left bg-no-repeat pb-0.5 transition-[background-size] duration-300 group-hover:bg-[length:100%_2px] group-focus-visible:bg-[length:100%_2px]">
              {link.title}
            </span>
            {link.direction === "next" && (
              <Arrow className={`${arrowForwardClassName} ml-3`} />
            )}
          </span>
        </Link>
      ))}
      {children}
    </nav>
  );
}
