import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import Nav from "@/components/Nav";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { locales } from "@/lib/i18n";
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

// Dirección pública de la web (para que og:image sea una URL absoluta al compartir el enlace).
// Define NEXT_PUBLIC_SITE_URL al desplegar (por ejemplo https://tudominio.dev); sin ella usa
// localhost, que sirve para desarrollar pero no para que lo vea LinkedIn.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary();
  return {
    metadataBase: new URL(siteUrl),
    title: dictionary.meta.title,
    description: dictionary.meta.description,
    // Etiquetas para las vistas previas al compartir. La imagen sale de opengraph-image.tsx.
    openGraph: {
      type: "website",
      siteName: "Carlos Marquina",
      title: dictionary.meta.title,
      description: dictionary.meta.description,
      locale: locale === "es" ? "es_ES" : "en_US",
    },
    twitter: { card: "summary_large_image" },
    // Le dice a los buscadores que cada idioma tiene su versión (hreflang).
    alternates: { languages: Object.fromEntries(locales.map((code) => [code, `/${code}`])) },
  };
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
