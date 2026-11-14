import type { ReactNode } from "react";

// Estilo único de las tarjetas de la web (proyectos, servicios, blog): mismo ancho y mismo
// aspecto en todas. El alto NO se fija aquí: lo reparte <CardRow>.
export const cardClassName =
  "flex w-72 shrink-0 flex-col gap-3 rounded-2xl border border-border bg-card p-6 text-card-foreground";

/**
 * Fila de tarjetas iguales. `items-stretch` hace que todas midan lo mismo que la más alta: si una
 * tiene más texto, las demás se estiran hasta igualarla, y quedan alineadas arriba y abajo.
 * La fila se centra en vertical dentro de la sección y mide lo que mida su tarjeta más alta
 * (nada de alturas fijas, que dejaban huecos raros o recortaban el contenido).
 */
export default function CardRow({ children }: { children: ReactNode }) {
  // data-stagger-children: el splash de entrada anima las tarjetas una a una (HorizontalScroller).
  return (
    <div data-stagger-children className="flex items-stretch gap-6">
      {children}
    </div>
  );
}
