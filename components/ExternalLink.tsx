import type { AnchorHTMLAttributes } from "react";

/**
 * Enlace a OTRA web: siempre se abre en una pestaña nueva, para que el visitante no pierda esta.
 * Usar este componente en cualquier enlace externo (en vez de un <a> suelto) garantiza la regla.
 * `rel="noopener noreferrer"` es necesario con target="_blank": evita que la otra web pueda
 * controlar esta pestaña (window.opener) y no le envía de dónde vienes.
 */
export default function ExternalLink(props: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "target" | "rel">) {
  return <a {...props} target="_blank" rel="noopener noreferrer" />;
}
