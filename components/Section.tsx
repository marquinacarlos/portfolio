import type { ReactNode } from "react";

type SectionProps = {
  id?: string;
  /**
   * Texto de esta sección en las migas de pan de arriba (components/Breadcrumbs.tsx). Sin él, la
   * sección no sale en ellas.
   */
  crumb?: string;
  /**
   * Las migas de pan se muestran sobre esta sección aunque ella no sea una miga (por ejemplo,
   * Proyectos en la home, donde las migas son sus tarjetas). Reserva el hueco de la fila. Las
   * secciones con `crumb` ya lo reservan.
   */
  crumbs?: boolean;
  /** Maquetación libre del contenido: flex, grid, gap, alineación... */
  className?: string;
  /**
   * Sección que crece hacia la derecha con su contenido (filas de tarjetas, listas largas).
   * Sin `wide`, mide exactamente una pantalla y el texto se ajusta a ella.
   */
  wide?: boolean;
  children: ReactNode;
};

/**
 * Bloque del pergamino. Separa el MARCO (fijo, igual en todas) del CONTENIDO (libre).
 *
 * Marco, en el <section>:
 * - Alto de pantalla y ancho de pantalla (`w-full`): el texto se ajusta a la pantalla.
 *   Con `wide` pasa a `min-w-full`: como mínimo una pantalla, y crece hacia la derecha si
 *   el contenido es más ancho. (Sin esa distinción, un simple párrafo `max-w-md` ensanchaba
 *   la sección más que la pantalla en móviles estrechos y el texto quedaba cortado.)
 * - Punto de snap (`snap-start`) y `shrink-0` para que el flex no lo aplaste.
 * - Zona segura con padding: arriba la banda de los controles (idioma y tema) y, si se muestran
 *   migas de pan sobre la sección, la de las migas; abajo la del
 *   nav, y a los lados el margen. Las medidas son variables de globals.css.
 * - Sin color propio: todas las secciones comparten el fondo del <body> (--background).
 *
 * Contenido, en el <div> interior: todo lo que pases en `className` se aplica aquí.
 * Como el padding de la zona segura está en otra capa, nada de lo que hagas dentro
 * (ni un p-0) puede meter el contenido debajo del nav.
 */
export default function Section({
  id,
  crumb,
  crumbs = false,
  className = "",
  wide = false,
  children,
}: SectionProps) {
  // Solo las secciones sobre las que se ven las migas reservan su fila: en el resto, el
  // contenido aprovecha el alto (en móviles bajos cada píxel cuenta).
  const reservesCrumbs = crumbs || crumb !== undefined;
  return (
    <section
      id={id}
      data-crumb={crumb}
      className={`h-full ${wide ? "min-w-full" : "w-full"} shrink-0 snap-start px-(--section-gutter) ${reservesCrumbs ? "pt-[calc(var(--controls-height)+var(--crumbs-height))]" : "pt-(--controls-height)"} pb-(--nav-height)`}
    >
      <div className={`h-full ${className}`}>{children}</div>
    </section>
  );
}
