import type { Metadata, Viewport } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import Nav from "@/components/Nav";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { locales, type Locale } from "@/lib/i18n";
import { contact, skills } from "@/lib/profile";
import { openGraphFor } from "@/lib/seo";
import { siteName, siteUrl } from "@/lib/site";
import { themeInitScript } from "@/lib/theme";
import "../globals.css";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// Este es el layout RAÍZ y vive dentro de [lang]: `lang` es un "root param". Con
// cacheComponents hay que decir qué valores existen para generar esas páginas de antemano.
export function generateStaticParams() {
  return locales.map((locale) => ({ lang: locale }));
}

// Color de la barra del navegador en el móvil: el fondo del tema claro u oscuro.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0b10" },
  ],
};

// Metadatos comunes a todas las páginas. El canonical y las versiones por idioma (hreflang) NO van
// aquí sino en cada página (ver lib/seo.ts): en el layout las heredarían las páginas hijas.
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary();
  return {
    metadataBase: new URL(siteUrl),
    title: dictionary.meta.title,
    description: dictionary.meta.description,
    openGraph: openGraphFor(locale, dictionary.meta.title, dictionary.meta.description),
    twitter: { card: "summary_large_image" },
  };
}

// Datos estructurados (JSON-LD): le dicen a Google, de forma explícita, qué es esta web, quién eres,
// dónde estás y qué perfiles son tuyos (esos enlaces ayudan a que tu nombre se asocie con la web).
// Dos entidades enlazadas por @id: la web (WebSite) y tú (Person, su autor). Solo hechos que ya
// están en la web. Se reemplaza "<" para que el texto nunca pueda cerrar la etiqueta <script>.
function structuredData(locale: Locale, jobTitle: string, description: string) {
  const personId = `${siteUrl}/#person`;
  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: `${siteUrl}/${locale}`,
        name: siteName,
        inLanguage: locale,
        author: { "@id": personId },
      },
      {
        "@type": "Person",
        "@id": personId,
        name: siteName,
        url: `${siteUrl}/${locale}`,
        jobTitle,
        description,
        email: contact.email,
        address: { "@type": "PostalAddress", addressLocality: "Barcelona", addressCountry: "ES" },
        alumniOf: { "@type": "EducationalOrganization", name: "MigraCode Barcelona" },
        knowsAbout: skills.flatMap((group) => [...group.items]),
        knowsLanguage: ["es", "en"],
        sameAs: [contact.github, contact.linkedin],
      },
    ],
  }).replace(/</g, "\\u003c");
}

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const locale = await getLocale();
  const dictionary = await getDictionary();

  return (
    // suppressHydrationWarning: el script de abajo añade la clase `dark` a <html> antes de
    // que React hidrate, así que el HTML del servidor y el del navegador difieren a propósito.
    <html
      lang={locale}
      // className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      className="h-full antialiased overflow-hidden"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: structuredData(locale, dictionary.home.intro.role, dictionary.meta.description),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {/* El nav vive en el layout: no se vuelve a montar al navegar y queda fijo
            encima del scroll, que está en app/[lang]/template.tsx (children). */}
        <Nav labels={dictionary.nav} controls={dictionary.controls} />
        {children}
      </body>
    </html>
  );
}
