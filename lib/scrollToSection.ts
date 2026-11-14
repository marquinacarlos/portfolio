import gsap from "gsap";

const DURATION = 0.7; // s

/**
 * Desplaza el pergamino horizontal hasta el inicio de una sección, con animación de GSAP.
 *
 * Por qué no `element.scrollIntoView({ behavior: "smooth" })`: en táctil el contenedor tiene
 * scroll-snap por proximidad (CSS), y el scroll suave nativo peleaba con él: tras ir a una
 * sección, el siguiente toque a otra podía no moverse y la web se quedaba "atascada" hasta que
 * el usuario hacía un swipe. Aquí desactivamos el snap mientras dura la animación (la anima
 * GSAP, no el navegador) y lo restauramos al terminar o si algo la interrumpe (rueda, otro clic).
 */
export function scrollToSection(sectionId: string) {
  const section = document.getElementById(sectionId);
  if (section) scrollToElement(section);
}

/**
 * Lo mismo para cualquier elemento del pergamino (por ejemplo una tarjeta, desde las migas de
 * pan). Lo deja a la izquierda de la pantalla: una sección, pegada al borde (ella ya lleva su
 * margen); otro elemento, con el margen lateral de su sección delante.
 */
export function scrollToElement(element: HTMLElement) {
  const container = element.closest("main");
  const section = element.closest("section");
  if (!container || !section) return;

  const gutter = element === section ? 0 : parseFloat(getComputedStyle(section).paddingLeft) || 0;
  const elementLeft = element.getBoundingClientRect().left - container.getBoundingClientRect().left + container.scrollLeft;
  const maxScroll = container.scrollWidth - container.clientWidth;
  const target = Math.min(Math.max(elementLeft - gutter, 0), maxScroll);
  const prefersReducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const restoreSnap = () => {
    container.style.scrollSnapType = "";
  };

  container.style.scrollSnapType = "none";
  gsap.to(container, {
    scrollLeft: target,
    duration: prefersReducedMotion ? 0 : DURATION,
    ease: "power2.inOut",
    overwrite: true, // un clic nuevo reemplaza al anterior sin esperar a que acabe
    onComplete: restoreSnap,
    onInterrupt: restoreSnap,
  });
}
