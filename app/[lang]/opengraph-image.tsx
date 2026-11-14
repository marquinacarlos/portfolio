import { ImageResponse } from "next/og";
import en from "@/i18n/dictionaries/en.json";
import es from "@/i18n/dictionaries/es.json";

// Imagen que se ve al compartir el enlace (LinkedIn, WhatsApp, Slack...). Next la sirve en
// /<lang>/opengraph-image y añade solo la etiqueta og:image. Se genera con JSX + CSS (satori),
// que no entiende `oklch`: los colores son aproximaciones en hex de los tokens de globals.css.
export const alt = "Carlos Marquina, Full-Stack Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const dictionaries = { en, es } as const;

export default async function OpenGraphImage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const { home } = dictionaries[lang === "es" ? "es" : "en"];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "#0f0b10", // --background (modo oscuro)
          color: "#fafafa", // --foreground
        }}
      >
        <div style={{ fontSize: 30, letterSpacing: 6, color: "#a8a0aa", textTransform: "uppercase" }}>
          {home.intro.greeting}
        </div>
        <div style={{ fontSize: 104, fontWeight: 700, marginTop: 8 }}>Carlos Marquina</div>
        <div style={{ fontSize: 44, marginTop: 8, color: "#fafafa" }}>{home.intro.role}</div>
        <div
          style={{
            display: "flex",
            marginTop: 48,
            width: 120,
            height: 8,
            borderRadius: 4,
            background: "#be123c", // --primary
          }}
        />
        <div style={{ fontSize: 30, marginTop: 40, color: "#a8a0aa", maxWidth: 960 }}>
          {home.intro.availability}
        </div>
      </div>
    ),
    size,
  );
}
