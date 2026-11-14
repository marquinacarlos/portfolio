"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { setActiveSection } from "@/lib/activeSection";
import { setCrumbProgress, setCrumbs } from "@/lib/scrollProgress";
import { stripLocale } from "@/lib/i18n";
import { takeSavedScroll } from "@/lib/scrollMemory";

const LINE_HEIGHT = 16; // px por "línea" (Firefox a veces mide la rueda en líneas)
const SCROLL_DURATION = 0.1; // s: cuánto tarda en frenar cada movimiento de la rueda
const GESTURE_GAP = 200; // ms sin rueda a partir de los cuales empieza un gesto nuevo
const SNAP_PROXIMITY = 0.3; // fracción de pantalla: más cerca que esto de un borde, encaja
const SNAP_DURATION = 0.8; // s: cuánto tarda en encajar en la sección
const INTRO_TOTAL_MS = 2500; // el splash (retraso + escalonado + duración) acaba antes; ver globals.css

// Viven fuera del componente para sobrevivir al cambio de página.
// El gesto de rueda actual (un giro, incluida su inercia) puede empezar en una vista y
// seguir llegando a otra: guardamos cuándo empezó para saber a qué vista pertenece.
let lastWheelTime = 0;
let gestureStartTime = 0;

/**
 * Contenedor con scroll solo horizontal, como un pergamino.
 *
 * El navegador hace casi todo:
 * - Scroll horizontal nativo (táctil y trackpad).
 * - Snap por proximidad con CSS en táctil (`pointer-coarse:`).
 *
 * Lo que añadimos:
 * - Convertir la rueda vertical del mouse en scroll horizontal (escritorio).
 * - Snap por proximidad en escritorio, con JS: al terminar el gesto, si un borde de
 *   sección quedó cerca, encaja ahí. No usamos el snap de CSS en escritorio porque
 *   pelea con la animación de GSAP: re-encaja tras cada clic de la rueda y se los "come".
 *
 * Cambiar de vista NO se hace con el scroll: se navega con los enlaces (menú, sub-menú y
 * los enlaces de siguiente/anterior al final de cada vista).
 */
