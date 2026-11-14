import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";
import { projects } from "@/lib/projects";
import { siteUrl } from "@/lib/site";

// /sitemap.xml: la lista de páginas para los buscadores. Cada página sale en los dos idiomas y
// con sus versiones alternativas (hreflang), igual que en las etiquetas de la propia página.
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", ...projects.map((project) => `/projects/${project.slug}`)];

  return paths.flatMap((path) =>
    locales.map((locale) => ({
      url: `${siteUrl}/${locale}${path}`,
      alternates: {
        languages: Object.fromEntries(locales.map((code) => [code, `${siteUrl}/${code}${path}`])),
      },
      priority: path === "" ? 1 : 0.7,
    })),
  );
}
