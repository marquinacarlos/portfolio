"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";

const LINE_HEIGHT = 16; // px por "línea" (Firefox a veces mide la rueda en líneas)
const SCROLL_DURATION = 0.5; // s: cuánto tarda en frenar cada movimiento de la rueda
const GESTURE_GAP = 200; // ms sin rueda a partir de los cuales empieza un gesto nuevo

/**
 * Contenedor con scroll solo horizontal, como un pergamino.
 *
 * El navegador hace casi todo:
 * - Scroll horizontal nativo (táctil y trackpad).
 * - Snap por proximidad con CSS, solo en táctil (`pointer-coarse:`). En escritorio no hay
 *   snap: el de Chrome atrae en un ~30% de pantalla y se "comía" los clics de la rueda.
 *
 * Lo único que añadimos: convertir la rueda vertical del mouse en scroll horizontal.
 */
export default function HorizontalScroller({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Destino acumulado del gesto. Si en cada evento hiciéramos scrollBy desde la
    // posición actual, cada animación suave cortaría la anterior y se perdería distancia.
    let targetScroll = 0;
    let lastWheelTime = 0;

    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return; // pinch-zoom del trackpad: lo maneja el navegador

      // Si el gesto ya es horizontal (trackpad), el navegador lo hace solo.
      if (Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;

      event.preventDefault(); // cancela el scroll vertical...

      // Gesto nuevo: partimos de donde está el scroll realmente (quizá ajustado por el snap).
      if (event.timeStamp - lastWheelTime > GESTURE_GAP) targetScroll = container.scrollLeft;
      lastWheelTime = event.timeStamp;

      const distance =
        event.deltaMode === WheelEvent.DOM_DELTA_LINE ? event.deltaY * LINE_HEIGHT : event.deltaY;
      const maxScroll = container.scrollWidth - container.clientWidth;
      targetScroll = Math.min(Math.max(targetScroll + distance, 0), maxScroll);

      // ...y lo aplica en horizontal. power2.out arranca rápido y frena suave (sin delay);
      // overwrite reemplaza la animación anterior, así cada clic continúa el movimiento.
      gsap.to(container, {
        scrollLeft: targetScroll,
        duration: SCROLL_DURATION,
        ease: "power2.out",
        overwrite: true,
      });
    };

    // passive: false es obligatorio para poder llamar preventDefault() en la rueda.
    // (El onWheel de React es pasivo, por eso lo registramos a mano.)
    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleWheel);
      gsap.killTweensOf(container); // detiene una animación en curso al desmontar
    };
  }, []);

  return (
    <main
      ref={containerRef}
      className="flex h-dvh w-full pointer-coarse:snap-x pointer-coarse:snap-proximity overflow-x-auto overflow-y-hidden overscroll-none scrollbar-none"
    >
      {children}
    </main>
  );
}
