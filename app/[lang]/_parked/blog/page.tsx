import CardRow, { cardClassName } from "@/components/CardRow";
import EndLinks, { routeEndLinks } from "@/components/EndLinks";
import Section from "@/components/Section";
import { getDictionary, getLocale } from "@/i18n/dictionaries";

// Artículos de ejemplo (placeholder), en los diccionarios: blog.posts.
// Pendiente decidir de dónde saldrán los reales.
export default async function Blog() {
  const locale = await getLocale();
  const dictionary = await getDictionary();
  const { blog } = dictionary;

  return (
    <>
      <Section className="flex items-center gap-6" wide>
        <h1 className="w-40 shrink-0 text-4xl font-bold">{blog.title}</h1>
        <CardRow>
          {blog.posts.map((post) => (
            <article key={post.title} className={cardClassName}>
              <time className="text-sm text-muted-foreground">{post.date}</time>
              <h2 className="text-xl font-bold">{post.title}</h2>
            </article>
          ))}
        </CardRow>
      </Section>

      {/* Final del blog: de dónde vienes y a dónde sigue. */}
      <Section className="flex flex-col justify-center">
        <EndLinks links={routeEndLinks(locale, "/blog", dictionary.nav)} />
      </Section>
    </>
  );
}
