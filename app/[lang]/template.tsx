"use client";

import { ViewTransition, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import HorizontalScroller from "@/components/HorizontalScroller";

// Archivo especial de Next.js: lo que cuenta es el NOMBRE del archivo (template.tsx),
// no el de la función. Next lo pone entre layout.tsx y cada page.tsx.
//
// Next ya le da un `key` por ruta, pero solo por su propio segmento (aquí, [lang]): de /en/blog
// a /en/services no se volvería a montar. Por eso ponemos nosotros key={pathname}: cada URL
// distinta monta un scroller nuevo (scroll desde 0) y dispara enter/exit de la transición.
//
// El tipo de transición lo pone quien navega (Link o router.push con transitionTypes);
// sin tipo, no hay animación.
export default function RootTemplate({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <ViewTransition
      key={pathname}
      enter={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      exit={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      default="none"
    >
      <HorizontalScroller>{children}</HorizontalScroller>
    </ViewTransition>
  );
}
