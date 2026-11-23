// Datos personales que NO cambian con el idioma. Los textos (ubicación, disponibilidad,
// formación...) están en los diccionarios, en `home.contact` y `home.path`.

export const contact = {
  email: "contact@carlosmarquina.dev",
  // Teléfono para WhatsApp, con prefijo de país y sin "+" ni espacios (formato de wa.me).
  whatsappNumber: "34745030680",
  github: "https://github.com/marquinacarlos",
  linkedin: "https://www.linkedin.com/in/marquinacarlos",
};

/** Enlace de WhatsApp con un mensaje ya escrito (el visitante solo tiene que enviarlo). */
export function whatsappLink(message: string) {
  return `https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

// Los dos CV (PDF en public/documents/, generados desde el Markdown con la carpeta `cv`).
// `label` es el nombre del idioma, siempre en su propio idioma (no se traduce). `downloadName`
// es el nombre del archivo que recibe quien lo descarga ("Carlos Marquina EN.pdf"), distinto del
// nombre interno del archivo.
export const cvFiles = [
  {
    code: "EN",
    label: "English",
    href: "/documents/carlos-marquina-en.pdf",
    downloadName: "Carlos Marquina EN.pdf",
  },
  {
    code: "ES",
    label: "Español",
    href: "/documents/carlos-marquina-es.pdf",
    downloadName: "Carlos Marquina ES.pdf",
  },
] as const;

// Nombres de tecnologías: no se traducen. `key` enlaza con `home.stack.categories`.
export const skills = [
  { key: "frontend", items: ["React", "JavaScript", "HTML", "CSS", "TailwindCSS", "Vue"] },
  { key: "backend", items: ["Node.js", "Express", "PostgreSQL", "Python", "FastAPI", "SQL"] },
  { key: "tools", items: ["Git", "GitHub", "GitHub Projects", "Figma", "Docker (basic)"] },
] as const;
