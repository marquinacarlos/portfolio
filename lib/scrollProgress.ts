// Migas de pan de la vista actual (components/Breadcrumbs.tsx). Las publica HorizontalScroller
// (que vive dentro de cada vista) y las pinta Breadcrumbs (que vive en el layout y no se
// desmonta al navegar). Mismo patrón que lib/activeSection.ts.
//
// Son dos cosas con ritmos distintos:
// - LAS MIGAS (qué textos hay y en qué orden): cambian pocas veces (al abrir la vista). Se
//   guardan como un snapshot estable, para useSyncExternalStore.
// - EL RELLENO (cuánto se ha visto de cada una) y SI SE MUESTRAN: cambian en cada fotograma del
//   scroll. Se avisa con un callback directo, para no re-renderizar React 60 veces por segundo.

export type Crumbs = {
  /** Texto de cada miga, en el orden en que aparecen en la vista (de izquierda a derecha). */
  labels: readonly string[];
};

export type CrumbProgress = {
  /** 0 → aún no se ve, 1 → ya se ha visto entera. Uno por miga. */
  fills: readonly number[];
  /** Solo se muestran mientras estás recorriendo la zona que cubren. */
  visible: boolean;
};

const emptyCrumbs: Crumbs = { labels: [] };
let crumbs = emptyCrumbs;
// Los elementos de cada miga (para llevar al usuario hasta ellos al pulsarla). No son parte del
// snapshot de React: se actualizan en cada publicación sin avisar.
let crumbElements: readonly HTMLElement[] = [];
let progress: CrumbProgress = { fills: [], visible: false };

const crumbListeners = new Set<() => void>();
const progressListeners = new Set<(progress: CrumbProgress) => void>();

export function setCrumbs(labels: readonly string[], elements: readonly HTMLElement[]) {
  crumbElements = elements;
  const unchanged =
    labels.length === crumbs.labels.length && labels.every((label, index) => label === crumbs.labels[index]);
  if (unchanged) return;
  crumbs = { labels };
  crumbListeners.forEach((listener) => listener());
}

export function setCrumbProgress(next: CrumbProgress) {
  progress = next;
  progressListeners.forEach((listener) => listener(next));
}

/** El elemento al que apunta la miga número `index` (para hacer scroll hasta él). */
export function getCrumbElement(index: number) {
  return crumbElements[index];
}

export function getCrumbs() {
  return crumbs;
}
export function getServerCrumbs() {
  return emptyCrumbs; // el servidor no sabe nada del scroll
}
export function subscribeCrumbs(listener: () => void) {
  crumbListeners.add(listener);
  return () => {
    crumbListeners.delete(listener);
  };
}

/** Para pintar el relleno sin re-render: devuelve el valor actual y avisa de los cambios. */
export function subscribeCrumbProgress(listener: (progress: CrumbProgress) => void) {
  progressListeners.add(listener);
  listener(progress); // valor inicial
  return () => {
    progressListeners.delete(listener);
  };
}
