import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import BackLink from "@/components/BackLink";
import CardRow, { cardClassName } from "@/components/CardRow";
import EndLinks from "@/components/EndLinks";
import ExternalLink from "@/components/ExternalLink";
import Section from "@/components/Section";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localizePath } from "@/lib/i18n";
import { projects } from "@/lib/projects";

// Ruta dinámica: [slug] en el nombre de la carpeta captura esa parte de la URL.
// /en/projects/imeet → params.slug === "imeet". Un solo archivo para todos.

// Le dice a Next qué slugs existen, para generar estas páginas de antemano (en el build).
// El idioma ([lang]) lo aporta el layout raíz, con su propio generateStaticParams.
export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

type Params = PageProps<"/[lang]/projects/[slug]">["params"];

// Con cacheComponents + partialPrefetching (next.config.ts), leer `params` es leer datos
// de la URL: Next pide hacerlo dentro de <Suspense> para que la navegación no se bloquee.
// <Suspense> no añade ningún elemento al DOM, así que las <section> siguen siendo hijas
// directas del scroller.
export default function ProjectPage({ params }: PageProps<"/[lang]/projects/[slug]">) {
  return (
    <Suspense fallback={null}>
      <ProjectContent params={params} />
    </Suspense>
  );
}

async function ProjectContent({ params }: { params: Params }) {
  const { slug } = await params;
  const project = projects.find((candidate) => candidate.slug === slug);
  if (!project) notFound();

  const locale = await getLocale();
  const dictionary = await getDictionary();
  const { caseStudy } = dictionary;
  const text = dictionary.projects[project.slug];

  // Vecinos en el orden de la lista de proyectos.
  const index = projects.indexOf(project);
  const neighbors = [
    ...(index > 0 ? [{ project: projects[index - 1], direction: "previous" as const }] : []),
    ...(index < projects.length - 1 ? [{ project: projects[index + 1], direction: "next" as const }] : []),
  ];

  return (
    <>
      {/* Texto un poco más pequeño en móvil (text-4xl / text-base): en pantallas bajas el héroe
          es lo más alto de la web y, sin scroll vertical, lo que no cabe se recorta. */}
      <Section crumb={text.title} className="flex flex-col justify-center gap-3 sm:gap-4">
        <p className="text-sm uppercase tracking-widest text-muted-foreground">
          {caseStudy.label}
          {project.inDevelopment ? ` · ${caseStudy.inDevelopment}` : ""}
        </p>
        <h1 className="text-4xl font-bold sm:text-5xl">{text.title}</h1>
        <p className="text-sm text-muted-foreground">
          {["role" in text ? text.role : undefined, text.date].filter(Boolean).join(" · ")}
        </p>
        <p className="max-w-md sm:text-lg">{text.description}</p>
        <ul className="flex max-w-md flex-wrap gap-2">
          {project.stack.map((technology) => (
            <li
              key={technology}
              className="rounded-md bg-secondary px-3 py-1 text-sm text-secondary-foreground"
            >
              {technology}
            </li>
          ))}
        </ul>
        <div className="mt-2 flex flex-wrap gap-4 text-sm font-medium">
          {project.url && (
            <ExternalLink
              href={project.url}
              className="rounded-full bg-primary px-5 py-2 text-primary-foreground"
            >
              {caseStudy.liveDemo}
            </ExternalLink>
          )}
          <ExternalLink
            href={project.repoUrl}
            className="rounded-full border border-border px-5 py-2 transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            {caseStudy.sourceCode}
          </ExternalLink>
        </div>
        {/* Volver, al principio de la vista (y otro igual al final). Genérico: ver BackLink. */}
        <BackLink labels={dictionary.nav} className="mt-1" />
      </Section>

      {/* Más ancha que la pantalla si hay muchos puntos: crece hacia la derecha. */}
      {text.highlights.length > 0 && (
        <Section crumb={caseStudy.whatIDid} className="flex items-center gap-6" wide>
          <h2 className="w-40 shrink-0 text-4xl font-bold">{caseStudy.whatIDid}</h2>
          <CardRow>
            {text.highlights.map((highlight) => (
              <article key={highlight.title} className={cardClassName}>
                <h3 className="text-2xl font-bold">{highlight.title}</h3>
                <p>{highlight.decision}</p>
                <p className="mt-auto pt-2 text-sm text-muted-foreground">
                  <span className="font-semibold uppercase tracking-widest text-foreground">
                    {caseStudy.result}:{" "}
                  </span>
                  {highlight.result}
                </p>
              </article>
            ))}
          </CardRow>
        </Section>
      )}

      {/* Final de la vista: a dónde seguir. Anterior y siguiente según el orden de lib/projects.ts
          (el primero no tiene anterior, el último no tiene siguiente) y siempre una salida. */}
      <Section crumb={caseStudy.keepExploring} className="flex flex-col justify-center gap-8">
        <EndLinks
          links={neighbors.map(({ project: neighbor, direction }) => ({
            href: localizePath(locale, `/projects/${neighbor.slug}`),
            direction,
            caption: direction === "next" ? caseStudy.nextProject : caseStudy.previousProject,
            title: dictionary.projects[neighbor.slug].title,
          }))}
        >
          {/* Cierre comercial: quien llega al final de un caso de estudio está interesado. */}
          <Link
            href={`${localizePath(locale, "/")}#contact`}
            scroll={false}
            transitionTypes={["nav-back"]}
            className="w-fit rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            {caseStudy.contactCta}
          </Link>
          <BackLink labels={dictionary.nav} />
        </EndLinks>
      </Section>
    </>
  );
}
