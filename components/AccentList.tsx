// Lista con acento lateral: cada punto lleva una barra de color a la izquierda, un título y un
// texto debajo. Para contenido en prosa corta que cabe en una pantalla (flujo de trabajo,
// formación...). Para muchas piezas más anchas que la pantalla, ver CardRow.
export type AccentListItem = {
  title: string;
  /** Texto de debajo (descripción, periodo...). */
  text: string;
};

// `className` cambia el ancho máximo (por defecto, una columna de lectura estrecha). El texto crece
// un poco en escritorio (lg), donde hay más sitio.
export default function AccentList({
  items,
  className = "max-w-md",
}: {
  items: readonly AccentListItem[];
  className?: string;
}) {
  return (
    <ul className={`space-y-4 ${className}`}>
      {items.map((item) => (
        <li key={item.title} className="border-l-2 border-primary pl-4">
          <p className="font-medium lg:text-lg">{item.title}</p>
          <p className="text-sm text-muted-foreground lg:text-base">{item.text}</p>
        </li>
      ))}
    </ul>
  );
}
