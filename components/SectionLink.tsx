"use client";

import type { ReactNode } from "react";
import { scrollToSection } from "@/lib/scrollToSection";

/**
 * Enlace a una sección de la MISMA página (por ejemplo, de la intro a Contacto). Hace scroll
 * animado hasta ella; sin JS, el `href="#contact"` normal sigue funcionando.
 * Client Component solo porque necesita el onClick.
 */
export default function SectionLink({
  sectionId,
  className,
  children,
}: {
  sectionId: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={`#${sectionId}`}
      onClick={(event) => {
        event.preventDefault();
        scrollToSection(sectionId);
      }}
      className={className}
    >
      {children}
    </a>
  );
}
