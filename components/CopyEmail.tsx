"use client";

import { useEffect, useRef, useState } from "react";

type CopyEmailProps = {
  email: string;
  /** Nombre accesible del botón (para lectores de pantalla): "Copiar correo al portapapeles". */
  label: string;
  /** Mensaje que sale al copiar: "Copiado al portapapeles". */
  doneMessage: string;
};

const MESSAGE_DURATION = 2000; // ms que se ve el mensaje de copiado

// Copia texto al portapapeles. `navigator.clipboard` solo existe en páginas seguras (https o
// localhost): si abres la web desde el móvil por la red local (http://192.168...) no está, y
// entonces se usa el método antiguo (un <textarea> temporal + execCommand).
async function copyToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  document.body.removeChild(textarea);
  if (!copied) throw new Error("No se pudo copiar");
}

/**
 * Dirección de correo que se copia al portapapeles al pulsarla, con un mensaje de confirmación.
 * El mensaje ocupa el MISMO sitio que el correo (los dos textos están apilados en una celda de
 * rejilla y uno se oculta), así que el botón no cambia de ancho ni mueve lo de alrededor.
 * `aria-live` hace que un lector de pantalla anuncie "Copiado al portapapeles".
 */
export default function CopyEmail({ email, label, doneMessage }: CopyEmailProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const handleClick = async () => {
    try {
      await copyToClipboard(email);
    } catch {
      return; // si el navegador no deja copiar, no se afirma que se copió
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), MESSAGE_DURATION);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`${label}: ${email}`}
      className="inline-grid cursor-pointer items-center rounded-md bg-secondary px-3 py-1.5 text-sm text-secondary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      {/* Los dos estados en la misma celda: uno visible y el otro invisible (mantiene el ancho). */}
      <span
        className={`col-start-1 row-start-1 flex items-center gap-2 ${copied ? "invisible" : ""}`}
        aria-hidden={copied}
      >
        {email}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-4 shrink-0"
          aria-hidden="true"
        >
          <rect x="9" y="9" width="12" height="12" rx="2" />
          <path d="M5 15V5a2 2 0 0 1 2-2h10" />
        </svg>
      </span>
      <span
        role="status"
        aria-live="polite"
        className={`col-start-1 row-start-1 flex items-center gap-2 font-medium text-foreground ${copied ? "" : "invisible"}`}
      >
        {copied && (
          <>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-4 shrink-0 text-primary"
              aria-hidden="true"
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
            {doneMessage}
          </>
        )}
      </span>
    </button>
  );
}
