import HorizontalScroller from "@/components/HorizontalScroller";

// Placeholder sections. Each one fills the viewport; content comes later.
const sections = [
  { id: "section-1", color: "bg-rose-500" },
  { id: "section-2", color: "bg-amber-400" },
  { id: "section-3", color: "bg-emerald-500" },
  { id: "section-4", color: "bg-sky-500" },
  { id: "section-5", color: "bg-violet-500" },
];

export default function Home() {
  return (
    <HorizontalScroller>
      {sections.map((section) => (
        <section
          key={section.id}
          id={section.id}
          className={`h-full w-full shrink-0 snap-start ${section.color}`}
        />
      ))}
    </HorizontalScroller>
  );
}
