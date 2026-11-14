"use client";

import { useId, useRef } from "react";

type CvOption = {
  /** "EN", "ES"... */
  code: string;
  /** Nombre del idioma, en su propio idioma. */
  label: string;
  href: string;
  /** Nombre del archivo que recibe quien descarga. */
  downloadName: string;
};

type CvDownloadProps = {
  buttonLabel: string;
  title: string;
  hint: string;
  closeLabel: string;
  files: readonly CvOption[];
  className?: string;
};

/**
 * Botón "Descargar CV" que abre una ventana modal para elegir el idioma del CV.
 *
 * Usa el elemento nativo <dialog>: con showModal() el navegador se encarga de lo difícil
 * (enfocar dentro, atrapar el foco, cerrar con Escape, tapar el resto de la página y dejar la
 * ventana por encima de todo). Aquí solo añadimos: cerrar al pulsar fuera y al elegir un idioma.
 * Cada opción es un enlace normal con `download`: el navegador descarga el PDF con el nombre
 * que le damos (por ejemplo "Carlos Marquina EN.pdf").
 *
 * Client Component solo por el onClick y la referencia al <dialog>.
 */
export default function CvDownload({ buttonLabel, title, hint, closeLabel, files, className }: CvDownloadProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={() => dialogRef.current?.showModal()}
        className={className}
      >
        {buttonLabel}
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        // Pulsar en el fondo oscuro (que es el propio <dialog>, no su contenido) cierra la ventana.
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
        className="m-auto w-[min(92vw,24rem)] rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-xl backdrop:bg-background/70 backdrop:backdrop-blur-sm"
      >
        <h2 id={titleId} className="text-xl font-bold">
          {title}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{hint}</p>

        <ul className="mt-5 flex flex-col gap-3">
          {files.map((file) => (
            <li key={file.code}>
              <a
                href={file.href}
                download={file.downloadName}
                onClick={() => dialogRef.current?.close()}
                className="flex items-center justify-between gap-4 rounded-xl border border-border px-4 py-3 font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground"
              >
                <span>{file.label}</span>
                <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
                  {file.code}
                </span>
              </a>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          className="mt-4 w-full rounded-xl px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          {closeLabel}
        </button>
      </dialog>
    </>
  );
}
