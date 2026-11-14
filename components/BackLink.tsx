"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import type { Dictionary } from "@/i18n/dictionaries";
import { localizePath, type Locale } from "@/lib/i18n";
import { getActiveRoute, getParentSection, getTransitionType } from "@/lib/routes";

/**
 * Enlace de volver (text link) para CUALQUIER página hija: lo deduce de la URL, no se escribe a
 * mano. Lleva a la sección de la que cuelga la vista actual (/projects/imeet → Proyectos), con
 * la transición hacia atrás. Qué páginas cuelgan de qué sección se define en `childPages`
 * (lib/routes.ts); una página hija nueva lo tiene sin tocar nada aquí.
 * En una vista que no es hija de nada, no pinta nada.
 *
 * Client Component porque necesita la URL actual (usePathname). Los textos llegan por props.
 */
export default function BackLink({ labels, className = "" }: { labels: Dictionary["nav"]; className?: string }) {
  const { lang } = useParams<{ lang: Locale }>();
  const pathname = usePathname();
  const route = getActiveRoute(pathname);
  const parentSection = getParentSection(pathname);
  if (!route || !parentSection) return null;

  const transition = getTransitionType(pathname, route.href);
  return (
    <Link
      href={`${localizePath(lang, route.href)}#${parentSection}`}
      scroll={false}
      transitionTypes={transition ? [transition] : undefined}
      className={`w-fit text-sm text-muted-foreground underline underline-offset-4 transition-colors hover:text-primary ${className}`}
    >
      {labels.backTo} {labels.sections[parentSection]}
    </Link>
  );
}
