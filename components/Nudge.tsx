"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

const MAX_NUDGES = 10; // avisos por botón en cada visita: llamar la atención, no molestar
const MIN_INTERVAL = 6000; // ms entre un aviso y el siguiente (con algo de azar, para que no
const MAX_INTERVAL = 9000; // parezca un reloj)
const MIN_GAP_BETWEEN_BUTTONS = 3000; // ms mínimos entre avisos de DISTINTOS botones: se turnan

// Cuándo se movió por última vez cualquier botón de la página (compartido por todos los Nudge).
let lastNudgeAt = 0;

type NudgeProps = {
  children: ReactNode;
  /** ms hasta el primer aviso. Darles valores distintos a botones vecinos hace que se turnen. */
  startDelay?: number;
};

/**
 * Llama la atención sobre un botón con un movimiento leve y muy de vez en cuando. Es una pista
 * ESTRATÉGICA (invitar a pulsar la llamada a la acción), no decoración, así que es discreta y
 * se calla pronto:
 * - solo se mueve si el botón está a la vista (IntersectionObserver) y la pestaña está activa;
 * - como mucho MAX_NUDGES veces por visita;
 * - se detiene del todo en cuanto el usuario se acerca, enfoca o toca el botón (ya lo vio);
 * - no hace nada con "reducir movimiento" activado en el sistema.
 *
 * La animación es CSS (@keyframes `attention` en globals.css) y este componente solo cambia un
 * atributo de su propio <span> (data-nudge): no toca los elementos de dentro, así que no puede
 * interferir con la hidratación de React ni con el splash de entrada.
 */
export default function Nudge({ children, startDelay = 6000 }: NudgeProps) {
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const [playing, setPlaying] = useState(false);
  const stopped = useRef(false);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let isVisible = false;
    const observer = new IntersectionObserver(([entry]) => (isVisible = entry.isIntersecting), {
      threshold: 0.9, // el botón entero a la vista, no a medias
    });
    observer.observe(wrapper);

    let nudges = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const schedule = (delay: number) => {
      timer = setTimeout(() => {
        if (stopped.current || nudges >= MAX_NUDGES) return; // se acabó: no se reprograma
        if (isVisible && !document.hidden) {
          // Si otro botón se acaba de mover, esperar a que pase el hueco mínimo y probar de nuevo.
          const wait = lastNudgeAt + MIN_GAP_BETWEEN_BUTTONS - Date.now();
          if (wait > 0) {
            schedule(wait);
            return;
          }
          lastNudgeAt = Date.now();
          nudges += 1;
          setPlaying(true);
        }
        schedule(MIN_INTERVAL + Math.random() * (MAX_INTERVAL - MIN_INTERVAL));
      }, delay);
    };
    schedule(startDelay);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [startDelay]);

  const stop = () => {
    stopped.current = true;
    setPlaying(false);
  };

  return (
    <span
      ref={wrapperRef}
      data-nudge={playing ? "on" : "off"}
      onAnimationEnd={() => setPlaying(false)}
      onPointerEnter={stop}
      onPointerDown={stop}
      onFocus={stop}
      // inline-flex (no inline-block): el botón de dentro pasa a ser un elemento flex, igual que
      // antes de envolverlo. Con inline-block el enlace quedaba "en línea", su relleno vertical no
      // contaba en el alto y el botón se veía más achatado y desalineado con los vecinos.
      className="inline-flex"
    >
      {children}
    </span>
  );
}
