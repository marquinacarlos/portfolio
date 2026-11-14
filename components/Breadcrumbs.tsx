"use client";

import { Fragment, useEffect, useRef, useSyncExternalStore } from "react";
import { scrollToElement } from "@/lib/scrollToSection";
import {
  getCrumbElement,
  getCrumbs,
  getServerCrumbs,
  subscribeCrumbProgress,
  subscribeCrumbs,
} from "@/lib/scrollProgress";

/**
 * Migas de pan de la vista, como las de VS Code: "Projects / IMeet / Minitweet / Flowventory".
 * Salen de los elementos marcados con data-crumb (una <Section crumb="..."> o cualquier elemento),
 * en el orden en que aparecen de izquierda a derecha. Sirven de pista: si ves migas por delante,
 * hay más cosas hacia la derecha. Funcionan como barra de progreso: cada miga se va coloreando
 * (en el color primario) a medida que la ves. Y son clicables: pulsar una lleva hasta ella.
 *
 * Solo se muestran mientras recorres la zona que cubren (por ejemplo, las tarjetas de proyectos
 * en la home). Fuera de ella la fila está oculta (visibility), así que tampoco captura toques.
 * Las migas cambian pocas veces (React); el relleno cambia en cada fotograma del scroll, así que
 * se escribe directamente en el DOM (una variable CSS) con refs, sin re-renderizar.
 */
export default function Breadcrumbs({ label }: { label: string }) {
  const { labels } = useSyncExternalStore(subscribeCrumbs, getCrumbs, getServerCrumbs);
  const rowRef = useRef<HTMLElement>(null);
  const crumbRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Cada vez que cambian las migas hay elementos nuevos: volver a suscribirse al relleno.
  useEffect(() => {
    return subscribeCrumbProgress(({ fills, visible }) => {
      if (rowRef.current) rowRef.current.dataset.visible = String(visible);
      fills.forEach((fill, index) => {
        crumbRefs.current[index]?.style.setProperty("--fill", `${Math.round(fill * 100)}%`);
      });
    });
  }, [labels]);

  if (labels.length < 2) return null; // una sola miga no indica nada que recorrer

  return (
    <nav
      ref={rowRef}
      aria-label={label}
      data-visible="false"
      className="pointer-events-none invisible fixed inset-x-0 top-(--controls-height) z-10 flex h-(--crumbs-height) items-center overflow-hidden px-(--section-gutter) text-xs font-medium whitespace-nowrap opacity-0 transition-[opacity,visibility] duration-300 data-[visible=true]:visible data-[visible=true]:opacity-100 [view-transition-name:site-breadcrumbs]"
    >
      {labels.map((crumbLabel, index) => (
        <Fragment key={`${index}-${crumbLabel}`}>
          {index > 0 && (
            <span aria-hidden="true" className="px-0.5 text-muted-foreground/50">
              /
            </span>
          )}
          <button
            type="button"
            ref={(element) => {
              crumbRefs.current[index] = element;
            }}
            onClick={() => {
              const target = getCrumbElement(index);
              if (target) scrollToElement(target);
            }}
            // El texto se "colorea" con un degradado duro (ver .crumb-fill en globals.css).
            // pointer-events-auto: la fila no captura toques, pero cada miga sí. El relleno vertical
            // (py) agranda el área de toque sin cambiar el aspecto.
            className="crumb-fill pointer-events-auto cursor-pointer px-0.5 py-1.5 transition-opacity hover:opacity-70"
          >
            {crumbLabel}
          </button>
        </Fragment>
      ))}
    </nav>
  );
}