export default function HorizontalScroller({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLElement>(null);

  // Posición inicial de la vista. Layout effect (antes de pintar) para que la transición
  // ya capture la vista en su sitio y no se vea un salto.
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Tras cambiar de idioma: volver al sitio donde estabas (ver lib/scrollMemory.ts).
    const savedScroll = takeSavedScroll(stripLocale(window.location.pathname));
    if (savedScroll !== null) {
      container.scrollLeft = Math.min(savedScroll, container.scrollWidth - container.clientWidth);
      return;
    }

    // Llegando desde un enlace /#seccion (nav desde otra vista): saltar a esa sección.
    const hashTarget = window.location.hash && document.getElementById(window.location.hash.slice(1));
    if (hashTarget) container.scrollLeft = hashTarget.offsetLeft;
  }, []);

  // Scroll spy: qué sección se está viendo, para que el nav marque la activa. Se declara
  // DESPUÉS del efecto de arriba a propósito: así, al montar, lee la posición inicial ya puesta.
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // La sección activa es la que contiene el CENTRO de la pantalla. Funciona igual con
    // secciones de una pantalla y con las anchas (Proyectos): mientras recorres sus tarjetas
    // sigue activa, y la siguiente lo es cuando ya ocupa más de la mitad de la pantalla.
    const updateActiveSection = () => {
      const screenCenter = container.scrollLeft + container.clientWidth / 2;
      // La activa es la última sección CON id que empieza antes del centro. Así, una sección
      // final sin id (la de los enlaces de "siguiente") no deja al nav sin marca: sigue activa
      // la última con id (Contacto).
      let activeSection: HTMLElement | undefined;
      for (const section of Array.from(container.children) as HTMLElement[]) {
        if (section.id && section.offsetLeft <= screenCenter) activeSection = section;
      }
      // Las vistas sin ids (blog, services...) publican null: el nav las marca por la URL.
      setActiveSection(activeSection?.id ?? null);
    };

    // Migas de pan (components/Breadcrumbs.tsx): los elementos marcados con data-crumb. Se muestran
    // por GRUPOS, nunca todos mezclados:
    // - las migas que están DENTRO de una sección (las tarjetas de una sección ancha) forman el
    //   grupo de esa sección, y se muestran mientras esa sección está en el centro de la pantalla;
    // - las migas que SON secciones (<Section crumb="...">, como en un caso de estudio) forman el
    //   grupo de la vista, y se muestran en las secciones que no tienen migas propias dentro.
    // De cada miga: su texto, y cuánto se ha visto = hasta dónde llega el borde derecho de la
    // pantalla sobre ella (0 si aún no ha entrado, 1 si ya se ha visto entera).
    const publishProgress = () => {
      const containerLeft = container.getBoundingClientRect().left;
      const sections = Array.from(container.children) as HTMLElement[];
      const crumbElements = Array.from(container.querySelectorAll<HTMLElement>("[data-crumb]"));

      const sectionCrumbs: HTMLElement[] = [];
      const crumbsBySection = new Map<Element, HTMLElement[]>();
      for (const element of crumbElements) {
        const section = element.closest("section");
        if (!section) continue;
        if (element === section) {
          sectionCrumbs.push(element);
        } else {
          crumbsBySection.set(section, [...(crumbsBySection.get(section) ?? []), element]);
        }
      }

      // La sección que está en el centro de la pantalla decide qué grupo toca.
      const centerX = container.scrollLeft + container.clientWidth / 2;
      let centerSection: HTMLElement | undefined;
      for (const section of sections) {
        if (section.offsetLeft <= centerX) centerSection = section;
      }
      const nested = centerSection ? crumbsBySection.get(centerSection) : undefined;
      const group = nested && nested.length > 1 ? nested : sectionCrumbs;

      const boxes = group.map((element) => {
        const rect = element.getBoundingClientRect();
        return { left: rect.left - containerLeft + container.scrollLeft, width: rect.width };
      });
      setCrumbs(group.map((element) => element.dataset.crumb ?? ""), group);

      const viewStart = container.scrollLeft;
      const viewEnd = viewStart + container.clientWidth;
      const first = boxes[0];
      const last = boxes[boxes.length - 1];
      setCrumbProgress({
        visible: boxes.length > 1 && viewEnd > first.left && viewStart < last.left + last.width,
        fills: boxes.map((box) => Math.min(Math.max((viewEnd - box.left) / box.width, 0), 1)),
      });
    };

    const update = () => {
      updateActiveSection();
      publishProgress();
    };

    // Un cálculo por fotograma como mucho: durante el scroll llegan muchos eventos.
    let frame = 0;
    const scheduleUpdate = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    update();
    // El contenido de dentro puede llegar después de montar (páginas con <Suspense>): al cambiar,
    // se recalcula.
    const observer = new MutationObserver(scheduleUpdate);
    observer.observe(container, { childList: true, subtree: true });
    container.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate); // al cambiar el ancho, cambian las secciones
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      container.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, []);

  // Splash de entrada: al abrir la vista, el contenido entra escalonado (fade + sube un poco).
  //
  // Está hecho con CSS (globals.css), no con GSAP, y este componente solo cambia UN atributo de
  // <main> (data-intro). Motivo: tocar desde JS los elementos de dentro (estilos en línea) cuando
  // aún no han terminado de hidratarse rompe la hidratación de React: las páginas que van dentro
  // de <Suspense> (los casos de estudio) se hidratan más tarde que este componente y daban
  // "hydration mismatch". El <main> sí es de este componente, y cambiarle un atributo es seguro.
  //
  // Estados: "pending" (llega del servidor: el CSS oculta el contenido, así no hay parpadeo) →
  // "run" (el CSS lanza la animación escalonada) → sin atributo (terminó; todo queda visible).
  // Con "reducir movimiento" se salta "run".
  const [introState, setIntroState] = useState<"pending" | "run" | "done">("pending");
  useLayoutEffect(() => {
    const prefersReducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setIntroState("done");
      return;
    }
    setIntroState("run"); // antes de pintar: el contenido pasa de oculto a "entrando", sin saltos
    const timer = setTimeout(() => setIntroState("done"), INTRO_TOTAL_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Desde cuándo esta vista está activa (montada, o vuelta a mostrar por Next). Los gestos
    // que empezaron antes son de la vista anterior: aquí se ignoran.
    const activeSince = performance.now();

    // Destino acumulado de la rueda. Si en cada evento hiciéramos scrollBy desde la
    // posición actual, cada animación suave cortaría la anterior y se perdería distancia.
    let targetScroll = container.scrollLeft;
    // Dónde estaba el scroll al empezar el gesto actual.
    let gestureStartScroll = container.scrollLeft;

    const getMaxScroll = () => container.scrollWidth - container.clientWidth;

    // --- Snap en escritorio ---

    // Puntos donde puede encajar el scroll: el inicio de cada sección y, en las más anchas
    // que la pantalla, también su final (igual que el snap de CSS). Entre esos dos puntos
    // de una sección ancha el scroll queda libre, para poder recorrer su contenido.
    const getSnapPoints = () => {
      const viewportWidth = container.clientWidth;
      const points: number[] = [];
      for (const section of Array.from(container.children) as HTMLElement[]) {
        points.push(section.offsetLeft);
        if (section.offsetWidth > viewportWidth) {
          points.push(section.offsetLeft + section.offsetWidth - viewportWidth);
        }
      }
      return points.map((point) => Math.min(point, getMaxScroll()));
    };

    const snapAfterGesture = (restingPosition: number) => {
      const direction = Math.sign(restingPosition - gestureStartScroll); // 1: avanzó, -1: retrocedió
      if (direction === 0) return;
      const reach = container.clientWidth * SNAP_PROXIMITY;

      // Candidatos: bordes cercanos que están HACIA DONDE TE MOVISTE desde el inicio del gesto
      // (uno que tienes delante, o uno que acabas de pasar). Nunca el borde del que partiste:
      // así un clic suelto de la rueda no se deshace volviendo atrás.
      const candidates = getSnapPoints().filter(
        (point) =>
          (point - gestureStartScroll) * direction > 0 &&
          Math.abs(point - restingPosition) <= reach,
      );
      // Ninguno cerca: se queda donde está (proximidad, no obligatorio).
      if (candidates.length === 0) return;

      const nearest = candidates.reduce((best, point) =>
        Math.abs(point - restingPosition) < Math.abs(best - restingPosition) ? point : best,
      );
      targetScroll = nearest; // el destino ahora es el encaje
      gsap.to(container, {
        scrollLeft: nearest,
        duration: SNAP_DURATION,
        ease: "power2.out",
        overwrite: true, // reemplaza la animación de la rueda: continúa sin corte
      });
    };

    // Cada evento de rueda reinicia la cuenta; cuando pasan GESTURE_GAP ms sin rueda
    // (el gesto terminó, incluida la inercia del trackpad), encaja.
    let snapTimer: ReturnType<typeof setTimeout> | undefined;
    const scheduleSnap = (getRestingPosition: () => number) => {
      clearTimeout(snapTimer);
      snapTimer = setTimeout(() => snapAfterGesture(getRestingPosition()), GESTURE_GAP);
    };

    // --- Rueda ---

    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return; // pinch-zoom del trackpad: lo maneja el navegador

      const isNewGesture = event.timeStamp - lastWheelTime > GESTURE_GAP;
      lastWheelTime = event.timeStamp;
      if (isNewGesture) {
        gestureStartTime = event.timeStamp;
        gestureStartScroll = container.scrollLeft;
      }

      // Restos de un gesto que empezó en otra vista (la inercia sigue llegando tras navegar):
      // se ignoran. Sin esto movían esta vista partiendo de 0 y la devolvían al inicio.
      if (gestureStartTime < activeSince) {
        event.preventDefault();
        return;
      }

      // Si el gesto ya es horizontal (trackpad), el navegador hace el scroll solo.
      // Solo cortamos un encaje en curso (para no pelear con el dedo) y, al terminar, encajamos.
      if (Math.abs(event.deltaX) >= Math.abs(event.deltaY)) {
        gsap.killTweensOf(container);
        scheduleSnap(() => container.scrollLeft);
        return;
      }

      event.preventDefault(); // cancela el scroll vertical...

      const distance =
        event.deltaMode === WheelEvent.DOM_DELTA_LINE ? event.deltaY * LINE_HEIGHT : event.deltaY;
      // Sin animación en marcha, el destino es donde está el scroll ahora (pudo moverlo el
      // nav, el trackpad o la barra). Con animación, seguimos sumando a su destino.
      if (!gsap.isTweening(container)) targetScroll = container.scrollLeft;

      // En los bordes el destino se queda en 0 o en el máximo: no hay nada más que desplazar.
      targetScroll = Math.min(Math.max(targetScroll + distance, 0), getMaxScroll());

      // ...y lo aplica en horizontal. power2.out arranca rápido y frena suave (sin delay);
      // overwrite reemplaza la animación anterior, así cada clic continúa el movimiento.
      gsap.to(container, {
        scrollLeft: targetScroll,
        duration: SCROLL_DURATION,
        ease: "power2.out",
        overwrite: true,
      });

      // Decide el encaje con el destino de la animación (donde va a frenar), no con la
      // posición a mitad de camino.
      scheduleSnap(() => targetScroll);
    };

    // passive: false es obligatorio para poder llamar preventDefault() en la rueda.
    // (El onWheel de React es pasivo, por eso lo registramos a mano.)
    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleWheel);
      clearTimeout(snapTimer);
      gsap.killTweensOf(container); // detiene una animación en curso al desmontar
    };
  }, []);

  return (
    <main
      ref={containerRef}
      data-intro={introState === "done" ? undefined : introState}
      className="flex h-dvh w-full pointer-coarse:snap-x pointer-coarse:snap-proximity overflow-x-auto overflow-y-hidden overscroll-none scrollbar-none"
    >
      {children}
    </main>
  );
}
