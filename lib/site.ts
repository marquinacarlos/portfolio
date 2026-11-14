// Datos de la web que usa el SEO (metadatos, sitemap, robots, datos estructurados).

/**
 * Dirección pública de la web. Se puede cambiar con la variable NEXT_PUBLIC_SITE_URL (por
 * ejemplo, para una vista previa). Si no está definida: en producción, el dominio real; en
 * desarrollo, localhost. Así, olvidarse de la variable al desplegar no deja canonical, sitemap y
 * la imagen para compartir apuntando a localhost.
 *
 * OJO: es el dominio SIN "www" porque en Vercel "www" redirige a él. El canonical, el sitemap y
 * la imagen para compartir deben usar la dirección a la que NO se redirige.
 */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.NODE_ENV === "production" ? "https://carlosmarquina.dev" : "http://localhost:3000");

export const siteName = "Carlos Marquina";
