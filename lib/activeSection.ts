// Qué sección de la home se está viendo ahora mismo. Lo escribe el scroller (que es quien sabe
// dónde está el scroll) y lo lee el nav (que vive en el layout, fuera del scroller, y no tiene
// otra forma de enterarse). Es un mini "store" compatible con useSyncExternalStore.

let activeSectionId: string | null = null;
const listeners = new Set<() => void>();

export function setActiveSection(id: string | null) {
  if (id === activeSectionId) return;
  activeSectionId = id;
  listeners.forEach((listener) => listener());
}

export function getActiveSection() {
  return activeSectionId;
}

export function subscribeActiveSection(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
