import type { Dictionary } from "@/i18n/dictionaries";

// Datos de los proyectos que NO cambian con el idioma. Los textos (título, resumen,
// descripción, rol, fecha, puntos del caso de estudio) están en los diccionarios,
// en `projects.<slug>` (i18n/dictionaries/en.json y es.json).

/** Los slugs válidos son las claves de `projects` en el diccionario. */
export type ProjectSlug = keyof Dictionary["projects"];

export type Project = {
  slug: ProjectSlug;
  stack: string[];
  /** Demo en vivo. Si no hay (proyecto en desarrollo), no se muestra el botón. */
  url?: string;
  repoUrl: string;
  inDevelopment?: boolean;
};

export const projects: Project[] = [
  {
    slug: "imeet",
    stack: ["Python", "FastAPI", "PostgreSQL", "React", "TailwindCSS", "Google OAuth"],
    url: "https://imeet-platform.netlify.app/",
    repoUrl: "https://github.com/SlotsForMentoring/Slots",
  },
  {
    slug: "minitweet",
    stack: ["JavaScript", "Vue", "Firebase", "Firestore", "PWA"],
    url: "https://minitweet.netlify.app/",
    repoUrl: "https://github.com/marquinacarlos/minitweet",
  },
  {
    slug: "flowventory",
    stack: ["JavaScript", "React", "Supabase", "SQL", "PostgreSQL"],
    repoUrl: "https://github.com/marquinacarlos/Flowventory-Mini-Backend",
    inDevelopment: true,
  },
];
