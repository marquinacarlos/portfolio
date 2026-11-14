"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, type ReactNode } from "react";

const APPEAR_DELAY = 1.5; // segundos hasta que aparece la pista
const APPEAR_DURATION = 1.2;
const NUDGE_DISTANCE = 6; // px que avanza la flecha en cada vaivén

// Pista de "desplázate": nace invisible (opacity-0) y aparece con un fade tras unos segundos,
// por si el usuario no ha descubierto solo que la web se recorre en horizontal. Lleva una flecha
// hacia la derecha que se mece en bucle para señalar hacia dónde ir. Con "reducir movimiento"
// activado aparece directamente y la flecha se queda quieta.
// useGSAP limpia las animaciones al desmontar el componente (y es seguro con React Strict Mode).
export default function ScrollHint({ children, className }: { children: ReactNode; className?: string }) {
  const hintRef = useRef<HTMLParagraphElement>(null);
  const arrowRef = useRef<SVGSVGElement>(null);

  useGSAP(() => {
    const prefersReducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      gsap.set(hintRef.current, { opacity: 1 });
      return;
    }
    const timeline = gsap.timeline({ delay: APPEAR_DELAY });
    timeline.to(hintRef.current, { opacity: 1, duration: APPEAR_DURATION, ease: "power1.out" });
    // La flecha empieza a mecerse cuando la pista ya se ve (el "<0.6" la arranca antes de que
    // termine el fade, para que el movimiento no parezca un segundo evento aparte).
    timeline.to(
      arrowRef.current,
      { x: NUDGE_DISTANCE, duration: 0.7, ease: "power1.inOut", repeat: -1, yoyo: true },
      "<0.6",
    );
  });

  return (
    <p ref={hintRef} data-intro-skip className={`flex items-center gap-2 opacity-0 ${className ?? ""}`}>
      {children}
      <svg
        ref={arrowRef}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5 shrink-0"
        aria-hidden="true"
      >
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </p>
  );
}
