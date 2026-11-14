import Image from "next/image";
import Link from "next/link";
import AccentList from "@/components/AccentList";
import CardRow, { cardClassName } from "@/components/CardRow";
import CopyEmail from "@/components/CopyEmail";
import CvDownload from "@/components/CvDownload";
import ExternalLink from "@/components/ExternalLink";
import Nudge from "@/components/Nudge";
import ScrollHint from "@/components/ScrollHint";
import Section from "@/components/Section";
import SectionLink from "@/components/SectionLink";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localizePath } from "@/lib/i18n";
import { contact, cvFiles, skills, whatsappLink } from "@/lib/profile";
import { projects } from "@/lib/projects";

// Bloque de la sección de flujo de trabajo: en móvil mide una pantalla (menos los márgenes) y no se
// encoge; en escritorio ancho (lg), un ancho fijo para que quepan dos juntos.
const workflowBlockClassName =
  "flex w-[calc(100vw-2*var(--section-gutter))] shrink-0 flex-col gap-6 lg:w-[34rem]";

// La home es el portafolio breve: seis secciones seguidas en el mismo pergamino.
// El id de cada <Section> es el destino del sub-menú del nav (ver `sectionIds` de la ruta
// "portfolio" en lib/routes.ts).
// Todos los textos salen del diccionario del idioma de la URL (i18n/dictionaries/*.json).
export default async function Home() {
  const locale = await getLocale();
  const dictionary = await getDictionary();
  const { home } = dictionary;

  return (
    <>
      <Section id="intro" className="flex flex-col justify-center">
        <Image
          src="/carlos-marquina-profile-picture-old.png"
          alt="Carlos Marquina"
          width={400}
          height={400}
          priority
          className="mb-4 size-20 rounded-full sm:size-28 short:hidden"
        />
        <p className="text-sm uppercase tracking-widest text-muted-foreground">
          {home.intro.greeting}
        </p>
        <h1 className="mb-1 text-5xl font-bold short:text-4xl">Carlos Marquina</h1>
        <h2 className="max-w-md text-lg font-medium">{home.intro.role}</h2>
        {/* Propuesta de valor: qué soy, cómo trabajo y una prueba concreta. */}
        <p className="mt-3 max-w-md sm:text-lg">{home.intro.pitch}</p>
        <p className="mt-3 max-w-md text-sm text-muted-foreground">
          {home.intro.proof.before}
          <Link
            href={localizePath(locale, "/projects/imeet")}
            transitionTypes={["nav-forward"]}
            className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
          >
            {home.intro.proof.link}
          </Link>
          {home.intro.proof.after}
        </p>
        <p className="mt-3 flex max-w-md items-start gap-2 text-sm">
          <span aria-hidden="true" className="mt-1.5 size-2 shrink-0 rounded-full bg-emerald-500" />
          {home.intro.availability}
        </p>
        {/* Llamadas a la acción: contactar es la principal, el CV la secundaria. */}
        <div className="mt-5 flex flex-wrap gap-3 text-sm font-medium">
          <Nudge startDelay={5000}>
            <SectionLink
              sectionId="contact"
              className="rounded-full bg-primary px-5 py-2 text-primary-foreground transition-opacity hover:opacity-90"
            >
              {home.intro.contactMe}
            </SectionLink>
          </Nudge>
          {/* Abre una ventana para elegir el idioma del CV (ver CvDownload). */}
          <CvDownload
            buttonLabel={home.intro.downloadCv}
            title={home.intro.cvModal.title}
            hint={home.intro.cvModal.hint}
            closeLabel={home.intro.cvModal.close}
            files={cvFiles}
            className="cursor-pointer rounded-full border border-border px-5 py-2 transition-colors hover:bg-accent hover:text-accent-foreground"
          />
        </div>
        <ScrollHint className="mt-12 max-w-md self-end text-lg text-muted-foreground sm:mt-6 sm:mr-20 short:mt-5">{home.intro.scrollHint}</ScrollHint>
      </Section>

      {/* Flujo de trabajo: UNA sola sección con dos bloques de lista (cómo construyo / en equipo).
          En escritorio caben lado a lado en la misma pantalla; en móvil cada bloque ocupa una
          pantalla y el segundo queda a la derecha, dentro de la misma sección (`wide`), como las
          tarjetas de Proyectos. El hueco entre bloques es el doble del margen lateral, para que el
          segundo empiece justo donde empieza una pantalla. */}
      <Section id="workflow" crumbs wide className="flex items-center">
        <div className="flex items-start gap-[calc(2*var(--section-gutter))] lg:gap-20">
          <div className={workflowBlockClassName}>
            <h2 data-crumb={home.workflow.title} className="text-4xl font-bold">
              {home.workflow.title}
            </h2>
            <AccentList items={home.workflow.items.slice(0, 3)} className="max-w-none" />
          </div>
          <div className={workflowBlockClassName}>
            <h2 data-crumb={home.workflow.secondTitle} className="text-4xl font-bold">
              {home.workflow.secondTitle}
            </h2>
            <AccentList items={home.workflow.items.slice(3)} className="max-w-none" />
          </div>
        </div>
      </Section>

      {/* Más ancha que la pantalla: crece hacia la derecha con sus tarjetas. */}
      <Section id="projects" crumbs className="flex items-center gap-6" wide>
        <h2 data-crumb={home.projects.title} className="w-48 shrink-0 text-4xl font-bold">
          {home.projects.title}
        </h2>
        <CardRow>
          {projects.map((project) => {
            const text = dictionary.projects[project.slug];
            return (
              <Link
                key={project.slug}
                data-crumb={text.title}
                href={localizePath(locale, `/projects/${project.slug}`)}
                transitionTypes={["nav-forward"]}
                className={`${cardClassName} transition-colors hover:bg-accent hover:text-accent-foreground`}
              >
                <p className="text-sm text-muted-foreground">{text.date}</p>
                <h3 className="text-2xl font-bold">{text.title}</h3>
                <p>{text.summary}</p>
                {/* mt-auto: el stack siempre queda abajo, aunque otra tarjeta sea más alta */}
                <p className="mt-auto pt-2 text-sm text-muted-foreground">{project.stack.join(" · ")}</p>
              </Link>
            );
          })}
        </CardRow>
      </Section>

      <Section id="stack" className="flex flex-col justify-center gap-6">
        <h2 className="text-4xl font-bold">{home.stack.title}</h2>
        {skills.map((group) => (
          <div key={group.key} className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              {home.stack.categories[group.key]}
            </h3>
            <ul className="flex max-w-md flex-wrap gap-2">
              {group.items.map((skill) => (
                <li
                  key={skill}
                  className="rounded-md bg-secondary px-3 py-1 text-sm text-secondary-foreground"
                >
                  {skill}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Section>

      <Section id="path" className="flex flex-col justify-center gap-6">
        <h2 className="text-4xl font-bold">{home.path.title}</h2>
        <AccentList items={home.path.items.map((item) => ({ title: item.title, text: item.period }))} />
      </Section>

      <Section id="contact" className="flex flex-col justify-center gap-4">
        <h2 className="text-4xl font-bold">{home.contact.title}</h2>
        <p className="max-w-md">{home.contact.text}</p>
        {/* Correo: la dirección arriba (se copia al pulsarla) y debajo el botón que abre el programa de
            correo. Los botones de contacto comparten estilo (con borde): el rojo queda para las
            llamadas a la acción de la primera pantalla y la barra de arriba. */}
        <div className="flex flex-col items-start gap-2">
          <CopyEmail
            email={contact.email}
            label={home.contact.copy.label}
            doneMessage={home.contact.copy.done}
          />
          <Nudge startDelay={4000}>
            <a
              href={`mailto:${contact.email}`}
              className="rounded-full border border-border px-5 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {home.contact.emailCta}
            </a>
          </Nudge>
        </div>
        {/* Alternativa al correo: WhatsApp con un mensaje ya escrito, para quien prefiere no redactar. */}
        <div className="flex flex-col items-start gap-2">
          <p className="max-w-md text-sm text-muted-foreground">{home.contact.whatsapp.lead}</p>
          <Nudge startDelay={8000}>
            <ExternalLink
              href={whatsappLink(home.contact.whatsapp.message)}
              className="rounded-full border border-border px-5 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {home.contact.whatsapp.cta}
            </ExternalLink>
          </Nudge>
        </div>
        <div className="flex flex-wrap gap-3 text-sm font-medium">
          <ExternalLink
            href={contact.github}
            className="rounded-full border border-border px-5 py-2 transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            GitHub
          </ExternalLink>
          <ExternalLink
            href={contact.linkedin}
            className="rounded-full border border-border px-5 py-2 transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            LinkedIn
          </ExternalLink>
        </div>
        <p className="text-sm text-muted-foreground">{home.contact.location}</p>
      </Section>
    </>
  );
}
