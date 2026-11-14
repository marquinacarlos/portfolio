import Link from "next/link";
import CardRow, { cardClassName } from "@/components/CardRow";
import EndLinks, { routeEndLinks } from "@/components/EndLinks";
import Section from "@/components/Section";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localizePath } from "@/lib/i18n";
import { services } from "@/lib/services";

export default async function Services() {
  const locale = await getLocale();
  const dictionary = await getDictionary();
  const { services: text } = dictionary;

  return (
    <>
      <Section className="flex flex-col justify-center gap-4">
        <h1 className="text-5xl font-bold">{text.title}</h1>
        <p className="max-w-md text-lg">{text.intro}</p>
        <p className="max-w-md text-muted-foreground">{text.description}</p>
        <blockquote className="max-w-md border-l-4 border-primary pl-4 italic text-muted-foreground">
          {text.quote}
        </blockquote>
      </Section>

      {/* Más ancha que la pantalla: una tarjeta por servicio, hacia la derecha. */}
      <Section className="flex items-center gap-6" wide>
        <CardRow>
          {services.map((service) => {
            const item = text.items[service.key];
            return (
              <article key={service.key} className={cardClassName}>
                <h2 className="text-2xl font-bold">{item.title}</h2>
                <p className="text-sm text-muted-foreground">{item.description}</p>
                <p>
                  <span className="text-sm text-muted-foreground">{text.from} </span>
                  <span className="text-2xl font-bold text-primary">{service.price}€</span>
                </p>
                <ul className="space-y-1 text-sm">
                  {item.features.map((feature) => (
                    <li key={feature}>✓ {feature}</li>
                  ))}
                </ul>
              </article>
            );
          })}
        </CardRow>
      </Section>

      <Section className="flex flex-col justify-center gap-6">
        <h2 className="text-4xl font-bold">{text.processTitle}</h2>
        <ol className="max-w-md space-y-4">
          {text.steps.map((step, index) => (
            <li key={step.title} className="border-l-2 border-primary pl-4">
              <p className="font-medium">
                {index + 1}. {step.title}
              </p>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </li>
          ))}
        </ol>
        <p className="max-w-md text-sm">
          {text.closing.before}{" "}
          <Link
            href={`${localizePath(locale, "/")}#contact`}
            transitionTypes={["nav-back"]}
            className="underline underline-offset-4 hover:text-primary"
          >
            {text.closing.link}
          </Link>{" "}
          {text.closing.after}
        </p>
      </Section>

      {/* Final de Servicios: la última ruta, así que solo hay "anterior". */}
      <Section className="flex flex-col justify-center">
        <EndLinks links={routeEndLinks(locale, "/services", dictionary.nav)} />
      </Section>
    </>
  );
}
