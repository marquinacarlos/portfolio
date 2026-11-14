// Datos de la web que usa el SEO (metadatos, sitemap, robots, datos estructurados).

/**
 * Dirección pública de la web. Se puede cambiar con la variable NEXT_PUBLIC_SITE_URL (por
 * ejemplo, para una vista previa). Si no está definida: en producción, el dominio real; en
 * desarrollo, localhost. Así, olvidarse de la variable al desplegar no deja canonical, sitemap y
 * la imagen para compartir apuntando a localhost.
 */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.NODE_ENV === "production" ? "https://www.carlosmarquina.dev" : "http://localhost:3000");

export const siteName = "Carlos Marquina";
