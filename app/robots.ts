import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

// /robots.txt: todo el sitio se puede indexar y se indica dónde está el sitemap.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
